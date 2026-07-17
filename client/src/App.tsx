import { useEffect, useState, type FormEvent } from "react";
import {
  createCheckIn,
  loadDashboard,
  MOOD_LABELS,
  type CheckIn,
  type StreakSummary,
} from "./api";

export default function App() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [streaks, setStreaks] = useState<StreakSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [mood, setMood] = useState(3);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  async function refresh() {
    const data = await loadDashboard();
    setCheckIns(data.checkIns);
    setStreaks(data.streakSummary);
    setError(null);
  }

  useEffect(() => {
    let cancelled = false;

    loadDashboard()
      .then((data) => {
        if (!cancelled) {
          setCheckIns(data.checkIns);
          setStreaks(data.streakSummary);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    setSavedMsg(null);

    try {
      await createCheckIn({
        mood,
        note: note.trim() || undefined,
      });
      setNote("");
      setMood(3);
      setSavedMsg("Checked in.");
      await refresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app">
      <p className="brand">DayMark</p>
      <h1>Mark the day. Keep the streak.</h1>
      <p className="lede">Log today&apos;s mood and keep your streak going.</p>

      {streaks && (
        <div className="streaks">
          <div>
            <p className="label">Current</p>
            <p className="value">{streaks.current}</p>
          </div>
          <div>
            <p className="label">Longest</p>
            <p className="value">{streaks.longest}</p>
          </div>
        </div>
      )}

      <form className="form" onSubmit={onSubmit}>
        <p className="section">How are you today?</p>
        <div className="moods">
          {[1, 2, 3, 4, 5].map((value) => (
            <label
              key={value}
              className={mood === value ? "mood selected" : "mood"}
            >
              <input
                type="radio"
                name="mood"
                value={value}
                checked={mood === value}
                onChange={() => setMood(value)}
              />
              <span className="n">{value}</span>
              <span className="t">{MOOD_LABELS[value]}</span>
            </label>
          ))}
        </div>

        <label className="field">
          Note (optional)
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={280}
            placeholder="Anything worth remembering…"
          />
        </label>

        {formError && <p className="error">{formError}</p>}
        {savedMsg && <p className="ok">{savedMsg}</p>}

        <button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Check in"}
        </button>
      </form>

      {loading && <p className="muted">Loading…</p>}

      {error && (
        <p className="error">
          Couldn&apos;t reach the API ({error}). Make sure the server branch is
          running with streak support.
        </p>
      )}

      {!loading && !error && checkIns.length === 0 && (
        <p className="muted">No check-ins yet.</p>
      )}

      <ul className="list">
        {checkIns.map((item) => (
          <li key={item.id}>
            <strong>{item.date}</strong>
            <span>
              Mood {item.mood} · {MOOD_LABELS[item.mood] ?? "—"}
            </span>
            {item.note ? <em>{item.note}</em> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
