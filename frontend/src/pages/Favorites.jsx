import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import BookCard from "../components/BookCard";

export default function Favorites() {
  const [state, setState] = useState({ loading: true, books: [], error: "" });
  const [removingId, setRemovingId] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .get("/users/favorites")
      .then(({ data }) => active && setState({ loading: false, books: data.books, error: "" }))
      .catch((err) => active && setState({ loading: false, books: [], error: getErrorMessage(err) }));
    return () => {
      active = false;
    };
  }, []);

  // The same endpoint toggles, so on a saved book it removes it
  const handleRemove = async (book) => {
    setActionError("");
    setRemovingId(book._id);
    try {
      await api.post(`/users/favorites/${book._id}`);
      setState((s) => ({ ...s, books: s.books.filter((b) => b._id !== book._id) }));
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setRemovingId(null);
    }
  };

  const { loading, books, error } = state;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-primary">My favorites</h1>

      {actionError && (
        <div role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="mt-6" aria-live="polite">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-3/4 animate-pulse rounded-xl bg-soft" />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="rounded-lg bg-red-50 px-4 py-6 text-center text-red-700">
            {error}
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-xl bg-soft px-4 py-16 text-center">
            <p className="text-lg font-semibold text-primary">No favorites yet</p>
            <p className="mt-1 text-sm text-muted">Tap the heart on a book to save it here.</p>
            <Link to="/browse" className="mt-4 inline-block font-semibold text-primary underline">
              Browse books
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted">
              {books.length} saved {books.length === 1 ? "book" : "books"}
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {books.map((book) => (
                <div key={book._id} className="flex flex-col gap-2">
                  <BookCard book={book} />
                  <button
                    onClick={() => handleRemove(book)}
                    disabled={removingId === book._id}
                    className="rounded-lg border border-gray-300 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {removingId === book._id ? "Removing..." : "Remove"}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}