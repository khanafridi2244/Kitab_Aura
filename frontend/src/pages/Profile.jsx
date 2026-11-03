import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import PreferencesForm from "../components/PreferencesForm";

const PRESETS = [35, 70, 140]; // 5, 10 and 20 pages a day

function Stat({ label, value, hint }) {
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
      <h2 className="text-sm font-bold text-primary">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const [reloadKey, setReloadKey] = useState(0);
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });
  const loading = !activity && !error;

  useEffect(() => {
    let active = true;
    api
      .get("/activity")
      .then(({ data }) => {
        if (!active) return;
        setActivity(data.activity);
        setError("");
        setGoalInput(data.activity.week.goal ? String(data.activity.week.goal) : "");
      })
      .catch((err) => active && setError(getErrorMessage(err)));
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const saveGoal = async (raw) => {
    const goal = Math.max(0, Math.round(Number(raw) || 0));
    setSaving(true);
    setNotice({ type: "", text: "" });
    try {
      await api.put("/activity/goal", { weeklyGoal: goal });
      setReloadKey((k) => k + 1);
      setNotice({
        type: "success",
        text: goal ? `Weekly goal set to ${goal} pages.` : "Weekly goal removed.",
      });
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveGoal(goalInput);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">{user.name}</h1>
          <p className="text-sm text-muted">
            {user.email} &middot; Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Link
          to="/library"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-primary hover:bg-soft"
        >
          My library
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-soft" />
            ))}
          </div>
          <div className="h-44 animate-pulse rounded-xl bg-soft" />
        </div>
      ) : error && !activity ? (
        <div role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-6 text-center text-red-700">
          {error}
        </div>
      ) : (
        <ProfileBody
          activity={activity}
          goalInput={goalInput}
          setGoalInput={setGoalInput}
          saving={saving}
          notice={notice}
          onSubmit={handleSubmit}
          onPreset={saveGoal}
        />
      )}

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold text-primary">Your reading preferences</h2>
        <p className="mt-1 text-sm text-muted">Used for the Recommended for you section on the home page.</p>
        <div className="mt-4">
          <PreferencesForm />
        </div>
      </section>    </div>
  );
}

function ProfileBody({ activity, goalInput, setGoalInput, saving, notice, onSubmit, onPreset }) {
  const { today, streak, week, last7, totals } = activity;
  const maxDay = Math.max(1, ...last7.map((d) => d.pages));

  const streakHint =
    streak.current === 0
      ? "Read a page today to start a streak"
      : today.pages === 0
      ? "Read today to keep it going"
      : "Keep it up!";

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Day streak" value={streak.current} hint={streakHint} />
        <Stat label="Pages today" value={today.pages} />
        <Stat label="Best streak" value={streak.best} hint="days in a row" />
        <Stat label="Books completed" value={totals.booksCompleted} hint={`${totals.pages.toLocaleString()} pages read in total`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Weekly goal */}
        <Card title="Weekly reading goal">
          {week.goal > 0 ? (
            <>
              <div className="h-3 overflow-hidden rounded-full bg-soft">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${week.percent}%` }} />
              </div>
              <p className="mt-1 text-sm text-muted">
                {week.pages} of {week.goal} pages this week ({week.percent}%)
              </p>
              {week.percent >= 100 && <p className="mt-1 text-sm font-semibold text-green-700">Goal reached. Well done!</p>}
            </>
          ) : (
            <p className="text-sm text-muted">
              You have read {week.pages} {week.pages === 1 ? "page" : "pages"} this week. Set a goal to track your progress.
            </p>
          )}

          <form onSubmit={onSubmit} className="mt-4">
            <label className="block text-sm font-medium">
              Pages per week
              <div className="mt-1 flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="For example 70"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </label>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted">Quick pick:</span>
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPreset(p)}
                  disabled={saving}
                  className="rounded-full bg-soft px-3 py-1 font-semibold text-primary hover:bg-gray-200 disabled:opacity-60"
                >
                  {p / 7} pages a day
                </button>
              ))}
              {week.goal > 0 && (
                <button
                  type="button"
                  onClick={() => onPreset(0)}
                  disabled={saving}
                  className="text-red-600 hover:underline disabled:opacity-60"
                >
                  Remove goal
                </button>
              )}
            </div>
          </form>

          {notice.text && (
            <p
              role={notice.type === "error" ? "alert" : "status"}
              className={`mt-3 rounded-lg px-3 py-2 text-sm ${
                notice.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800"
              }`}
            >
              {notice.text}
            </p>
          )}
        </Card>

        {/* Last 7 days */}
        <Card title="Pages read, last 7 days">
          <div
            role="img"
            aria-label={`Pages read: ${last7.map((d) => `${d.label} ${d.pages}`).join(", ")}`}
            className="flex h-36 items-end gap-2 border-b border-gray-200"
          >
            {last7.map((d, i) => (
              <div key={d.date} className="flex h-full flex-1 flex-col justify-end">
                <span className="mb-1 text-center text-xs font-semibold text-ink">{d.pages}</span>
                <div
                  className={`w-full rounded-t ${i === last7.length - 1 ? "bg-accent" : "bg-primary"}`}
                  style={{ height: `${(d.pages / maxDay) * 80}%`, minHeight: d.pages ? "4px" : "0" }}
                />
              </div>
            ))}
          </div>
          <div className="mt-1 flex gap-2">
            {last7.map((d) => (
              <span key={d.date} className="flex-1 text-center text-xs text-muted">
                {d.label}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}