import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import BlogCard from "./BlogCard";

const COUNT = 3;

// The newest published articles. The section stays hidden until at least one article is published
export default function LatestBlogs() {
  const [reloadKey, setReloadKey] = useState(0);
  // "key" records which request these results belong to, so loading = (results are outdated)
  const [result, setResult] = useState({ key: null, posts: [], error: "" });
  const loading = result.key !== reloadKey;

  useEffect(() => {
    let active = true;
    api
      .get("/blog", { params: { limit: COUNT } })
      .then(({ data }) => active && setResult({ key: reloadKey, posts: data.posts, error: "" }))
      .catch((err) => active && setResult({ key: reloadKey, posts: [], error: getErrorMessage(err) }));
    return () => {
      active = false;
    };
  }, [reloadKey]);

  if (!loading && !result.error && result.posts.length === 0) return null;

  return (
    <section id="blog" aria-labelledby="blog-heading" className="pb-16 pt-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="blog-heading" className="text-2xl font-semibold text-primary sm:text-3xl">
            Latest from the Blog
          </h2>
          <p className="mt-1 text-sm text-muted">Book reviews, reading tips and stories about literature.</p>
        </div>
        <Link to="/blog" className="shrink-0 text-sm font-medium text-primary hover:underline">
          All articles &rarr;
        </Link>
      </div>

      <div className="mt-6" aria-live="polite">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: COUNT }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-soft" />
            ))}
          </div>
        ) : result.error ? (
          <div role="alert" className="rounded-xl bg-red-50 px-4 py-6 text-center text-sm text-red-700">
            Could not load articles: {result.error}
            <button onClick={() => setReloadKey((k) => k + 1)} className="ml-3 font-semibold underline">
              Retry
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.posts.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}