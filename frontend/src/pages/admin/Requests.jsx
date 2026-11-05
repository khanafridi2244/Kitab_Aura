import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios";

const TABS = [
  { key: "open", label: "Open" },
  { key: "seeking_copy", label: "Seeking Copy from Users" },
  { key: "fulfilled", label: "Fulfilled" },
  { key: "declined", label: "Declined" },
];

export default function Requests() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get("status");
  const tab = TABS.some((t) => t.key === statusParam) ? statusParam : "open";

  // "key" records which tab these results belong to, so loading = (results are for another tab)
  const [result, setResult] = useState({
    key: null,
    requests: [],
    counts: { open: 0, fulfilled: 0, declined: 0, seeking_copy: 0 },
    error: "",
  });
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
    if (status === "seeking_copy") {
      setNote(
        "We checked our library archives and do not currently have this book. If you or someone in our community has a digital or physical copy, please upload it to KitabAura!"
      );
    } else {
      setNote("");
    }
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
        counts: {
          ...r.counts,
          [tab]: Math.max(0, (r.counts[tab] || 0) - 1),
          [resolving.status]: (r.counts[resolving.status] || 0) + 1,
        },
      }));
      const actionMessage =
        resolving.status === "seeking_copy"
          ? `Request sent to ${request.user?.name || "the user"}! An email with an upload link was dispatched, and the title is now listed on the Community Wanted board.`
          : `"${request.title}" was marked ${resolving.status}.`;
      setNotice({ type: "success", text: actionMessage });
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
      <p className="mt-1 text-sm text-muted">
        Books that readers requested. If you don't have a book, you can request the user and community to upload a copy.
      </p>

      <div role="tablist" aria-label="Request status" className="mt-6 flex flex-wrap gap-1 border-b border-gray-200">
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
            <span className="ml-1.5 rounded-full bg-soft px-2 py-0.5 text-xs">{counts[t.key] || 0}</span>
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
              {tab === "open"
                ? "No open requests"
                : tab === "seeking_copy"
                ? "No books currently being sought from users"
                : `No ${tab} requests`}
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
              const isDeclining = panel?.status === "declined";
              const isSeeking = panel?.status === "seeking_copy";

              return (
                <li key={r._id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="font-semibold text-lg text-ink">{r.title}</h2>
                      <p className="text-sm text-muted">
                        {r.author ? `${r.author} · ` : ""}
                        <span className="capitalize">{r.language}</span>
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        r.status === "open"
                          ? "bg-amber-100 text-amber-800"
                          : r.status === "seeking_copy"
                          ? "bg-blue-100 text-blue-800"
                          : r.status === "fulfilled"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {r.status === "seeking_copy" ? "Seeking Copy from Users" : r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-muted">
                    Requested by <span className="font-medium text-ink">{r.user?.name || "Reader"}</span> ({r.user?.email || "no email"}) ·{" "}
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>

                  {r.note && (
                    <div className="mt-2 rounded-lg bg-soft/60 px-3 py-2 text-sm text-ink">
                      <span className="font-medium text-muted">Reader's note:</span> {r.note}
                    </div>
                  )}

                  {r.adminNote && (tab === "seeking_copy" || tab === "fulfilled" || tab === "declined") && (
                    <div className="mt-2 rounded-lg bg-blue-50/70 p-3 text-sm text-blue-900 border border-blue-100">
                      <span className="font-semibold">Message sent to user:</span> {r.adminNote}
                    </div>
                  )}

                  {/* Open / Seeking action panel */}
                  {(tab === "open" || tab === "seeking_copy") &&
                    (panel ? (
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <label className="block text-sm font-medium">
                          {isDeclining ? (
                            "Reason for declining *"
                          ) : isSeeking ? (
                            <>
                              Message to the user & community
                              <span className="block text-xs font-normal text-muted mt-0.5">
                                Notify the user that you don't have this book, and invite them or other community members to upload a copy.
                              </span>
                            </>
                          ) : (
                            <>
                              Note for the reader <span className="font-normal text-muted">(optional)</span>
                            </>
                          )}
                          <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            maxLength={300}
                            autoFocus
                            placeholder={
                              isDeclining
                                ? "For example: not available in digital form, or protected by copyright"
                                : isSeeking
                                ? "For example: We searched our archives but could not find this book. If you have a copy, please upload it to KitabAura!"
                                : "For example: Added today! Search for the title on Browse page."
                            }
                            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </label>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => confirm(r)}
                            disabled={busy || (isDeclining && !note.trim())}
                            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50 ${
                              isDeclining
                                ? "bg-red-600 hover:bg-red-700"
                                : isSeeking
                                ? "bg-[#c99a3b] text-[#1c2b25] hover:bg-[#d9a441]"
                                : "bg-primary hover:bg-primary-dark"
                            }`}
                          >
                            {busy
                              ? "Saving..."
                              : isDeclining
                              ? "Confirm decline"
                              : isSeeking
                              ? "Send Request to User & Community"
                              : "Confirm fulfilled"}
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
                          Check library &rarr;
                        </Link>

                        <button
                          onClick={() => openPanel(r._id, "fulfilled")}
                          className="rounded-lg bg-primary px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark shadow-sm"
                        >
                          Mark fulfilled
                        </button>

                        {tab === "open" && (
                          <button
                            onClick={() => openPanel(r._id, "seeking_copy")}
                            className="rounded-lg border border-accent bg-accent/15 px-3.5 py-1.5 text-sm font-semibold text-amber-900 hover:bg-accent/25 transition"
                            title="Book is not with admin - request the user or community to provide a copy"
                          >
                            Request book from user
                          </button>
                        )}

                        <button
                          onClick={() => openPanel(r._id, "declined")}
                          className="rounded-lg border border-red-300 px-3.5 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
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
