import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import BookCard from "./BookCard";

const BASIS_TEXT = {
  preferences: "Based on the languages and topics you chose",
  activity: "Based on the books you read and save",
  popular: "Popular with other readers",
};

// Home page row for logged-in users. Shows nothing for guests
export default function RecommendedRow() {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id;

  // "userId" records who these books were picked for, so one user never sees another's list
  const [result, setResult] = useState({ userId: null, books: [], basis: "popular" });

  useEffect(() => {
    if (!userId) return;
    let active = true;
    api
      .get("/users/recommended")
      .then(({ data }) => active && setResult({ userId, books: data.books, basis: data.basis }))
      .catch(() => active && setResult({ userId, books: [], basis: "popular" })); // a bonus section, so errors stay quiet
    return () => {
      active = false;
    };
  }, [userId]);

  if (!isAuthenticated || result.userId !== userId || result.books.length === 0) return null;

  return (
    <section className="mt-8" aria-labelledby="recommended-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <div>
          <h2 id="recommended-heading" className="text-xl font-bold text-primary">
            Recommended for you
          </h2>
          <p className="text-sm text-muted">{BASIS_TEXT[result.basis]}</p>
        </div>
        <Link to="/profile" className="text-sm font-medium text-primary hover:underline">
          Change preferences &rarr;
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {result.books.map((book) => (
          <BookCard key={book._id} book={book} />
        ))}
      </div>
    </section>
  );
}