
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";

const MAX_SHOWN = 12;

const categoryImages = {
  "art-culture": "/images/categories/art-culture.webp",
  "business-management": "/images/categories/business-management.webp",
  "children-books": "/images/categories/children-books.webp",
  "computer-science": "/images/categories/computer-science.webp",
  dictionaries: "/images/categories/dictionaries.webp",
  "dramas-and-plays": "/images/categories/dramas-and-plays.webp",
  economics: "/images/categories/economics.webp",
  education: "/images/categories/education.webp",
  biography: "/images/categories/biography.webp",
  novel: "/images/categories/novel.webp",
  poetry: "/images/categories/poetry.webp",
};

export default function CategoryGrid() {
  const [reloadKey, setReloadKey] = useState(0);

  const [result, setResult] = useState({
    key: null,
    categories: [],
    error: "",
  });

  const loading = result.key !== reloadKey;

  useEffect(() => {
    let active = true;

    api
      .get("/categories", { params: { counts: true } })
      .then(({ data }) => {
        if (active) {
          setResult({
            key: reloadKey,
            categories: data.categories || [],
            error: "",
          });
        }
      })
      .catch((err) => {
        if (active) {
          setResult({
            key: reloadKey,
            categories: [],
            error: getErrorMessage(err),
          });
        }
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const shown = [...result.categories]
    .sort((a, b) => (b.bookCount || 0) - (a.bookCount || 0))
    .slice(0, MAX_SHOWN);

  if (!loading && !result.error && shown.length === 0) {
    return null;
  }

  return (
    <section
      id="categories"
      aria-labelledby="categories-heading"
      className="mx-auto max-w-6xl px-4 py-12"
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            Explore our library
          </p>

          <h2
            id="categories-heading"
            className="text-2xl font-bold text-heading sm:text-3xl"
          >
            Browse Categories
          </h2>

          <p className="mt-2 text-sm text-muted">
            Discover books across different subjects and genres.
          </p>
        </div>

        <Link
          to="/categories"
          className="hidden text-sm font-semibold text-primary transition hover:underline sm:block"
        >
          View All
        </Link>
      </div>

      {loading && (
        <p className="py-8 text-center text-muted">
          Loading categories...
        </p>
      )}

      {!loading && result.error && (
        <div className="py-8 text-center">
          <p className="mb-3 text-sm text-red-500">{result.error}</p>

          <button
            onClick={() => setReloadKey((key) => key + 1)}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !result.error && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((category) => {
            const image =
              categoryImages[category.slug] ||
              "/images/categories/art-culture.webp";

            return (
              <Link
                key={category._id}
                to={`/category/${category.slug}`}
                className="group relative isolate flex min-h-40 items-end overflow-hidden rounded-2xl bg-gray-200 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:min-h-48"
              >
                <img
                  src={image}
                  alt={category.name}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  className="absolute inset-0 -z-10 h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                <div className="w-full p-4 text-white">
                  <h3 className="text-base font-bold sm:text-lg">
                    {category.name}
                  </h3>

                  <p className="mt-1 text-xs text-white/80">
                    {category.bookCount || 0}{" "}
                    {(category.bookCount || 0) === 1 ? "Book" : "Books"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
