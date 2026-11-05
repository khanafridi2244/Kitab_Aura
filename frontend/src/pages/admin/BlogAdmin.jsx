import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios";
import { formatDate } from "../../utils/blog";

const TABS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Drafts" },
  { key: "published", label: "Published" },
];

export default function BlogAdmin() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("status");
  const tab = TABS.some((t) => t.key === tabParam) ? tabParam : "all";

  const [reloadKey, setReloadKey] = useState(0);
  const key = `${tab}:${reloadKey}`;
  // "key" records which request these results belong to, so loading = (results are outdated)
  const [result, setResult] = useState({ key: null, posts: [], counts: { draft: 0, published: 0 }, error: "" });
  const loading = result.key !== key;

  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState({
    type: location.state?.notice ? "success" : "",
    text: location.state?.notice || "",
  });

  useEffect(() => {
    let active = true;
    api
      .get("/blog/admin/list", { params: { status: tab === "all" ? undefined : tab } })
      .then(({ data }) => active && setResult({ key, posts: data.posts, counts: data.counts, error: "" }))
      .catch((err) => active && setResult((r) => ({ ...r, key, posts: [], error: getErrorMessage(err) })));
    return () => {
      active = false;
    };
  }, [tab, key]);

  const toggleStatus = async (post) => {
    const next = post.status === "published" ? "draft" : "published";
    setNotice({ type: "", text: "" });
    setBusyId(post._id);
    try {
      await api.patch(`/blog/${post._id}/status`, { status: next });
      setReloadKey((k) => k + 1);
      setNotice({ type: "success", text: `"${post.title}" is now ${next === "published" ? "published" : "a draft"}.` });
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setNotice({ type: "", text: "" });
    setBusyId(post._id);
    try {
      await api.delete(`/blog/${post._id}`);
      setReloadKey((k) => k + 1);
      setNotice({ type: "success", text: `"${post.title}" was deleted.` });
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  const { posts, counts, error } = result;
  const total = counts.draft + counts.published;
  const countOf = { all: total, draft: counts.draft, published: counts.published };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/admin" className="text-sm font-medium text-primary hover:underline">
        &larr; Back to dashboard
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">Blog posts</h1>
          <p className="mt-0.5 text-xs text-muted">Create, edit, publish, and manage articles for the library.</p>
        </div>
        <Link to="/admin/blog/new" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark">
          + Create a blog
        </Link>
      </div>

      <div role="tablist" aria-label="Post status" className="mt-6 flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setSearchParams(t.key === "all" ? {} : { status: t.key })}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
            <span className="ml-1.5 rounded-full bg-soft px-2 py-0.5 text-xs">{countOf[t.key]}</span>
          </button>
        ))}
      </div>

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

      <div className="mt-6" aria-live="polite">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-soft" />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="rounded-lg bg-red-50 px-4 py-6 text-center text-red-700">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl bg-soft px-4 py-14 text-center">
            <p className="text-lg font-semibold text-primary">No blog posts found</p>
            <p className="mt-1 text-sm text-muted">Write your first post to share articles, book reviews, or tips.</p>
            <Link
              to="/admin/blog/new"
              className="mt-4 inline-block rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
            >
              + Create a blog
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {posts.map((post) => {
              const published = post.status === "published";
              const busy = busyId === post._id;
              return (
                <li key={post._id} className="rounded-xl border border-line bg-surface p-4 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 dir="auto" className="font-sans text-base font-semibold text-ink">{post.title}</h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        published ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {post.category} &middot; {published ? `Published ${formatDate(post.publishedAt)}` : `Edited ${formatDate(post.updatedAt)}`}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium">
                    <Link to={`/admin/blog/${post._id}/edit`} className="text-primary hover:underline">
                      Edit
                    </Link>
                    {published && (
                      <Link to={`/blog/${post.slug}`} className="text-primary hover:underline">
                        View
                      </Link>
                    )}
                    <button onClick={() => toggleStatus(post)} disabled={busy} className="text-primary hover:underline disabled:opacity-50">
                      {published ? "Unpublish" : "Publish"}
                    </button>
                    <button onClick={() => remove(post)} disabled={busy} className="text-red-600 hover:underline disabled:opacity-50">
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}