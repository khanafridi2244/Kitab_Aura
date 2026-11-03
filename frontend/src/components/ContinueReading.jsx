import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";

// Home page row: the books a logged-in user is in the middle of. Shows nothing for guests
export default function ContinueReading() {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id;

  // "userId" records who these items belong to, so a stale list is never shown to someone else
  const [result, setResult] = useState({ userId: null, items: [] });

  useEffect(() => {
    if (!userId) return;
    let active = true;
    api
      .get("/library")
      .then(
        ({ data }) =>
          active &&
          setResult({ userId, items: data.items.filter((i) => i.status === "reading").slice(0, 3) })
      )
      .catch(() => active && setResult({ userId, items: [] })); // a bonus section, so errors stay quiet
    return () => {
      active = false;
    };
  }, [userId]);

  if (!isAuthenticated || result.userId !== userId || result.items.length === 0) return null;

  return (
    <section className="mt-8" aria-labelledby="continue-heading">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="continue-heading" className="text-xl font-bold text-primary">
          Continue reading
        </h2>
        <Link to="/library" className="text-sm font-medium text-primary hover:underline">
          My library &rarr;
        </Link>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {result.items.map(({ book, page, percent }) => (
          <Link
            key={book._id}
            to={`/read/${book._id}`}
            className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 transition hover:shadow-md"
          >
            <div className="h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-soft">
              {book.coverUrl ? (
                <img src={book.coverUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary p-1 text-center text-[9px] font-bold text-white">
                  {book.title}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{book.title}</p>
              <p className="truncate text-xs text-muted">{book.author}</p>

              {percent !== null ? (
                <div className="mt-2">
                  <div className="h-1.5 overflow-hidden rounded-full bg-soft">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted">{percent}% complete</p>
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted">Page {page}</p>
              )}

              <span className="mt-1 inline-block text-xs font-semibold text-primary">Continue &rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}