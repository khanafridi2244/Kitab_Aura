import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LANGUAGES = [
  { key: "pashto", label: "Pashto" },
  { key: "urdu", label: "Urdu" },
  { key: "english", label: "English" },
  { key: "arabic", label: "Arabic" },
  { key: "persian", label: "Persian" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
  };

  return (
    <section className="bg-soft">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-primary sm:text-4xl">Read the Books free of cost</h1>
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
  );
}