import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import api, { getErrorMessage } from "../api/axios";
import BookCard from "../components/BookCard";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 12;

const LANGUAGES = ["pashto", "urdu", "english", "arabic", "persian"];

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most downloaded" },
  { value: "rating", label: "Top rated" },
  { value: "title", label: "Title A-Z" },
];

const selectClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function Browse() {
  const { slug } = useParams();
  const navigate = useNavigate();
  // All filters live in the URL, so a filtered page can be shared or bookmarked
  const [searchParams, setSearchParams] = useSearchParams();

  // If path is /category/:slug, that sets the active category; otherwise use search param
  const rawCategory = slug || searchParams.get("category") || "";
  const q = searchParams.get("q") || "";
  const language = searchParams.get("language") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(1, parseInt(searchParams.get("page")) || 1);

  const [categories, setCategories] = useState([]);

  // Find category object matching current category query (by _id, slug, or name)
  const currentCategory = categories.find(
    (c) =>
      c._id === rawCategory ||
      c.slug === rawCategory.toLowerCase() ||
      c.name.toLowerCase() === rawCategory.toLowerCase()
  );

  const resolvedCategoryId = currentCategory ? currentCategory._id : rawCategory;

  // Composite key for tracking active search query
  const key = JSON.stringify({
    q,
    language,
    category: resolvedCategoryId,
    sort,
    page,
  });

  // "key" records which URL these results belong to, so loading = (results are for an older URL)
  const [result, setResult] = useState({ key: null, books: [], total: 0, pages: 1, error: "" });
  const loading = result.key !== key;

  // Load categories once
  useEffect(() => {
    api
      .get("/categories")
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  // Load books every time the URL filters change
  useEffect(() => {
    const controller = new AbortController();
    const params = {
      limit: PAGE_SIZE,
      page,
      sort,
    };
    if (q) params.q = q;
    if (language) params.language = language;
    if (resolvedCategoryId) params.category = resolvedCategoryId;

    api
      .get("/books", { params, signal: controller.signal })
      .then(({ data }) =>
        setResult({ key, books: data.books || [], total: data.total || 0, pages: data.pages || 1, error: "" })
      )
      .catch((err) => {
        if (axios.isCancel(err)) return; // a newer request replaced this one
        setResult({ key, books: [], total: 0, pages: 1, error: getErrorMessage(err) });
      });

    return () => controller.abort();
  }, [q, language, resolvedCategoryId, sort, page, key]);

  // Change one filter and go back to page 1
  const setParam = (name, value) => {
    if (slug) {
      const next = new URLSearchParams(searchParams);
      if (name === "category") {
        if (value) next.set("category", value);
        else next.delete("category");
      } else {
        if (resolvedCategoryId) next.set("category", resolvedCategoryId);
        if (value) next.set(name, value);
        else next.delete(name);
      }
      next.delete("page");
      navigate(`/browse?${next.toString()}`);
      return;
    }

    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    next.delete("page");
    setSearchParams(next);
  };

  const clearFilters = () => {
    if (slug) {
      navigate("/browse");
    } else {
      setSearchParams({});
    }
  };

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", p);
    if (slug && !next.has("category") && resolvedCategoryId) {
      next.set("category", resolvedCategoryId);
      navigate(`/browse?${next.toString()}`);
    } else {
      setSearchParams(next);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setParam("q", new FormData(e.currentTarget).get("q").trim());
  };

  const hasFilters = q || language || rawCategory || sort !== "newest";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold text-primary">
          {currentCategory ? `Browse books: ${currentCategory.name}` : "Browse books"}
        </h1>
        {currentCategory && (
          <div className="flex items-center gap-2">
            {currentCategory.nameUrdu && (
              <span className="font-arabic text-sm font-semibold text-accent" dir="rtl">
                {currentCategory.nameUrdu}
              </span>
            )}
            {currentCategory.namePashto && (
              <span className="font-arabic text-sm font-semibold text-accent" dir="rtl">
                {currentCategory.namePashto}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mt-4 flex overflow-hidden rounded-full border-2 border-primary bg-white">
        <input
          key={q}
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by title, author or keyword..."
          className="min-w-0 flex-1 px-5 py-2.5 outline-none"
        />
        <button type="submit" className="bg-accent px-6 font-semibold text-white hover:opacity-90">
          Search
        </button>
      </form>

      {/* Filters */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <select aria-label="Language" value={language} onChange={(e) => setParam("language", e.target.value)} className={selectClass}>
          <option value="">All languages</option>
          {LANGUAGES.map((l) => (
            <option key={l} value={l} className="capitalize">
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </option>
          ))}
        </select>

        <select aria-label="Category" value={resolvedCategoryId} onChange={(e) => setParam("category", e.target.value)} className={selectClass}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <select aria-label="Sort" value={sort} onChange={(e) => setParam("sort", e.target.value === "newest" ? "" : e.target.value)} className={selectClass}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <button
          onClick={clearFilters}
          disabled={!hasFilters}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-primary hover:bg-soft disabled:opacity-40"
        >
          Clear filters
        </button>
      </div>

      {/* Results */}
      <div className="mt-6" aria-live="polite">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-3/4 animate-pulse rounded-xl bg-soft" />
            ))}
          </div>
        ) : result.error ? (
          <div role="alert" className="rounded-lg bg-red-50 px-4 py-6 text-center text-red-700">
            {result.error}
          </div>
        ) : result.books.length === 0 ? (
          <div className="rounded-xl bg-soft px-4 py-16 text-center">
            <p className="text-lg font-semibold text-primary">No books found</p>
            <p className="mt-1 text-sm text-muted">Try a different search or clear the filters.</p>
            <Link to="/requests" className="mt-4 inline-block font-semibold text-primary underline">
              Cannot find your book? Request it
            </Link>          
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted">
              {result.total} {result.total === 1 ? "book" : "books"} found
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {result.books.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
            <Pagination page={page} pages={result.pages} onChange={goToPage} />
          </>
        )}
      </div>
    </div>
  );
}