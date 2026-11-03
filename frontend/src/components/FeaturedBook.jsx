import { Link } from "react-router-dom";

// A highlighted book: used for Book of the Day and the language picks
export default function FeaturedBook({ label, book, large = false }) {
  if (!book) return null;

  return (
    <section
      aria-label={label}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <span className="inline-block rounded-full bg-accent/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
        {label}
      </span>

      <div className="mt-4 flex gap-4 sm:gap-6">
        <Link
          to={`/books/${book._id}`}
          className={`shrink-0 self-start overflow-hidden rounded-xl border border-gray-200 bg-soft ${
            large ? "w-32 sm:w-44" : "w-24 sm:w-28"
          }`}
        >
          <div className="aspect-3/4">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={`Cover of ${book.title}`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary p-3 text-center text-sm font-bold text-white">
                {book.title}
              </div>
            )}
          </div>
        </Link>

        <div className="min-w-0 flex-1">
          <h3 className={`font-bold text-ink ${large ? "text-2xl" : "text-lg"}`}>
            <Link to={`/books/${book._id}`} className="hover:text-primary hover:underline">
              {book.title}
            </Link>
          </h3>
          <p className="mt-0.5 text-muted">by {book.author}</p>

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
                <span className="text-accent">&#9733;</span> {book.avgRating.toFixed(1)}
              </span>
            )}
          </div>

          {book.description && (
            <p className={`mt-3 text-sm leading-relaxed ${large ? "line-clamp-4" : "line-clamp-3"}`}>
              {book.description}
            </p>
          )}

          <Link
            to={`/books/${book._id}`}
            className="mt-4 inline-block rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            View book
          </Link>
        </div>
      </div>
    </section>
  );
}