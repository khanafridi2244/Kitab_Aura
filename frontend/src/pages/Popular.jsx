import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";

const TABS = [
  { key: "downloads", label: "Most downloaded" },
  { key: "rating", label: "Top rated" },
  { key: "reviews", label: "Most reviewed" },
];

const LANGUAGES = ["pashto", "urdu", "english", "arabic", "persian"];

const statText = (book, by) => {
  if (by === "downloads") return `${book.downloads} downloads`;
  if (by === "rating") return `${book.avgRating.toFixed(1)} (${book.ratingsCount} ${book.ratingsCount === 1 ? "review" : "reviews"})`;
  return `${book.ratingsCount} ${book.ratingsCount === 1 ? "review" : "reviews"}`;
};

export default function Popular() {
  const [searchParams, setSearchParams] = useSearchParams();
  const byParam = searchParams.get("by");
  const by = TABS.some((t) => t.key === byParam) ? byParam : "downloads";
  const language = searchParams.get("language") || "";
  const key = `${by}:${language}`;

  const [result, setResult] = useState({ key: null, books: [], error: "" });
  const loading = result.key !== key;

  useEffect(() => {
    let active = true;
    api
      .get("/home/popular", { params: { by, language: language || undefined } })
      .then(({ data }) => active && setResult({ key, books: data.books, error: "" }))
      .catch((err) => active && setResult({ key, books: [], error: getErrorMessage(err) }));
    return () => { active = false; };
  }, [by, language, key]);

  const update = (name, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    setSearchParams(next);
  };

  const { books, error } = result;

  return (
    <div className="mx-auto max-w-4xl min-h-[calc(100vh-4rem)] px-4 py-12">
      {/* Page heading */}
      <h1 className="text-3xl font-bold text-primary sm:text-4xl">Most popular books</h1>
      <p className="mt-2 text-base text-muted">What other readers are downloading, rating and talking about.</p>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label="Ranking" className="flex gap-1 rounded-full bg-soft p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={by === t.key}
              onClick={() => update("by", t.key === "downloads" ? "" : t.key)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${by === t.key ? "bg-primary text-white" : "text-primary hover:bg-white"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <label className="text-sm">
          <span className="sr-only">Language</span>
          <select
            value={language}
            onChange={(e) => update("language", e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="">All languages</option>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Book list */}
      <div className="mt-8" aria-live="polite">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-soft" />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="rounded-xl bg-red-50 px-4 py-8 text-center text-red-700">
            {error}
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-2xl bg-soft px-4 py-20 text-center">
            <p className="text-xl font-semibold text-primary">Nothing to rank yet</p>
            <p className="mt-2 text-sm text-muted">
              {by === "downloads" ? "Books appear here once people read them." : "Books appear here once readers review them."}
            </p>
            <Link to="/browse" className="mt-5 inline-block font-semibold text-primary underline">
              Browse books
            </Link>
          </div>
        ) : (
          <ol className="space-y-4">
            {books.map((book, i) => (
              <li key={book._id}>
                <Link
                  to={`/books/${book._id}`}
                  className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  {/* Rank number */}
                  <span className={`w-10 shrink-0 text-center text-2xl font-bold ${i < 3 ? "text-accent" : "text-muted"}`}>
                    {i + 1}
                  </span>

                  {/* Cover */}
                  <div className="h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-soft">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary p-1 text-center text-xs font-bold text-white">
                        {book.title}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-semibold text-ink">{book.title}</p>
                    <p className="mt-1 truncate text-sm text-muted">
                      {book.author} &middot; <span className="capitalize">{book.language}</span>
                      {book.category && <> &middot; {book.category.name}</>}
                    </p>
                  </div>

                  {/* Stat */}
                  <span className="shrink-0 text-base font-semibold text-primary">
                    {by === "rating" && <span className="text-accent">&#9733; </span>}
                    {statText(book, by)}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}