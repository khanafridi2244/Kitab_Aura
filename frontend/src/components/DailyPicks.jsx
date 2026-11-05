import FeaturedBook from "./FeaturedBook";

const TODAY = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

// Book of the Day plus Today's Pashto and Urdu picks. All chosen by the server, never in the browser
export default function DailyPicks({ daily }) {
  const { bookOfTheDay, pashto, urdu } = daily;

  return (
    <section id="book-of-the-day" aria-labelledby="daily-heading" className="py-10">
      {/* ── Section header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="daily-heading"
            className="text-2xl font-semibold text-primary sm:text-3xl"
          >
            Today&apos;s picks
          </h2>
          <p className="mt-1 text-sm text-muted">
            {TODAY} &middot; chosen fresh every day
          </p>
        </div>

        {/* Date badge */}
        <span className="shrink-0 rounded-full border border-line bg-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted">
          {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>

      {/* ── Divider ── */}
      <div className="mt-4 h-px bg-gradient-to-r from-accent/40 via-line to-transparent" />

      {/* ── 3-column equal grid ── */}
      {bookOfTheDay ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FeaturedBook label="Book of the Day" book={bookOfTheDay} variant="equal" />
          <FeaturedBook label="Today's Pashto Book" book={pashto} variant="equal" />
          <FeaturedBook label="Today's Urdu Book" book={urdu} variant="equal" />
        </div>
      ) : (
        <p className="mt-6 rounded-xl bg-soft px-4 py-10 text-center text-sm text-muted">
          No book of the day yet. Check back soon.
        </p>
      )}
    </section>
  );
}