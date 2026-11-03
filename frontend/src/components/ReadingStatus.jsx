import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../hooks/useAuth";

const OPTIONS = [
  { value: "want", label: "Want to read" },
  { value: "reading", label: "Reading" },
  { value: "completed", label: "Completed" },
];

// Shelf buttons and the "You have completed 65%" bar for one book
export default function ReadingStatus({ bookId }) {
  const { isAuthenticated } = useAuth();

  // "id" records which book this entry belongs to, so loading = (entry is for another book)
  const [result, setResult] = useState({ id: null, entry: null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const loading = isAuthenticated && result.id !== bookId;
  const entry = isAuthenticated && result.id === bookId ? result.entry : null;

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    api
      .get(`/library/${bookId}`)
      .then(({ data }) => active && setResult({ id: bookId, entry: data.entry }))
      .catch(() => active && setResult({ id: bookId, entry: null }));
    return () => {
      active = false;
    };
  }, [bookId, isAuthenticated]);

  const choose = async (status) => {
    if (busy || entry?.status === status) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await api.put(`/library/${bookId}`, { status });
      setResult({ id: bookId, entry: data.entry });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Remove this book from your reading list? Your saved page will be forgotten.")) return;
    setBusy(true);
    setError("");
    try {
      await api.delete(`/library/${bookId}`);
      setResult({ id: bookId, entry: null });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!isAuthenticated) {
    return <p className="mt-4 text-sm text-muted">Log in to keep a reading list and track your progress.</p>;
  }

  if (loading) return <div className="mt-4 h-10 w-72 animate-pulse rounded-lg bg-soft" />;

  return (
    <div className="mt-5 rounded-xl border border-gray-200 bg-soft p-4">
      <p className="text-sm font-semibold text-ink">Your reading list</p>

      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Reading status">
        {OPTIONS.map((o) => {
          const active = entry?.status === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => choose(o.value)}
              disabled={busy}
              aria-pressed={active}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition disabled:opacity-60 ${
                active ? "bg-primary text-white" : "bg-white text-primary hover:bg-gray-100"
              }`}
            >
              {o.label}
            </button>
          );
        })}
        {entry && (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="px-2 text-sm font-medium text-red-600 hover:underline disabled:opacity-60"
          >
            Remove
          </button>
        )}
      </div>

      {entry?.status === "reading" && (
        <div className="mt-3">
          {entry.percent !== null ? (
            <>
              <div className="h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-primary" style={{ width: `${entry.percent}%` }} />
              </div>
              <p className="mt-1 text-sm text-muted">You have completed {entry.percent}% of this book.</p>
            </>
          ) : (
            <p className="text-sm text-muted">You are on page {entry.page}.</p>
          )}
          <Link to={`/read/${bookId}`} className="mt-1 inline-block text-sm font-semibold text-primary hover:underline">
            Continue from page {entry.page} &rarr;
          </Link>
        </div>
      )}

      {entry?.status === "completed" && (
        <p className="mt-3 text-sm font-medium text-green-700">
          &#10003; You finished this book
          {entry.completedAt && <> on {new Date(entry.completedAt).toLocaleDateString()}</>}.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}