import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { categoryImage } from "../utils/categoryImages";

// Priority order of featured categories on the homepage
const FEATURED_SLUGS = [
  "islamic-studies",
  "education",
  "literature",
  "novel",
  "biography",
  "business-management",
  "art-culture",
  "children-s-books",
  "economics",
  "drama-plays",
  "dictionaries",
  "poetry",
];

// Subcategories that live inside Education
const EDUCATION_SUBCATS = [
  { slug: "computer-science", fallbackName: "Computer Science", icon: "💻" },
  { slug: "science", fallbackName: "Science", icon: "🔬" },
  { slug: "mathematics", fallbackName: "Mathematics", icon: "📐" },
  { slug: "textbooks", fallbackName: "Textbooks", icon: "📚" },
];

export default function CategoryGrid() {
  const navigate = useNavigate();
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

  const allCategories = result.categories || [];

  // Map subcategories inside Education with their database IDs
  const educationSubcategories = EDUCATION_SUBCATS.map((subDef) => {
    const found = allCategories.find((c) => c.slug === subDef.slug);
    return {
      _id: found?._id || subDef.slug,
      name: found?.name || subDef.fallbackName,
      slug: subDef.slug,
      icon: subDef.icon,
      bookCount: found?.bookCount || 0,
    };
  });

  // Filter out subcategories from top-level grid so they are housed inside Education
  const subcategorySlugs = EDUCATION_SUBCATS.map((s) => s.slug);
  const hiddenCategories = ["children-books", "dramas-and-plays", ...subcategorySlugs];

  // Prioritize featured categories first (Education, Islamic Studies, Literature, etc.)
  const featured = FEATURED_SLUGS.map((slug) =>
    allCategories.find((c) => c.slug === slug)
  ).filter(Boolean);

  const remaining = allCategories
    .filter(
      (c) =>
        !FEATURED_SLUGS.includes(c.slug) &&
        !hiddenCategories.includes(c.slug)
    )
    .sort((a, b) => (b.bookCount || 0) - (a.bookCount || 0));

  const shown = [...featured, ...remaining].slice(0, 12);

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
          View All &rarr;
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
            const image = categoryImage(category);
            const isEducation = category.slug === "education";

            return (
              <div
                key={category._id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/browse?category=${category._id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/browse?category=${category._id}`);
                  }
                }}
                className={`group relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-200 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer ${
                  isEducation ? "min-h-56 sm:min-h-64" : "min-h-40 sm:min-h-48"
                }`}
              >
                {image && (
                  <img
                    src={image}
                    alt={category.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    className="absolute inset-0 -z-10 h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                )}

                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

                <div className="w-full p-4 text-white">
                  <h3 className="text-base font-bold sm:text-lg flex items-center gap-1.5">
                    {isEducation && <span>🎓</span>}
                    {category.slug === "islamic-studies" && <span>🕌</span>}
                    <span>{category.name}</span>
                  </h3>

                  {(category.nameUrdu || category.namePashto) && (
                    <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-white/80">
                      {category.nameUrdu && <span lang="ur" dir="rtl">{category.nameUrdu}</span>}
                      {category.namePashto && <span lang="ps" dir="rtl">{category.namePashto}</span>}
                    </div>
                  )}

                  <p className="mt-1 text-xs text-white/80">
                    {category.bookCount || 0}{" "}
                    {(category.bookCount || 0) === 1 ? "Book" : "Books"}
                  </p>

                  {/* Inside Education: place subcategories like Computer Science, Science, etc. */}
                  {isEducation && (
                    <div className="mt-3 border-t border-white/20 pt-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/75 mb-1.5">
                        Disciplines:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {educationSubcategories.map((sub) => (
                          <button
                            key={sub.slug}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/browse?category=${sub._id}`);
                            }}
                            className="inline-flex items-center gap-1 rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-xs transition hover:bg-white hover:text-[#0f4c3a]"
                          >
                            <span>{sub.icon}</span>
                            <span>{sub.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
