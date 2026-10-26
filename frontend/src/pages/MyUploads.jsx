import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

export default function MyUploads() {
  const [state, setState] = useState({ loading: true, books: [], error: "" });
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .get("/books/mine")
      .then(({ data }) => active && setState({ loading: false, books: data.books, error: "" }))
      .catch((err) => active && setState({ loading: false, books: [], error: getErrorMessage(err) }));
    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async (book) => {
    if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) return;

    setActionError("");
    setDeletingId(book._id);
    try {
      await api.delete(`/books/${book._id}`);
      setState((s) => ({ ...s, books: s.books.filter((b) => b._id !== book._id) }));
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const { loading, books, error } = state;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-primary">My uploads</h1>
        <Link
          to="/upload"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Upload a book
        </Link>
      </div>

      {actionError && (
        <div role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
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
        ) : books.length === 0 ? (
          <div className="rounded-xl bg-soft px-4 py-16 text-center">
            <p className="text-lg font-semibold text-primary">You have not uploaded any books yet</p>
            <p className="mt-1 text-sm text-muted">Share a book and it will show up here with its status.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {books.map((book) => (
              <li key={book._id} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <div className="h-24 w-18 shrink-0 overflow-hidden rounded-lg bg-soft">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary p-1 text-center text-[10px] font-bold text-white">
                      {book.title}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-semibold text-ink">{book.title}</h2>
                    <StatusBadge status={book.status} />
                  </div>
                  <p className="truncate text-sm text-muted">
                    {book.author} &middot; <span className="capitalize">{book.language}</span>
                    {book.category && <> &middot; {book.category.name}</>}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    Uploaded {new Date(book.createdAt).toLocaleDateString()}
                    {book.status === "approved" && <> &middot; {book.downloads} downloads</>}
                  </p>

                  {book.status === "rejected" && book.rejectNote && (
                    <p className="mt-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-700">
                      <span className="font-semibold">Reason:</span> {book.rejectNote}
                    </p>
                  )}
                  {book.status === "pending" && (
                    <p className="mt-2 text-xs text-muted">Waiting for admin approval.</p>
                  )}

                  <div className="mt-2 flex gap-4 text-sm font-medium">
                    {book.status === "approved" && (
                      <Link to={`/books/${book._id}`} className="text-primary hover:underline">
                        View
                      </Link>
                    )}
                    <button
                      onClick={() => handleDelete(book)}
                      disabled={deletingId === book._id}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      {deletingId === book._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}