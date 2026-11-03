import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/axios";

const PERIOD_LABEL = { day: "Daily", week: "Weekly", month: "Monthly" };
const RESETS = { day: "Resets every day", week: "Resets every Monday", month: "Resets on the 1st" };

// A simple symbol for each badge
const SYMBOL = {
  "beginner-reader": "\u2605",
  "book-explorer": "\u25C6",
  "weekly-reader": "\u2726",
  "reading-champion": "\u265B",
};

function ProgressBar({ value, target, done }) {
  const percent = Math.round((value / target) * 100);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={target}
      aria-valuenow={value}
      className="h-2 overflow-hidden rounded-full bg-soft"
    >
      <div
        className={`h-full rounded-full transition-all ${done ? "bg-green-600" : "bg-primary"}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export default function Challenges() {
  const [state, setState] = useState({ loading: true, data: null, error: "" });

  useEffect(() => {
    let active = true;
    api
      .get("/challenges")
      .then(({ data }) => active && setState({ loading: false, data, error: "" }))
      .catch((err) => active && setState({ loading: false, data: null, error: getErrorMessage(err) }));
    return () => {
      active = false;
    };
  }, []);

  const { loading, data, error } = state;

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="h-8 w-56 animate-pulse rounded bg-soft" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-soft" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div role="alert" className="rounded-lg bg-red-50 px-4 py-6 text-center text-red-700">
          {error}
        </div>
      </div>
    );
  }

  const { challenges, badges, newBadges } = data;
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-primary">Challenges and badges</h1>
      <p className="mt-1 text-sm text-muted">Read a little every day, finish books and collect badges along the way.</p>

      {newBadges.length > 0 && (
        <div role="status" className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
          <span className="font-semibold">New badge earned!</span> {newBadges.map((b) => b.title).join(", ")}
        </div>
      )}

      {/* Challenges */}
      <h2 className="mt-8 text-lg font-bold text-ink">Challenges</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {challenges.map((c) => (
          <section
            key={c.key}
            aria-label={c.title}
            className={`rounded-xl border p-4 shadow-sm ${
              c.completed ? "border-green-300 bg-green-50" : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full bg-soft px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
                {PERIOD_LABEL[c.period]}
              </span>
              {c.completed && <span className="text-sm font-semibold text-green-700">&#10003; Done</span>}
            </div>

            <h3 className="mt-2 font-semibold text-ink">{c.title}</h3>
            <p className="text-sm text-muted">{c.description}</p>

            <div className="mt-3">
              <ProgressBar value={c.progress} target={c.target} done={c.completed} />
              <p className="mt-1 flex justify-between text-xs text-muted">
                <span>
                  {c.progress} / {c.target} {c.unit}
                </span>
                <span>{RESETS[c.period]}</span>
              </p>
            </div>
          </section>
        ))}
      </div>

      {/* Badges */}
      <h2 className="mt-10 text-lg font-bold text-ink">
        Badges <span className="text-base font-medium text-muted">({earnedCount} of {badges.length} earned)</span>
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {badges.map((b) => (
          <section
            key={b.key}
            aria-label={`${b.title} badge, ${b.earned ? "earned" : "locked"}`}
            className={`flex gap-4 rounded-xl border p-4 shadow-sm ${
              b.earned ? "border-accent bg-amber-50" : "border-gray-200 bg-white"
            }`}
          >
            <div
              aria-hidden="true"
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl font-bold ${
                b.earned ? "bg-accent text-white" : "bg-gray-200 text-gray-400"
              }`}
            >
              {SYMBOL[b.key] || "\u2605"}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className={`font-semibold ${b.earned ? "text-ink" : "text-muted"}`}>{b.title}</h3>
              <p className="text-sm text-muted">{b.description}</p>

              {b.earned ? (
                <p className="mt-2 text-xs font-semibold text-amber-800">
                  Earned {b.awardedAt && new Date(b.awardedAt).toLocaleDateString()}
                </p>
              ) : (
                <div className="mt-2">
                  <ProgressBar value={b.progress} target={b.target} />
                  <p className="mt-1 text-xs text-muted">
                    {b.progress} / {b.target} {b.unit}
                  </p>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}