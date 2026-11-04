import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";

const LANGUAGES = ["pashto", "urdu", "english", "arabic", "persian"];

const STATUS_STYLES = {
  open: "bg-amber-100 text-amber-800",
  fulfilled: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
};
const STATUS_LABEL = { open: "Open", fulfilled: "Fulfilled", declined: "Declined" };

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

const emptyForm = { title: "", author: "", language: "", note: "" };

export default function RequestBook() {
  const [state, setState] = useState({ loading: true, requests: [], error: "" });
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState({ type: "", text: "" });

  useEffect(() => {
    let active = true;
    api
      .get("/requests/mine")
      .then(({ data }) => active && setState({ loading: false, requests: data.requests, error: "" }))
      .catch((err) => active && setState({ loading: false, requests: [], error: getErrorMessage(err) }));
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice({ type: "", text: "" });
    setSubmitting(true);
    try {
      const { data } = await api.post("/requests", form);
      setState((s) => ({ ...s, requests: [data.request, ...s.requests] }));
      setForm(emptyForm);
      setNotice({ type: "success", text: "Request sent. We will email you when it is answered." });
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (request) => {
    const message =
      request.status === "open" ? `Cancel your request for "${request.title}"?` : `Remove "${request.title}" from your list?`;
    if (!window.confirm(message)) return;

    setNotice({ type: "", text: "" });
    setBusyId(request._id);
    try {
      await api.delete(`/requests/${request._id}`);
      setState((s) => ({ ...s, requests: s.requests.filter((r) => r._id !== request._id) }));
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  const { loading, requests, error } = state;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-primary">Request a book</h1>
      <p className="mt-1 text-sm text-muted">
        Cannot find a book in the library? Tell us what you are looking for and we will try to add it. Please
        search the <Link to="/browse" className="font-semibold text-primary underline">library</Link> first.
      </p>

      {notice.text && (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            notice.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800"
          }`}
        >
          {notice.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <label className="block text-sm font-medium">
          Book title *
          <input name="title" value={form.title} onChange={handleChange} required maxLength={200} className={inputClass} />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Author <span className="font-normal text-muted">(if you know it)</span>
            <input name="author" value={form.author} onChange={handleChange} maxLength={100} className={inputClass} />
          </label>

          <label className="block text-sm font-medium">
            Language *
            <select name="language" value={form.language} onChange={handleChange} required className={inputClass}>
              <option value="">Choose a language</option>
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm font-medium">
          Anything else we should know? <span className="font-normal text-muted">(edition, year, where you heard of it)</span>
          <textarea name="note" value={form.note} onChange={handleChange} rows={3} maxLength={500} className={inputClass} />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {submitting ? "Sending..." : "Send request"}
        </button>
      </form>

      <h2 className="mt-10 text-lg font-bold text-ink">Your requests</h2>
      <div className="mt-3" aria-live="polite">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-soft" />
            ))}
          </div>
        ) : error ? (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-4 text-sm text-red-700">
            {error}
          </p>
        ) : requests.length === 0 ? (
          <p className="rounded-xl bg-soft px-4 py-10 text-center text-sm text-muted">
            You have not requested any books yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {requests.map((r) => (
              <li key={r._id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-ink">{r.title}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[r.status]}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
                <p className="text-sm text-muted">
                  {r.author ? `${r.author} · ` : ""}
                  <span className="capitalize">{r.language}</span> · Requested {new Date(r.createdAt).toLocaleDateString()}
                </p>
                {r.note && <p className="mt-2 text-sm">{r.note}</p>}

                {r.status !== "open" && r.adminNote && (
                  <p
                    className={`mt-2 rounded-lg px-3 py-1.5 text-sm ${
                      r.status === "fulfilled" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
                    }`}
                  >
                    <span className="font-semibold">Reply:</span> {r.adminNote}
                  </p>
                )}

                <div className="mt-3 flex gap-4 text-sm font-medium">
                  {r.status === "fulfilled" && (
                    <Link to={`/browse?q=${encodeURIComponent(r.title)}`} className="text-primary hover:underline">
                      Find it in the library
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(r)}
                    disabled={busyId === r._id}
                    className="text-red-600 hover:underline disabled:opacity-50"
                  >
                    {busyId === r._id ? "Removing..." : r.status === "open" ? "Cancel request" : "Remove"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}