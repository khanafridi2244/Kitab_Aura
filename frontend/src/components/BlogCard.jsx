import { Link } from "react-router-dom";
import { scriptLang } from "../utils/lang";
import { formatDate, thumb } from "../utils/blog";

// The whole card is clickable, through the title link. It works with the keyboard too
export default function BlogCard({ post }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition hover:shadow-md focus-within:ring-2 focus-within:ring-accent">
      <div className="aspect-video w-full overflow-hidden bg-soft">
        {post.featuredImageUrl ? (
          <img
            src={thumb(post.featuredImageUrl, 640)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary text-4xl text-accent" aria-hidden="true">
            &#10086;
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">{post.category}</span>

        <h3 lang={scriptLang(post.title)} dir="auto" className="mt-1 text-lg font-semibold leading-snug text-ink">
          <Link to={`/blog/${post.slug}`} className="after:absolute after:inset-0 focus:outline-none">
            {post.title}
          </Link>
        </h3>

        {post.excerpt && (
          <p lang={scriptLang(post.excerpt)} dir="auto" className="mt-2 line-clamp-3 text-sm text-muted">
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto pt-4">
          <p className="text-xs text-muted">
            {post.author?.name && <>{post.author.name} &middot; </>}
            {formatDate(post.publishedAt)}
          </p>
          <span className="mt-2 inline-block text-sm font-semibold text-primary">Read Article &rarr;</span>
        </div>
      </div>
    </article>
  );
}