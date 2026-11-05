// Category photos.
// 1) Pictures kept in frontend/public/ are listed in PUBLIC_IMAGES, one line per category slug.
// 2) Any other image inside frontend/src is matched to a category by its file name.

const files = import.meta.glob("../**/*.{webp,jpg,jpeg,png,avif}", {
  eager: true,
  query: "?url",
  import: "default",
});

const normalize = (text = "") => String(text).toLowerCase().replace(/[^a-z0-9]/g, "");

const entries = Object.entries(files).map(([path, url]) => [
  normalize(path.split("/").pop().replace(/\.[^.]+$/, "")),
  url,
]);

// Exact name first, then names that contain it ("biography-books" still matches "biography")
const findByName = (key) => {
  if (!key) return "";
  const exact = entries.find(([name]) => name === key);
  if (exact) return exact[1];
  const loose = entries.find(([name]) => name.includes(key) || (name.length >= 4 && key.includes(name)));
  return loose ? loose[1] : "";
};

// Makes a safe address: removes double slashes, encodes spaces and the & sign
const toUrl = (path) => "/" + path.split("/").filter(Boolean).map(encodeURIComponent).join("/");

// Slug = the category name in lowercase, every group of other characters becomes one dash:
//   "Children's Books" -> children-s-books      "Drama & Plays" -> drama-plays
const PUBLIC_IMAGES = {
  "art-culture": "/images/categories/Art & Culture.jpg",
  "business-management": "/images/categories/Business & Management.jpg",
  "children-s-books": "/images/categories/Childrens Books.jpg",
  "computer-science": "/images/categories/cs.png",
  dictionaries: "/images/categories/Dictionaries.jpg",
  "drama-plays": "/images/categories/drama.png",
  economics: "/images/categories/economics.jpg",
  education: "/images/categories/education.jpg",
  biography: "/images/categories/history.webp",
  novel: "/images/categories/fiction.webp",
  poetry: "/images/categories/poetry.webp",
};

// Works with a whole category, or with just a slug
export const categoryImage = (category) => {
  const slug = typeof category === "string" ? category : category?.slug;
  const name = typeof category === "string" ? "" : category?.name;
  const fromPublic = PUBLIC_IMAGES[slug];
  return fromPublic ? toUrl(fromPublic) : findByName(normalize(slug)) || findByName(normalize(name)) || "";
};