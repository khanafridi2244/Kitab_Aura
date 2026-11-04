import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import BlogCard from "../components/BlogCard";
import Pagination from "../components/Pagination";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

const PAGE_SIZE = 9;

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
  const key = searchParams.toString();

  const [categories, setCategories] = useState([]);
  // "key" records which URL these results belong to, so loading = (results are outdated)
  const [result, setResult] = useState({ key: null, posts: [], pages: 1, error: "" });
  const loading = result.key !== key;

  useDocumentMeta("Blog - KitabAura", "Articles, book reviews and reading tips from KitabAura.");

  useEffect(() => {
    api.get("/blog/categories").then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    api
      .get("/blog", { params: { category: category || undefined, page, limit: PAGE_SIZE } })
      .then(({ data }) => active && setResult({ key, posts: data.posts, pages: data.pages, error: "" }))
      .catch((err) => active && setResult({ key, posts: [], pages: 1, error: getErrorMessage(err) }));
    return () => {
      active = false;
    };
  }, [key, category, page]);

  const setCategory = (slug) => setSearchParams(slug ? { category: slug } : {});

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", p);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chip = (active) =>
    `rounded-full px-4 py-1.5 text-sm font-semibold transition ${
      active ? "bg-primary text-white" : "bg-soft text-primary hover:bg-gray-200"
    }`;

  const { posts, pages, error } = result;
  const visibleCategories = categories.filter((c) => c.count > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-primary sm:text-4xl">The KitabAura Blog</h1>
      <p className="mt-2 max-w-2xl text-muted">Book reviews, reading tips and stories about literature.</p>

      {visibleCategories.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <button onClick={() => setCategory("")} aria-pressed={!category} className={chip(!category)}>
            All
          </button>
          {visibleCategories.map((c) => (
            <button key={c.slug} onClick={() => setCategory(c.slug)} aria-pressed={category === c.slug} className={chip(category === c.slug)}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8" aria-live="polite">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-soft" />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="rounded-xl bg-red-50 px-4 py-8 text-center text-red-700">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl bg-soft px-4 py-16 text-center">
            <p className="text-lg font-semibold text-primary">No articles yet</p>
            <p className="mt-1 text-sm text-muted">Check back soon, or browse the library in the meantime.</p>
            <Link to="/browse" className="mt-4 inline-block font-semibold text-primary underline">
              Explore books
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>
            <Pagination page={page} pages={pages} onChange={goToPage} />
          </>
        )}
      </div>
    </div>
  );
}