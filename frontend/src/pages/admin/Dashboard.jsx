import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../api/axios";
import StatsPanel from "../../components/admin/StatsPanel";

export default function Dashboard() {
  const [state, setState] = useState({ loading: true, books: [], error: "" });
  const [busyId, setBusyId] = useState(null); // book being approved or rejected
  const [rejectingId, setRejectingId] = useState(null); // book whose reason box is open
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });
    const [reviewCount, setReviewCount] = useState(0); // bumps after each approve or reject

  useEffect(() => {
    let active = true;
    api
      .get("/books/pending")
      .then(({ data }) => active && setState({ loading: false, books: data.books, error: "" }))
      .catch((err) => active && setState({ loading: false, books: [], error: getErrorMessage(err) }));
    return () => {
      active = false;
    };
  }, []);

  const review = async (book, status, rejectNote) => {
    setNotice({ type: "", text: "" });
    setBusyId(book._id);
    try {
      await api.patch(`/books/${book._id}/status`, { status, rejectNote });
      setState((s) => ({ ...s, books: s.books.filter((b) => b._id !== book._id) }));
      setRejectingId(null);
      setReviewCount((c) => c + 1);
      setNote("");
      setNotice({
        type: "success",
        text: `"${book.title}" was ${status}.`,
      });
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  const openReject = (id) => {
    setRejectingId(id);
    setNote("");
    setNotice({ type: "", text: "" });
  };

  const { loading, books, error } = state;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-primary">Admin dashboard</h1>
      <p className="mt-1 text-sm text-muted">Review uploaded books before they go live in the library.</p>
      <StatsPanel refreshKey={reviewCount} />
      <h2 className="mt-8 flex items-center gap-2 text-lg font-bold text-ink">
        Pending approvals
        {!loading && !error && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-semibold text-amber-800">
            {books.length}
          </span>
        )}
      </h2>

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

      <div className="mt-4" aria-live="polite">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-soft" />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="rounded-lg bg-red-50 px-4 py-6 text-center text-red-700">
            {error}
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-xl bg-soft px-4 py-16 text-center">
            <p className="text-lg font-semibold text-primary">All caught up</p>
            <p className="mt-1 text-sm text-muted">There are no books waiting for approval.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {books.map((book) => {
              const busy = busyId === book._id;
              const rejecting = rejectingId === book._id;

              return (
                <li key={book._id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex gap-4">
                    <div className="h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-soft">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary p-1 text-center text-[10px] font-bold text-white">
                          {book.title}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-ink">{book.title}</h3>
                      <p className="text-sm text-muted">
                        {book.author} &middot; <span className="capitalize">{book.language}</span>
                        {book.category && <> &middot; {book.category.name}</>}
                        {book.pages && <> &middot; {book.pages} pages</>}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        By {book.uploadedBy?.name || "Unknown"} ({book.uploadedBy?.email || "no email"}) &middot;{" "}
                        {new Date(book.createdAt).toLocaleDateString()}
                      </p>
                      {book.description && (
                        <p className="mt-2 line-clamp-3 text-sm">{book.description}</p>
                      )}
                      <a
                        href={book.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                      >
                        Preview PDF
                      </a>
                    </div>
                  </div>

                  {rejecting ? (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <label className="block text-sm font-medium">
                        Reason for rejection
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={2}
                          maxLength={300}
                          autoFocus
                          placeholder="For example: the PDF is unreadable or the book is copyrighted"
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </label>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => review(book, "rejected", note.trim())}
                          disabled={busy || !note.trim()}
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {busy ? "Rejecting..." : "Confirm reject"}
                        </button>
                        <button
                          onClick={() => setRejectingId(null)}
                          disabled={busy}
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-soft"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                      <button
                        onClick={() => review(book, "approved")}
                        disabled={busy}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
                      >
                        {busy ? "Approving..." : "Approve"}
                      </button>
                      <button
                        onClick={() => openReject(book._id)}
                        disabled={busy}
                        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}