import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Hero() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
  };

  return (
    <section className="hero-bg relative text-white" aria-labelledby="hero-heading">
      <div className="mx-auto max-w-6xl px-4 pb-32 pt-16 sm:pb-36 sm:pt-24">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">Where every book has a story</p>
          <h1 id="hero-heading" className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Discover Stories Beyond Boundaries
          </h1>
          <p className="mt-4 text-base text-white/85 sm:text-lg">
            Explore a world of knowledge, imagination, and culture through books in Pashto, Urdu, and English.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/browse"
              className="rounded-full border border-white/30 bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Explore Books
            </Link>
            <Link
              to="/#categories"
              className="rounded-full bg-[#f3e6c8] px-6 py-2.5 text-sm font-semibold text-[#14201a] hover:bg-[#ead9b0]"
            >
              Browse Categories
            </Link>
          </div>
        </div>

        <form
          role="search"
          onSubmit={handleSearch}
          className="mt-8 flex max-w-2xl items-center gap-2 rounded-full bg-[#fbf3e2] p-1.5 shadow-lg focus-within:ring-2 focus-within:ring-accent"
        >
          <svg className="ml-3 shrink-0 text-[#5d6a63]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search books"
            placeholder="Search by title, author or keyword..."
            className="min-w-0 flex-1 bg-transparent px-1 py-2 text-[#14201a] outline-none placeholder:text-[#5d6a63]"
          />
          <button
            type="submit"
            aria-label="Search"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0f4c3a] text-white hover:bg-[#0a3629]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </button>
        </form>
      </div>

      {/* Curved edge into the page colour */}
      <svg className="absolute inset-x-0 -bottom-px h-10 w-full" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 40 C240 90 480 0 720 30 C960 60 1200 90 1440 30 L1440 80 L0 80 Z" style={{ fill: "var(--page)" }} />
      </svg>
    </section>
  );
}