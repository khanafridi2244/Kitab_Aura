import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/axios";

const LANGUAGES = [
  { key: "pashto", label: "Pashto" },
  { key: "urdu", label: "Urdu" },
  { key: "english", label: "English" },
  { key: "arabic", label: "Arabic" },
  { key: "persian", label: "Persian" },
];

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
        active ? "bg-primary text-white" : "bg-soft text-primary hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

// Pick favorite languages and topics. Used on the welcome page and on Profile
export default function PreferencesForm({ submitLabel = "Save preferences", onSaved, onSkip }) {
  const [categories, setCategories] = useState([]);
  const [langs, setLangs] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  useEffect(() => {
    let active = true;
    Promise.all([api.get("/categories"), api.get("/users/preferences")])
      .then(([cats, prefs]) => {
        if (!active) return;
        setCategories(cats.data.categories);
        setLangs(prefs.data.preferredLanguages);
        setInterests(prefs.data.interests);
      })
      .catch((err) => active && setNotice({ type: "error", text: getErrorMessage(err) }))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice({ type: "", text: "" });
    try {
      await api.put("/users/preferences", { preferredLanguages: langs, interests });
      setNotice({ type: "success", text: "Preferences saved." });
      onSaved?.();
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-40 animate-pulse rounded-xl bg-soft" />;

  return (
    <form onSubmit={handleSubmit}>
      <fieldset>
        <legend className="text-sm font-semibold text-ink">Languages you read</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <Chip key={l.key} active={langs.includes(l.key)} onClick={() => toggle(langs, setLangs, l.key)}>
              {l.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-ink">Topics you enjoy</legend>
        {categories.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No topics yet. An admin needs to add categories first.</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Chip
                key={c._id}
                active={interests.includes(c._id)}
                onClick={() => toggle(interests, setInterests, c._id)}
              >
                {c.name}
              </Chip>
            ))}
          </div>
        )}
      </fieldset>

      {notice.text && (
        <p
          role={notice.type === "error" ? "alert" : "status"}
          className={`mt-4 rounded-lg px-3 py-2 text-sm ${
            notice.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800"
          }`}
        >
          {notice.text}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {saving ? "Saving..." : submitLabel}
        </button>
        {onSkip && (
          <button type="button" onClick={onSkip} className="text-sm font-medium text-muted hover:underline">
            Skip for now
          </button>
        )}
      </div>
    </form>
  );
}