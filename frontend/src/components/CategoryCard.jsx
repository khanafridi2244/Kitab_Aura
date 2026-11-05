import { useState } from "react";
import { Link } from "react-router-dom";
import { categoryImage } from "../utils/categoryImages";

export default function CategoryCard({ category }) {
  const image = categoryImage(category);
  const [broken, setBroken] = useState(false); // a missing file falls back to the green card
  const { bookCount } = category;

  return (
    <Link
      to={`/browse?category=${category._id}`}
      className="group relative flex aspect-4/3 flex-col justify-end overflow-hidden rounded-2xl border border-line p-4 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
      style={{ backgroundImage: "linear-gradient(135deg, #145a45 0%, #0a2a20 100%)" }}
    >
      {image && !broken ? (
        <img
          src={image}
          alt=""
          loading="lazy"
          onError={() => {
            console.warn(`[CategoryCard] Picture not found: ${image} (category: ${category.name})`);
            setBroken(true);
          }}
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <svg
          className="absolute right-4 top-4 text-accent/70"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 6.5C10.3 5.2 8 4.7 5 4.7v12.6c3 0 5.3.5 7 1.8 1.7-1.3 4-1.8 7-1.8V4.7c-3 0-5.3.5-7 1.8z" />
          <path d="M12 6.5v12.6" />
        </svg>
      )}

      {/* Dark fade so the text is always readable */}
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" aria-hidden="true" />

      <span className="relative">
        <span className="block text-lg font-semibold leading-tight">{category.name}</span>
        {(category.nameUrdu || category.namePashto) && (
          <span className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-white/85">
            {category.nameUrdu && <span lang="ur" dir="rtl">{category.nameUrdu}</span>}
            {category.namePashto && <span lang="ps" dir="rtl">{category.namePashto}</span>}
          </span>
        )}
        <span className="mt-1 block text-xs text-white/80">
          {bookCount} {bookCount === 1 ? "Book" : "Books"}
        </span>
      </span>
    </Link>
  );
}