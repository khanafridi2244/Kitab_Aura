import { useRef } from "react";
import { Link } from "react-router-dom";
import BookCard from "./BookCard";

// A titled row of books that scrolls sideways. Swipe on phones, arrow buttons on larger screens
export default function BookCarousel({ id, title, subtitle, to, books }) {
  const trackRef = useRef(null);

  if (!books || books.length === 0) return null;

  const scroll = (direction) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const arrow =
    "hidden h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-primary hover:bg-soft md:inline-flex";

  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id={`${id}-heading`} className="text-2xl font-semibold text-primary sm:text-3xl">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => scroll(-1)} aria-label={`Scroll ${title} left`} className={arrow}>
            &larr;
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label={`Scroll ${title} right`} className={arrow}>
            &rarr;
          </button>
          <Link to={to} className="ml-1 text-sm font-medium text-primary hover:underline">
            View all &rarr;
          </Link>
        </div>
      </div>

      <div
        ref={trackRef}
        role="region"
        aria-label={title}
        tabIndex={0}
        className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3"
      >
        {books.map((book) => (
          <div key={book._id} className="w-40 shrink-0 snap-start sm:w-44">
            <BookCard book={book} />
          </div>
        ))}
      </div>
    </section>
  );
}