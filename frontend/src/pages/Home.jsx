import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import Hero from "../components/Hero";
import CategoryGrid from "../components/CategoryGrid";
import ContinueReading from "../components/ContinueReading";
import RecommendedRow from "../components/RecommendedRow";
import DailyPicks from "../components/DailyPicks";
import BookCarousel from "../components/BookCarousel";
import LanguageCollections from "../components/LanguageCollections";
import AboutSection from "../components/AboutSection";
import FaqSection from "../components/FaqSection";
import NewsletterSection from "../components/NewsletterSection";
import LatestBlogs from "../components/LatestBlogs";

export default function Home() {
  const [reloadKey, setReloadKey] = useState(0);
  // "key" records which request these results belong to, so loading = (results are outdated)
  const [result, setResult] = useState({ key: null, data: null, error: "" });
  const loading = result.key !== reloadKey;

  // One request feeds every book section on this page
  useEffect(() => {
    let active = true;
    api
      .get("/home")
      .then(({ data }) => active && setResult({ key: reloadKey, data, error: "" }))
      .catch((err) => active && setResult({ key: reloadKey, data: null, error: getErrorMessage(err) }));
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const { data, error } = result;
  const isEmpty = data && !data.daily.bookOfTheDay && data.newest.length === 0;

  return (
    <>
      <Hero />
      <CategoryGrid />

      <div className="mx-auto max-w-6xl px-4">
        <ContinueReading />
        <RecommendedRow />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-4" aria-live="polite">
        {loading ? (
          <div className="space-y-4 py-10">
            <div className="h-56 animate-pulse rounded-2xl bg-soft" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-3/4 w-40 shrink-0 animate-pulse rounded-xl bg-soft" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div role="alert" className="my-10 rounded-xl bg-red-50 px-4 py-8 text-center text-red-700">
            <p>Could not load the library: {error}</p>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="mt-3 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Try again
            </button>
          </div>
        ) : isEmpty ? (
          <div className="my-10 rounded-xl bg-soft px-4 py-16 text-center">
            <p className="text-lg font-semibold text-primary">The library is empty for now</p>
            <p className="mt-1 text-sm text-muted">Be the first to share a book.</p>
            <Link to="/upload" className="mt-4 inline-block font-semibold text-primary underline">
              Upload a book
            </Link>
          </div>
        ) : (
          <>
            <DailyPicks daily={data.daily} />
            <BookCarousel id="trending" title="Trending Books" subtitle="What readers are downloading right now" to="/popular" books={data.trending} />
            <BookCarousel id="recent" title="Recently Added" subtitle="The newest books in the library" to="/browse" books={data.newest} />
            <LanguageCollections languages={data.languages} />
          </>
        )}
      </div>

      <AboutSection />

      <div className="mx-auto max-w-6xl px-4">
        <FaqSection />
        <NewsletterSection />
        <LatestBlogs />
      </div>
    </>
  );
}