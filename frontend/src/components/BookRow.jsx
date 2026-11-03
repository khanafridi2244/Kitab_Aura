import { Link } from "react-router-dom";
import BookCard from "./BookCard";

// A titled row of book cards with a "View all" link
export default function BookRow({ title, to, books }) {
  if (!books || books.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-bold text-primary">{title}</h2>
        <Link to={to} className="text-sm font-medium text-primary hover:underline">
          View all &rarr;
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {books.map((book) => (
          <BookCard key={book._id} book={book} />
        ))}
      </div>
    </section>
  );
}