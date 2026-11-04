import { Link } from "react-router-dom";
import { langCode } from "../utils/lang";

const PANELS = [
  { key: "pashto", label: "Pashto", native: "پښتو", lang: "ps", rtl: true },
  { key: "urdu", label: "Urdu", native: "اردو", lang: "ur", rtl: true },
  { key: "english", label: "English", native: "English", lang: "en", rtl: false },
];

// A panel only appears when that language has published books
export default function LanguageCollections({ languages }) {
  const panels = PANELS.filter((p) => languages?.[p.key]?.length > 0);
  if (panels.length === 0) return null;

  return (
    <section id="languages" aria-labelledby="languages-heading" className="py-10">
      <h2 id="languages-heading" className="text-2xl font-semibold text-primary sm:text-3xl">
        Language Collections
      </h2>
      <p className="mt-1 text-sm text-muted">Find books in the language you love to read.</p>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {panels.map((p) => (
          <div key={p.key} className="flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
              <h3 className="text-lg font-semibold text-ink">{p.label}</h3>
              <span lang={p.lang} dir={p.rtl ? "rtl" : "ltr"} className="text-lg font-semibold text-primary">
                {p.native}
              </span>
            </div>

            <ul className="mt-3 flex-1 space-y-2">
              {languages[p.key].map((b) => (
                <li key={b._id}>
                  <Link to={`/books/${b._id}`} className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-soft">
                    <div className="h-14 w-10 shrink-0 overflow-hidden rounded bg-soft">
                      {b.coverUrl ? (
                        <img src={b.coverUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-primary" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p lang={langCode(b.language)} dir="auto" className="truncate text-sm font-semibold text-ink">
                        {b.title}
                      </p>
                      <p lang={langCode(b.language)} dir="auto" className="truncate text-xs text-muted">
                        {b.author}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <Link to={`/browse?language=${p.key}`} className="mt-4 text-sm font-semibold text-primary hover:underline">
              Browse all {p.label} books &rarr;
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}