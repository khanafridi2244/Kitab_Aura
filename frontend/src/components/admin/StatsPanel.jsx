import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../api/axios";

const LANGUAGE_COLORS = {
  pashto: "bg-primary",
  urdu: "bg-accent",
  english: "bg-blue-600",
  arabic: "bg-purple-600",
  persian: "bg-rose-600",
};

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-soft p-4">
      <p className="text-2xl font-bold text-primary">{value.toLocaleString()}</p>
      <p className="text-sm font-medium text-ink">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-primary">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

// refreshKey: change it to reload the numbers (for example after approving a book)
export default function StatsPanel({ refreshKey = 0 }) {
  const [state, setState] = useState({ loading: true, stats: null, error: "" });

  useEffect(() => {
    let active = true;
    api
      .get("/admin/stats")
      .then(({ data }) => active && setState({ loading: false, stats: data.stats, error: "" }))
      .catch((err) => active && setState({ loading: false, stats: null, error: getErrorMessage(err) }));
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const { loading, stats, error } = state;

  if (loading) {
    return (
      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-soft" />
          ))}
        </div>
        <div className="h-48 animate-pulse rounded-xl bg-soft" />
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-4 text-sm text-red-700">
        Could not load statistics: {error}
      </div>
    );
  }

  const maxMonth = Math.max(1, ...stats.monthly.map((m) => m.count));
  const maxLanguage = Math.max(1, ...stats.byLanguage.map((l) => l.count));

  return (
    <div className="mt-6 space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Published books" value={stats.books.approved} hint={`${stats.books.total} in total`} />
        <StatCard label="Users" value={stats.users} />
        <StatCard label="Pending approval" value={stats.books.pending} hint={`${stats.books.rejected} rejected`} />
        <StatCard label="Downloads" value={stats.downloads} hint={`${stats.categories} categories`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Uploads per month */}
        <div className="lg:col-span-3">
          <Card title="Books uploaded per month">
            <div
              role="img"
              aria-label={`Uploads per month: ${stats.monthly.map((m) => `${m.label} ${m.count}`).join(", ")}`}
              className="flex h-40 items-end gap-2 border-b border-gray-200"
            >
              {stats.monthly.map((m) => (
                <div key={m.label} className="flex h-full flex-1 flex-col justify-end">
                  <span className="mb-1 text-center text-xs font-semibold text-ink">{m.count}</span>
                  <div
                    className="w-full rounded-t bg-primary last:bg-accent"
                    style={{ height: `${(m.count / maxMonth) * 85}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-1 flex gap-2">
              {stats.monthly.map((m) => (
                <span key={m.label} className="flex-1 text-center text-xs text-muted">
                  {m.label}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* Books by language */}
        <div className="lg:col-span-2">
          <Card title="Published books by language">
            {stats.byLanguage.length === 0 ? (
              <p className="text-sm text-muted">No published books yet.</p>
            ) : (
              <ul className="space-y-3">
                {stats.byLanguage.map((l) => (
                  <li key={l.language}>
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{l.language}</span>
                      <span className="font-semibold">{l.count}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-soft">
                      <div
                        className={`h-full rounded-full ${LANGUAGE_COLORS[l.language] || "bg-primary"}`}
                        style={{ width: `${(l.count / maxLanguage) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Top books */}
      <Card title="Most downloaded books">
        {stats.topBooks.length === 0 ? (
          <p className="text-sm text-muted">No downloads yet.</p>
        ) : (
          <ol className="divide-y divide-gray-100">
            {stats.topBooks.map((b, i) => (
              <li key={b._id} className="flex items-center gap-3 py-2 text-sm">
                <span className="w-5 font-bold text-accent">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">{b.title}</span>
                  <span className="block truncate text-xs text-muted">
                    {b.author} &middot; <span className="capitalize">{b.language}</span>
                  </span>
                </span>
                <span className="shrink-0 font-semibold text-primary">{b.downloads}</span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}