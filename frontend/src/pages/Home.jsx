import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import BookRow from "../components/BookRow";
import FeaturedBook from "../components/FeaturedBook";
import ContinueReading from "../components/ContinueReading";
import RecommendedRow from "../components/RecommendedRow";

const LANGUAGES = [
  { key: "pashto", label: "Pashto" },
  { key: "urdu", label: "Urdu" },
  { key: "english", label: "English" },
  { key: "arabic", label: "Arabic" },
  { key: "persian", label: "Persian" },
];

const TODAY = new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });

export default function Home() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState({ loading: true, data: null, error: "" });
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    api
      .get("/home")
      .then(({ data }) => active && setState({ loading: false, data, error: "" }))
      .catch((err) => active && setState({ loading: false, data: null, error: getErrorMessage(err) }));
    return () => {
      active = false;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
  };

  const { loading, data, error } = state;
  const isEmpty = data && !data.daily.bookOfTheDay && data.newest.length === 0;

  return (
    <>
      <section className="bg-soft">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center">
          <h1 className="text-3xl font-bold text-primary sm:text-4xl">Read in your language</h1>
          <p className="mt-3 text-muted">Pashto, Urdu, English and more. Free books, one library.</p>

          <form onSubmit={handleSearch} className="mt-8 flex overflow-hidden rounded-full border-2 border-primary bg-white">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author or keyword..."
              className="min-w-0 flex-1 px-5 py-3 outline-none"
            />
            <button type="submit" className="bg-accent px-6 font-semibold text-white hover:opacity-90">
              Search
            </button>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {LANGUAGES.map((l) => (
              <Link
                key={l.key}
                to={`/browse?language=${l.key}`}
                className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <ContinueReading />
         <RecommendedRow />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-12" aria-live="polite">
        {loading ? (
          <div className="mt-8 space-y-4">
            <div className="h-56 animate-pulse rounded-2xl bg-soft" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-44 animate-pulse rounded-2xl bg-soft" />
              <div className="h-44 animate-pulse rounded-2xl bg-soft" />
            </div>
          </div>
        ) : error ? (
          <div role="alert" className="mt-8 rounded-lg bg-red-50 px-4 py-6 text-center text-red-700">
            Could not load the library: {error}
          </div>
        ) : isEmpty ? (
          <div className="mt-8 rounded-xl bg-soft px-4 py-16 text-center">
            <p className="text-lg font-semibold text-primary">The library is empty for now</p>
            <p className="mt-1 text-sm text-muted">Be the first to share a book.</p>
            <Link to="/upload" className="mt-4 inline-block font-semibold text-primary underline">
              Upload a book
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-8 text-sm text-muted">Today's picks &middot; {TODAY}</p>
            <div className="mt-2">
              <FeaturedBook label="Book of the Day" book={data.daily.bookOfTheDay} large />
            </div>

            {(data.daily.pashto || data.daily.urdu) && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <FeaturedBook label="Today's Pashto Book" book={data.daily.pashto} />
                <FeaturedBook label="Today's Urdu Book" book={data.daily.urdu} />
              </div>
            )}

            <BookRow title="Trending" to="/browse?sort=popular" books={data.trending} />
            <BookRow title="Newly added" to="/browse" books={data.newest} />
          </>
        )}
      </div>
    </>
  );
}