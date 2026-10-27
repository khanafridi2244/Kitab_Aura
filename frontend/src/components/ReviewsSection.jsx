import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../hooks/useAuth";

const PAGE_SIZE = 10;
const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

// Read-only stars
function Stars({ value }) {
  return (
    <span role="img" aria-label={`${value} out of 5 stars`} className="tracking-tight">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? "text-accent" : "text-gray-300"}>
          &#9733;
        </span>
      ))}
    </span>
  );
}

// Clickable stars
function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div
      role="radiogroup"
      aria-label="Your rating"
      className="flex items-center gap-1"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          className={`text-3xl leading-none transition ${n <= shown ? "text-accent" : "text-gray-300"}`}
        >
          &#9733;
        </button>
      ))}
      <span className="ml-2 text-sm text-muted">{shown ? LABELS[shown] : "Select a rating"}</span>
    </div>
  );
}

// bookId: the book. onChanged: called after a review is saved or deleted (to refresh the rating numbers)
export default function ReviewsSection({ bookId, onChanged }) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  // "key" records which request these results belong to, so loading = (results are outdated)
  const [reloadKey, setReloadKey] = useState(0);
  const key = `${bookId}:${reloadKey}`;
  const [result, setResult] = useState({ key: null, items: [], total: 0, page: 1, error: "" });
  const loading = result.key !== key;

  const [mine, setMine] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [moreBusy, setMoreBusy] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const myReview = isAuthenticated ? mine : null;

  // Load the first page of reviews (again whenever reloadKey changes)
  useEffect(() => {
    let active = true;
    api
      .get(`/books/${bookId}/reviews`, { params: { page: 1, limit: PAGE_SIZE } })
      .then(
        ({ data }) =>
          active && setResult({ key, items: data.reviews, total: data.total, page: 1, error: "" })
      )
      .catch(
        (err) =>
          active && setResult({ key, items: [], total: 0, page: 1, error: getErrorMessage(err) })
      );
    return () => {
      active = false;
    };
  }, [bookId, key]);

  // Load this user's own review, so the form starts filled in
  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    api
      .get(`/books/${bookId}/reviews/mine`)
      .then(({ data }) => {
        if (!active) return;
        setMine(data.review);
        setRating(data.review?.rating || 0);
        setComment(data.review?.comment || "");
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [bookId, isAuthenticated]);

  const loadMore = async () => {
    setMoreBusy(true);
    try {
      const { data } = await api.get(`/books/${bookId}/reviews`, {
        params: { page: result.page + 1, limit: PAGE_SIZE },
      });
      setResult((r) => ({ ...r, items: [...r.items, ...data.reviews], page: data.page, total: data.total }));
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setMoreBusy(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice({ type: "", text: "" });
    if (!rating) return setNotice({ type: "error", text: "Please choose a star rating" });

    setSubmitting(true);
    try {
      const { data } = await api.put(`/books/${bookId}/reviews`, { rating, comment });
      const wasEdit = !!myReview;
      setMine(data.review);
      setReloadKey((k) => k + 1);
      onChanged?.();
      setNotice({
        type: "success",
        text: wasEdit ? "Your review was updated." : "Thank you! Your review was added.",
      });
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (review, isOwn) => {
    if (!window.confirm(isOwn ? "Delete your review?" : "Delete this review?")) return;
    setNotice({ type: "", text: "" });
    try {
      await api.delete(`/books/${bookId}/reviews/${review._id}`);
      if (isOwn) {
        setMine(null);
        setRating(0);
        setComment("");
      }
      setReloadKey((k) => k + 1);
      onChanged?.();
      setNotice({ type: "success", text: "Review deleted." });
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    }
  };

  const { items, total } = result;

  return (
    <section className="mt-12 border-t border-gray-200 pt-8" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="text-xl font-bold text-primary">
        Reviews {!loading && <span className="text-base font-medium text-muted">({total})</span>}
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

      {/* Write / edit form, or a login prompt */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mt-4 rounded-xl border border-gray-200 bg-soft p-4">
          <h3 className="font-semibold text-ink">{myReview ? "Your review" : "Write a review"}</h3>
          <div className="mt-2">
            <StarInput value={rating} onChange={setRating} />
          </div>
          <label className="mt-3 block text-sm font-medium">
            Comment <span className="font-normal text-muted">(optional)</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={1000}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {submitting ? "Saving..." : myReview ? "Update review" : "Submit review"}
            </button>
            {myReview && (
              <button
                type="button"
                onClick={() => handleDelete(myReview, true)}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      ) : (
        <p className="mt-4 rounded-xl bg-soft px-4 py-4 text-sm">
          <Link to="/login" state={{ from: location.pathname }} className="font-semibold text-primary underline">
            Log in
          </Link>{" "}
          to rate this book and write a review.
        </p>
      )}

      {/* List */}
      <div className="mt-6" aria-live="polite">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-soft" />
            ))}
          </div>
        ) : result.error ? (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-4 text-sm text-red-700">
            {result.error}
          </p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted">No reviews yet. Be the first to share your thoughts.</p>
        ) : (
          <>
            <ul className="space-y-4">
              {items.map((r) => {
                const isOwn = !!user && String(r.user?._id) === String(user.id);
                return (
                  <li key={r._id} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-semibold text-ink">{r.user?.name || "Deleted user"}</span>
                      {isOwn && (
                        <span className="rounded-full bg-soft px-2 py-0.5 text-xs font-semibold text-primary">You</span>
                      )}
                      <Stars value={r.rating} />
                      <span className="text-xs text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
                      {isAdmin && !isOwn && (
                        <button
                          onClick={() => handleDelete(r, false)}
                          className="ml-auto text-xs font-medium text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    {r.comment && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{r.comment}</p>}
                  </li>
                );
              })}
            </ul>

            {items.length < total && (
              <button
                onClick={loadMore}
                disabled={moreBusy}
                className="mt-4 rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-primary hover:bg-soft disabled:opacity-60"
              >
                {moreBusy ? "Loading..." : "Show more reviews"}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}