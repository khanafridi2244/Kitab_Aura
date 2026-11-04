import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import ArticleBody from "../components/ArticleBody";
import BlogCard from "../components/BlogCard";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { scriptLang } from "../utils/lang";
import { formatDate, thumb } from "../utils/blog";

export default function BlogPost() {
  const { slug } = useParams();
  // "slug" records which article these results belong to, so loading = (results are for another article)
  const [result, setResult] = useState({ slug: null, post: null, error: "" });
  const [more, setMore] = useState({ slug: null, posts: [] });
  const [copied, setCopied] = useState(false);
  const loading = result.slug !== slug;
  const post = result.slug === slug ? result.post : null;

  useDocumentMeta(
    post ? post.seoTitle || `${post.title} - KitabAura` : undefined,
    post ? post.seoDescription || post.excerpt : undefined
  );

  useEffect(() => {
    let active = true;
    api
      .get(`/blog/${slug}`)
      .then(({ data }) => active && setResult({ slug, post: data.post, error: "" }))
      .catch((err) => active && setResult({ slug, post: null, error: getErrorMessage(err) }));
    return () => {
      active = false;
    };
  }, [slug]);

  // More articles to read
  useEffect(() => {
    let active = true;
    api
      .get("/blog", { params: { limit: 4 } })
      .then(({ data }) => active && setMore({ slug, posts: data.posts.filter((p) => p.slug !== slug).slice(0, 3) }))
      .catch(() => active && setMore({ slug, posts: [] }));
    return () => {
      active = false;
    };
  }, [slug]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access can be blocked, nothing to do
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="h-8 w-3/4 animate-pulse rounded bg-soft" />
        <div className="mt-6 aspect-video animate-pulse rounded-2xl bg-soft" />
        <div className="mt-6 h-40 animate-pulse rounded bg-soft" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-primary">Article not found</h1>
        <p className="mt-2 text-muted">{result.error || "This article is not available."}</p>
        <Link to="/blog" className="mt-4 inline-block font-semibold text-primary underline">
          Back to the blog
        </Link>
      </div>
    );
  }

  const relatedPosts = more.slug === slug ? more.posts : [];

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/blog" className="text-sm font-medium text-primary hover:underline">
        &larr; All articles
      </Link>

      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-primary">{post.category}</p>
      <h1 lang={scriptLang(post.title)} dir="auto" className="mt-2 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
        {post.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
        {post.author?.name && <span>By {post.author.name}</span>}
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        <span>{post.readingMinutes} min read</span>
        <button onClick={copyLink} className="font-medium text-primary hover:underline">
          {copied ? "Link copied" : "Copy link"}
        </button>
      </div>

      {post.featuredImageUrl && (
        <img
          src={thumb(post.featuredImageUrl, 1200)}
          alt=""
          className="mt-6 aspect-video w-full rounded-2xl border border-line object-cover"
        />
      )}

      <div className="mt-8">
        <ArticleBody content={post.content} />
      </div>

      {relatedPosts.length > 0 && (
        <section className="mt-14 border-t border-line pt-8" aria-labelledby="more-heading">
          <h2 id="more-heading" className="text-2xl font-semibold text-primary">
            More to read
          </h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((p) => (
              <BlogCard key={p._id} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}