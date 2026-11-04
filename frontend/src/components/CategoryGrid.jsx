import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";

const MAX_SHOWN = 12;

export default function CategoryGrid() {
  const [reloadKey, setReloadKey] = useState(0);
  // "key" records which request these results belong to, so loading = (results are outdated)
  const [result, setResult] = useState({ key: null, categories: [], error: "" });
  const loading = result.key !== reloadKey;

  useEffect(() => {
    let active = true;
    api
      .get("/categories", { params: { counts: true } })
      .then(({ data }) => active && setResult({ key: reloadKey, categories: data.categories, error: "" }))
      .catch((err) => active && setResult({ key: reloadKey, categories: [], error: getErrorMessage(err) }));
    return () => {
      active = false;
    };
  }, [reloadKey]);

  // Empty categories are not shown. The biggest ones come first
  const shown = result.categories
    .filter((c) => c.bookCount > 0)
    .sort((a, b) => b.bookCount - a.bookCount)
    .slice(0, MAX_SHOWN);

  if (!loading && !result.error && shown.length === 0) return null;

  return (
    <section id="categories" aria-labelledby="categories-heading" className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="categories-heading" className="text-2xl font-semibold text-primary sm:text-3xl">
            Explore Categories
          </h2>
          <p className="mt-1 text-sm text-muted">Browse books by subject.</p>
        </div>
        <Link to="/browse" className="text-sm font-medium text-primary hover:underline">
          All books &rarr;
        </Link>
      </div>

      <div className="mt-6" aria-live="polite">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-soft" />
            ))}
          </div>
        ) : result.error ? (
          <div role="alert" className="rounded-xl bg-red-50 px-4 py-5 text-center text-sm text-red-700">
            Could not load categories: {result.error}
            <button onClick={() => setReloadKey((k) => k + 1)} className="ml-3 font-semibold underline">
              Retry
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {shown.map((c, i) => (
              <li key={c._id}>
                <Link
                  to={`/browse?category=${c._id}`}
                  className={`flex h-full flex-col items-center gap-2 rounded-2xl border border-line px-3 py-5 text-center transition hover:-translate-y-0.5 hover:shadow-md ${
                    i % 2 === 0 ? "bg-soft" : "bg-accent/15"
                  }`}
                >
                  <svg className="text-primary" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 6.5C10.3 5.2 8 4.7 5 4.7v12.6c3 0 5.3.5 7 1.8 1.7-1.3 4-1.8 7-1.8V4.7c-3 0-5.3.5-7 1.8z" />
                    <path d="M12 6.5v12.6" />
                  </svg>
                  <span className="text-sm font-semibold text-ink">{c.name}</span>
                  <span className="text-xs text-muted">
                    {c.bookCount} {c.bookCount === 1 ? "book" : "books"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}