const DAY_MS = 24 * 60 * 60 * 1000;

// Hours ahead of UTC that decide when "a new day" starts (Pakistan = 5)
// Change it with DAILY_TZ_OFFSET_HOURS in .env
export const tzOffsetMs = () => {
  const raw = process.env.DAILY_TZ_OFFSET_HOURS;
  const hours = raw !== undefined && raw !== "" && Number.isFinite(Number(raw)) ? Number(raw) : 5;
  return hours * 60 * 60 * 1000;
};

// "2026-11-03" for the given moment, in the site's time zone
export const dayKey = (date = new Date()) =>
  new Date(date.getTime() + tzOffsetMs()).toISOString().slice(0, 10);

// Add or subtract days from a "YYYY-MM-DD" key
export const addDays = (key, n) =>
  new Date(Date.parse(`${key}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);

// The Monday of the week that contains the given day
export const weekStartKey = (key) => {
  const weekday = new Date(`${key}T00:00:00Z`).getUTCDay(); // 0 = Sunday
  return addDays(key, -((weekday + 6) % 7));
};