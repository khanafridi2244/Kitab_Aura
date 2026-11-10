import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import CategoryCard from "../components/CategoryCard";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

const controlClass =
  "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function CategoriesPage() {
  // Search, sort and the "show empty" choice live in the address, so the page can be shared
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort") === "name" ? "name" : "popular";
  const showEmpty = searchParams.get("empty") !== "0"; // Show all categories by default

  const [reloadKey, setReloadKey] = useState(0);
  // "key" records which request these results belong to, so loading = (results are outdated)
  const [result, setResult] = useState({ key: null, categories: [], error: "" });
  const loading = result.key !== reloadKey;

  useDocumentMeta("Categories - KitabAura", "Browse KitabAura books by subject and genre.");

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

  const update = (name, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    setSearchParams(next, { replace: true });
  };

  const { categories, error } = result;

  // Search matches the English, Urdu and Pashto names
  const needle = q.trim().toLowerCase();
  const matching = categories.filter(
    (c) => !needle || [c.name, c.nameUrdu, c.namePashto].some((n) => n && n.toLowerCase().includes(needle))
  );
  const hiddenEmpty = showEmpty ? 0 : matching.filter((c) => c.bookCount === 0).length;
  const shown = (showEmpty ? matching : matching.filter((c) => c.bookCount > 0)).sort((a, b) =>
    sort === "name" ? a.name.localeCompare(b.name) : b.bookCount - a.bookCount || a.name.localeCompare(b.name)
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">Explore our library</p>
      <h1 className="mt-1 text-3xl font-semibold text-ink sm:text-4xl">Categories</h1>
      <p className="mt-2 max-w-2xl text-muted">Discover books across different subjects and genres.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="min-w-52 flex-1 sm:max-w-sm">
          <span className="sr-only">Search categories</span>
          <input
            type="search"
            value={q}
            onChange={(e) => update("q", e.target.value)}
            placeholder="Search categories..."
            className={`${controlClass} w-full`}
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Sort by</span>
          <select
            value={sort}
            onChange={(e) => update("sort", e.target.value === "popular" ? "" : e.target.value)}
            className={controlClass}
          >
            <option value="popular">Most books</option>
            <option value="name">A to Z</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showEmpty}
            onChange={(e) => update("empty", e.target.checked ? "" : "0")}
            className="h-4 w-4 accent-[#0f4c3a]"
          />
          Show all categories
        </label>
      </div>

      <div className="mt-6" aria-live="polite">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-4/3 animate-pulse rounded-2xl bg-soft" />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="rounded-xl bg-red-50 px-4 py-8 text-center text-red-700">
            <p>Could not load categories: {error}</p>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="mt-3 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Try again
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-xl bg-soft px-4 py-16 text-center">
            <p className="text-lg font-semibold text-primary">No categories yet</p>
            <p className="mt-1 text-sm text-muted">Categories appear here once an admin adds them.</p>
          </div>
        ) : shown.length === 0 ? (
          <div className="rounded-xl bg-soft px-4 py-16 text-center">
            <p className="text-lg font-semibold text-primary">
              {needle ? "No categories match your search" : "No categories have books yet"}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm font-semibold">
              {needle && (
                <button onClick={() => update("q", "")} className="text-primary underline">
                  Clear search
                </button>
              )}
              {!showEmpty && (
                <button onClick={() => update("empty", "1")} className="text-primary underline">
                  Show empty categories
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted">
              {shown.length} {shown.length === 1 ? "category" : "categories"}
              {hiddenEmpty > 0 && (
                <>
                  {" "}&middot; {hiddenEmpty} with no books yet are hidden.{" "}
                  <button onClick={() => update("empty", "1")} className="font-semibold text-primary underline">
                    Show them
                  </button>
                </>
              )}
            </p>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {shown.map((c) => (
                <li key={c._id}>
                  <CategoryCard category={c} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <p className="mt-10 text-center text-sm text-muted">
        Cannot find what you are looking for?{" "}
        <Link to="/requests" className="font-semibold text-primary underline">
          Request a book
        </Link>
      </p>
    </div>
  );
}