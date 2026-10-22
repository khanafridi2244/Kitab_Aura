import { Link } from "react-router-dom";

const COLORS = ["#0f5c4d", "#d9a441", "#2f6f9f", "#9c4a5a", "#5b7f3a", "#7a5ca8"];

// Same title always gets the same colour for the placeholder cover
const colorFor = (text = "") => COLORS[[...text].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % COLORS.length];

export default function BookCard({ book }) {
  return (
    <Link
      to={`/books/${book._id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-md"
    >
       <div className="aspect-3/4 w-full overflow-hidden bg-soft">        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center p-4 text-center text-lg font-bold text-white"
            style={{ backgroundColor: colorFor(book.title) }}
          >
            {book.title}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-ink">{book.title}</h3>
        <p className="truncate text-xs text-muted">{book.author}</p>

        <div className="mt-auto flex items-center justify-between pt-2 text-xs">
          <span className="rounded-full bg-soft px-2 py-0.5 font-medium capitalize text-primary">
            {book.language}
          </span>
          {book.ratingsCount > 0 ? (
            <span className="text-muted">
              <span className="text-accent">&#9733;</span> {book.avgRating.toFixed(1)}
            </span>
          ) : (
            <span className="text-muted">{book.downloads} downloads</span>
          )}
        </div>
      </div>
    </Link>
  );
}