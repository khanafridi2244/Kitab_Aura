import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import ReviewsSection from "../components/ReviewsSection";

export default function BookDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // "id" records which book these results belong to, so loading = (results are for another book)
  const [result, setResult] = useState({ id: null, book: null, error: "" });
  const [downloading, setDownloading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [favorited, setFavorited] = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  const loading = result.id !== id;
  const isFav = isAuthenticated && favorited;

  useEffect(() => {
    let active = true;
    api
      .get(`/books/${id}`)
      .then(({ data }) => active && setResult({ id, book: data.book, error: "" }))
      .catch((err) => active && setResult({ id, book: null, error: getErrorMessage(err) }));
    return () => {
      active = false;
    };
  }, [id]);

  // Is this book already in the user's favorites? (colours the heart)
  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    api
      .get("/users/favorites/ids")
      .then(({ data }) => active && setFavorited(data.ids.includes(id)))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [id, isAuthenticated]);

  const goToLogin = () => navigate("/login", { state: { from: location.pathname } });

    // After a review is saved or deleted, refresh just the rating numbers
  const refreshRating = () =>
    api
      .get(`/books/${id}`)
      .then(({ data }) =>
        setResult((r) =>
          r.book
            ? { ...r, book: { ...r.book, avgRating: data.book.avgRating, ratingsCount: data.book.ratingsCount } }
            : r
        )
      )
      .catch(() => {});

  const handleDownload = async () => {
    if (!isAuthenticated) return goToLogin();

    setDownloading(true);
    setActionError("");
    try {
      const { data } = await api.post(`/books/${id}/download`);

      // Show the new download count right away
      setResult((r) => ({ ...r, book: { ...r.book, downloads: data.downloads } }));

      // fl_attachment tells Cloudinary to download the file instead of opening it
      window.location.assign(data.url.replace("/upload/", "/upload/fl_attachment/"));
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) return goToLogin();

    setFavBusy(true);
    setActionError("");
    try {
      const { data } = await api.post(`/users/favorites/${id}`);
      setFavorited(data.favorited);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setFavBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[260px_1fr]">
        <div className="aspect-3/4 animate-pulse rounded-xl bg-soft" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded bg-soft" />
          <div className="h-5 w-1/3 animate-pulse rounded bg-soft" />
          <div className="h-32 animate-pulse rounded bg-soft" />
        </div>
      </div>
    );
  }

  if (result.error || !result.book) {
    return (
      <div className="px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-primary">Book not found</h1>
        <p className="mt-2 text-muted">{result.error || "This book is not available."}</p>
        <Link to="/browse" className="mt-4 inline-block font-semibold text-primary underline">
          Back to browse
        </Link>
      </div>
    );
  }

  const { book } = result;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/browse" className="text-sm font-medium text-primary hover:underline">
        &larr; Back to browse
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-[260px_1fr]">
        {/* Cover */}
        <div className="mx-auto w-full max-w-65">
          <div className="aspect-3/4 overflow-hidden rounded-xl border border-gray-200 bg-soft shadow-sm">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={`Cover of ${book.title}`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary p-6 text-center text-xl font-bold text-white">
                {book.title}
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold text-primary">{book.title}</h1>
          <p className="mt-1 text-lg text-muted">by {book.author}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-soft px-3 py-1 font-semibold capitalize text-primary">
              {book.language}
            </span>
            {book.category && (
              <span className="rounded-full bg-soft px-3 py-1 font-semibold text-primary">
                {book.category.name}
              </span>
            )}
            {book.pages && (
              <span className="rounded-full bg-soft px-3 py-1 font-semibold text-primary">
                {book.pages} pages
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
            {book.ratingsCount > 0 ? (
              <span>
                <span className="text-accent">&#9733;</span> {book.avgRating.toFixed(1)} ({book.ratingsCount}{" "}
                {book.ratingsCount === 1 ? "review" : "reviews"})
              </span>
            ) : (
              <span>No ratings yet</span>
            )}
            <span>{book.downloads} downloads</span>
            <span>Added {new Date(book.createdAt).toLocaleDateString()}</span>
            {book.uploadedBy?.name && <span>Shared by {book.uploadedBy.name}</span>}
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="rounded-lg bg-accent px-6 py-2.5 font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {downloading ? "Preparing..." : isAuthenticated ? "Download PDF" : "Log in to download"}
              </button>

              <button
                onClick={handleFavorite}
                disabled={favBusy}
                aria-pressed={isFav}
                className={`rounded-lg border px-5 py-2.5 font-semibold transition disabled:opacity-60 ${
                  isFav
                    ? "border-red-300 bg-red-50 text-red-600"
                    : "border-gray-300 text-primary hover:bg-soft"
                }`}
              >
                {isFav ? <>&#9829; Saved</> : <>&#9825; Save</>}
              </button>
            </div>

            {actionError && (
              <p role="alert" className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                {actionError}
              </p>
            )}
          </div>

          <h2 className="mt-8 text-lg font-bold text-primary">About this book</h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed">
            {book.description || "No description has been added for this book yet."}
          </p>
        </div>
      </div>
      <ReviewsSection key={id} bookId={id} onChanged={refreshRating} />
    </div>
  );
}