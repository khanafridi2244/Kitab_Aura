
import { Link } from "react-router-dom";

export default function ReadingInspiration() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid items-center gap-8 overflow-hidden rounded-3xl bg-soft md:grid-cols-2">
        
        {/* Text content */}
        <div className="p-8 md:p-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Discover • Learn • Grow
          </p>

          <h2 className="text-3xl font-bold text-primary md:text-4xl">
            Every Book Opens a New World
          </h2>

          <p className="mt-4 leading-7 text-muted">
            Explore inspiring stories, discover new ideas, and make reading
            a part of your everyday life. Your next great read is waiting.
          </p>

          <Link
            to="/browse"
            className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-dark"
          >
            Explore Books
          </Link>
        </div>

        {/* Image */}
        <div className="h-72 md:h-full md:min-h-[350px]">
          <img
            src="/images/reading inspiration.png"
            alt="A peaceful reading environment"
            className="h-full w-full object-cover"
          />
        </div>

      </div>
    </section>
  );
}
