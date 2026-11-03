import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";

const TABS = [
  { key: "reading", label: "Reading" },
  { key: "want", label: "Want to read" },
  { key: "completed", label: "Completed" },
];

const SHELF_LABEL = { want: "Want to read", reading: "Reading", completed: "Completed" };

const EMPTY = {
  reading: ["Nothing in progress", "Open a book and press Read online. It will show up here with your progress."],
  want: ["Your wish list is empty", "On any book page, choose Want to read to save it for later."],
  completed: ["No finished books yet", "Books you finish will be collected here."],
};

export default function MyLibrary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab = TABS.some((t) => t.key === tabParam) ? tabParam : "reading";

  const [state, setState] = useState({ loading: true, items: [], error: "" });
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState({ type: "", text: "" });

  useEffect(() => {
    let active = true;
    api
      .get("/library")
      .then(({ data }) => active && setState({ loading: false, items: data.items, error: "" }))
      .catch((err) => active && setState({ loading: false, items: [], error: getErrorMessage(err) }));
    return () => {
      active = false;
    };
  }, []);

  const move = async (item, status) => {
    if (status === item.status) return;
    setNotice({ type: "", text: "" });
    setBusyId(item.book._id);
    try {
      const { data } = await api.put(`/library/${item.book._id}`, { status });
      setState((s) => ({
        ...s,
        items: s.items.map((i) => (i.book._id === item.book._id ? { ...i, ...data.entry } : i)),
      }));
      setNotice({ type: "success", text: `"${item.book.title}" moved to ${SHELF_LABEL[status]}.` });
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Remove "${item.book.title}" from your library? Your saved page will be forgotten.`)) return;
    setNotice({ type: "", text: "" });
    setBusyId(item.book._id);
    try {
      await api.delete(`/library/${item.book._id}`);
      setState((s) => ({ ...s, items: s.items.filter((i) => i.book._id !== item.book._id) }));
      setNotice({ type: "success", text: `"${item.book.title}" was removed.` });
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  const { loading, items, error } = state;
  const counts = { reading: 0, want: 0, completed: 0 };
  items.forEach((i) => (counts[i.status] += 1));
  const shown = items.filter((i) => i.status === tab);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-primary">My library</h1>
      <p className="mt-1 text-sm text-muted">Everything you are reading, plan to read, and have finished.</p>

      <div role="tablist" aria-label="Shelves" className="mt-6 flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setSearchParams(t.key === "reading" ? {} : { tab: t.key })}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
            {!loading && <span className="ml-1.5 rounded-full bg-soft px-2 py-0.5 text-xs">{counts[t.key]}</span>}
          </button>
        ))}
      </div>

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

      <div className="mt-6" aria-live="polite">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-soft" />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="rounded-lg bg-red-50 px-4 py-6 text-center text-red-700">
            {error}
          </div>
        ) : shown.length === 0 ? (
          <div className="rounded-xl bg-soft px-4 py-16 text-center">
            <p className="text-lg font-semibold text-primary">{EMPTY[tab][0]}</p>
            <p className="mt-1 text-sm text-muted">{EMPTY[tab][1]}</p>
            <Link to="/browse" className="mt-4 inline-block font-semibold text-primary underline">
              Browse books
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {shown.map((item) => {
              const { book } = item;
              const busy = busyId === book._id;

              return (
                <li key={book._id} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <Link to={`/books/${book._id}`} className="h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-soft">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary p-1 text-center text-[10px] font-bold text-white">
                        {book.title}
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold text-ink">
                      <Link to={`/books/${book._id}`} className="hover:text-primary hover:underline">
                        {book.title}
                      </Link>
                    </h2>
                    <p className="truncate text-sm text-muted">
                      {book.author} &middot; <span className="capitalize">{book.language}</span>
                    </p>

                    {item.status === "reading" && (
                      <div className="mt-2">
                        {item.percent !== null ? (
                          <>
                            <div className="h-2 overflow-hidden rounded-full bg-soft">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${item.percent}%` }} />
                            </div>
                            <p className="mt-1 text-xs text-muted">
                              {item.percent}% complete &middot; page {item.page}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-muted">You are on page {item.page}.</p>
                        )}
                      </div>
                    )}

                    {item.status === "completed" && (
                      <p className="mt-2 text-xs font-medium text-green-700">
                        &#10003; Finished
                        {item.completedAt && <> on {new Date(item.completedAt).toLocaleDateString()}</>}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <Link
                        to={`/read/${book._id}`}
                        className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark"
                      >
                        {item.status === "reading"
                          ? `Continue (page ${item.page})`
                          : item.status === "want"
                          ? "Start reading"
                          : "Read again"}
                      </Link>

                      <label className="text-sm">
                        <span className="sr-only">Move {book.title} to another shelf</span>
                        <select
                          value={item.status}
                          onChange={(e) => move(item, e.target.value)}
                          disabled={busy}
                          className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-primary disabled:opacity-60"
                        >
                          {TABS.map((t) => (
                            <option key={t.key} value={t.key}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button
                        onClick={() => remove(item)}
                        disabled={busy}
                        className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}