import FeaturedBook from "./FeaturedBook";

const TODAY = new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });

// Book of the Day plus Today's Pashto and Urdu picks. All chosen by the server, never in the browser
export default function DailyPicks({ daily }) {
  const { bookOfTheDay, pashto, urdu } = daily;

  return (
    <section id="book-of-the-day" aria-labelledby="daily-heading" className="py-10">
      <h2 id="daily-heading" className="text-2xl font-semibold text-primary sm:text-3xl">
        Today&apos;s picks
      </h2>
      <p className="mt-1 text-sm text-muted">{TODAY} &middot; chosen fresh every day</p>

      {bookOfTheDay ? (
        <>
          <div className="mt-5">
            <FeaturedBook label="Book of the Day" book={bookOfTheDay} large />
          </div>
          {(pashto || urdu) && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <FeaturedBook label="Today's Pashto Book" book={pashto} />
              <FeaturedBook label="Today's Urdu Book" book={urdu} />
            </div>
          )}
        </>
      ) : (
        <p className="mt-5 rounded-xl bg-soft px-4 py-10 text-center text-sm text-muted">
          No book of the day yet. Check back soon.
        </p>
      )}
    </section>
  );
}