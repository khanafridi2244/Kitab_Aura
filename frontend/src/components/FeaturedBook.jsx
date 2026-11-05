import { Link } from "react-router-dom";

// A highlighted book card.
// variant: "equal" (default) — uniform card for 3-column grid
//          "hero"    — large left-border accent card
//          "compact" — smaller card
export default function FeaturedBook({ label, book, variant = "equal" }) {
  if (!book) return null;

  const isHero = variant === "hero";
  const isEqual = variant === "equal";

  return (
    <section
      aria-label={label}
      className={`flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md ${isHero ? "border-l-4 border-l-accent p-5 sm:p-7" : "p-4 sm:p-5"
        }`}
    >
      {/* Label badge */}
      <span
        className={`inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${isHero || isEqual
            ? "bg-accent/20 text-amber-800"
            : "bg-primary/10 text-primary"
          }`}
      >
        {(isHero || isEqual) && (
          <span className="text-accent" aria-hidden="true">★</span>
        )}
        {label}
      </span>

      {/* Cover + info */}
      <div className={`mt-4 flex flex-1 gap-4 ${isHero ? "sm:gap-7" : "sm:gap-4"}`}>
        {/* Cover */}
        <Link
          to={`/books/${book._id}`}
          className={`shrink-0 self-start overflow-hidden rounded-xl border border-gray-200 bg-soft transition-opacity hover:opacity-90 ${isHero ? "w-28 sm:w-44" : "w-20 sm:w-24"
            }`}
        >
          <div className="aspect-3/4">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={`Cover of ${book.title}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary p-3 text-center text-sm font-bold text-white">
                {book.title}
              </div>
            )}
          </div>
        </Link>

        {/* Meta */}
        <div className="flex min-w-0 flex-1 flex-col">
          <h3
            className={`font-bold leading-snug text-ink ${isHero ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
              }`}
          >
            <Link to={`/books/${book._id}`} className="hover:text-primary hover:underline">
              {book.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted">by {book.author}</p>

          {/* Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-soft px-2.5 py-0.5 font-semibold capitalize text-primary">
              {book.language}
            </span>
            {book.category && (
              <span className="rounded-full bg-soft px-2.5 py-0.5 font-semibold text-primary">
                {book.category.name}
              </span>
            )}
            {book.ratingsCount > 0 && (
              <span className="text-muted">
                <span className="text-accent">&#9733;</span>{" "}
                {book.avgRating.toFixed(1)}
              </span>
            )}
          </div>

          {book.description && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
              {book.description}
            </p>
          )}

          {/* Push button to the bottom */}
          <div className="mt-auto pt-4">
            <Link
              to={`/books/${book._id}`}
              className="inline-block rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              View book
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}