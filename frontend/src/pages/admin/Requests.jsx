import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios";

const TABS = [
  { key: "open", label: "Open" },
  { key: "fulfilled", label: "Fulfilled" },
  { key: "declined", label: "Declined" },
];

export default function Requests() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get("status");
  const tab = TABS.some((t) => t.key === statusParam) ? statusParam : "open";

  // "key" records which tab these results belong to, so loading = (results are for another tab)
  const [result, setResult] = useState({ key: null, requests: [], counts: { open: 0, fulfilled: 0, declined: 0 }, error: "" });
  const loading = result.key !== tab;

  const [resolving, setResolving] = useState(null); // { id, status } while the note box is open
  const [note, setNote] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState({ type: "", text: "" });

  useEffect(() => {
    let active = true;
    api
      .get("/requests", { params: { status: tab } })
      .then(
        ({ data }) =>
          active && setResult({ key: tab, requests: data.requests, counts: data.counts, error: "" })
      )
      .catch(
        (err) =>
          active &&
          setResult((r) => ({ ...r, key: tab, requests: [], error: getErrorMessage(err) }))
      );
    return () => {
      active = false;
    };
  }, [tab]);

  const openPanel = (id, status) => {
    setResolving({ id, status });
    setNote("");
    setNotice({ type: "", text: "" });
  };

  const confirm = async (request) => {
    setBusyId(request._id);
    setNotice({ type: "", text: "" });
    try {
      await api.patch(`/requests/${request._id}`, { status: resolving.status, adminNote: note.trim() });
      setResult((r) => ({
        ...r,
        requests: r.requests.filter((x) => x._id !== request._id),
        counts: { ...r.counts, open: r.counts.open - 1, [resolving.status]: r.counts[resolving.status] + 1 },
      }));
      setNotice({ type: "success", text: `"${request.title}" was marked ${resolving.status}.` });
      setResolving(null);
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  const { requests, counts, error } = result;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/admin" className="text-sm font-medium text-primary hover:underline">
        &larr; Back to dashboard
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-primary">Book requests</h1>
      <p className="mt-1 text-sm text-muted">Books that readers asked for. The reader is emailed when you answer.</p>

      <div role="tablist" aria-label="Request status" className="mt-6 flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setSearchParams(t.key === "open" ? {} : { status: t.key })}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
            <span className="ml-1.5 rounded-full bg-soft px-2 py-0.5 text-xs">{counts[t.key]}</span>
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
              <div key={i} className="h-24 animate-pulse rounded-xl bg-soft" />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="rounded-lg bg-red-50 px-4 py-6 text-center text-red-700">
            {error}
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-xl bg-soft px-4 py-14 text-center">
            <p className="text-lg font-semibold text-primary">
              {tab === "open" ? "No open requests" : `No ${tab} requests`}
            </p>
            <p className="mt-1 text-sm text-muted">
              {tab === "open" ? "You are all caught up." : "Nothing here yet."}
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {requests.map((r) => {
              const panel = resolving?.id === r._id ? resolving : null;
              const busy = busyId === r._id;
              const needsNote = panel?.status === "declined";

              return (
                <li key={r._id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <h2 className="font-semibold text-ink">{r.title}</h2>
                  <p className="text-sm text-muted">
                    {r.author ? `${r.author} · ` : ""}
                    <span className="capitalize">{r.language}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    From {r.user?.name || "a deleted user"} ({r.user?.email || "no email"}) ·{" "}
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                  {r.note && <p className="mt-2 text-sm">{r.note}</p>}

                  {tab !== "open" && r.adminNote && (
                    <p className="mt-2 rounded-lg bg-soft px-3 py-1.5 text-sm">
                      <span className="font-semibold">Your reply:</span> {r.adminNote}
                    </p>
                  )}

                  {tab === "open" &&
                    (panel ? (
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <label className="block text-sm font-medium">
                          {needsNote ? "Reason for declining" : "Note for the reader"}{" "}
                          {!needsNote && <span className="font-normal text-muted">(optional)</span>}
                          <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                            maxLength={300}
                            autoFocus
                            placeholder={
                              needsNote
                                ? "For example: not available in digital form, or protected by copyright"
                                : "For example: added today, search for the title"
                            }
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </label>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => confirm(r)}
                            disabled={busy || (needsNote && !note.trim())}
                            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                              needsNote ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary-dark"
                            }`}
                          >
                            {busy ? "Saving..." : needsNote ? "Confirm decline" : "Confirm fulfilled"}
                          </button>
                          <button
                            onClick={() => setResolving(null)}
                            disabled={busy}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-soft"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
                        <Link
                          to={`/browse?q=${encodeURIComponent(r.title)}`}
                          className="mr-2 text-sm font-medium text-primary hover:underline"
                        >
                          Check the library
                        </Link>
                        <button
                          onClick={() => openPanel(r._id, "fulfilled")}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                        >
                          Mark fulfilled
                        </button>
                        <button
                          onClick={() => openPanel(r._id, "declined")}
                          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          Decline
                        </button>
                      </div>
                    ))}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}