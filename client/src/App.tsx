import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createCheckIn,
  deleteCheckIn,
  loadDashboard,
  MOOD_LABELS,
  updateCheckIn,
  type CheckIn,
  type StreakSummary,
} from "./api";
import { Calendar } from "./Calendar";
import { todayKey } from "./dates";
import { MoodChart } from "./MoodChart";

const POLL_MS = 2000;

export default function App() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [streaks, setStreaks] = useState<StreakSummary | null>(null);
  const [version, setVersion] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [mood, setMood] = useState(3);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const existing = useMemo(
    () => checkIns.find((c) => c.date === selectedDate),
    [checkIns, selectedDate],
  );
  const isToday = selectedDate === todayKey();

  async function refresh() {
    const data = await loadDashboard();
    setCheckIns(data.checkIns);
    setStreaks(data.streakSummary);
    setVersion(data.dataVersion);
    setError(null);
  }

  useEffect(() => {
    let cancelled = false;

    async function tick(first = false) {
      try {
        const data = await loadDashboard();
        if (cancelled) return;
        setCheckIns(data.checkIns);
        setStreaks(data.streakSummary);
        setVersion(data.dataVersion);
        setError(null);
      } catch (err: unknown) {
        if (!cancelled && first) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (!cancelled && first) setLoading(false);
      }
    }

    void tick(true);
    const id = window.setInterval(() => void tick(), POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  // When selecting a day that already has a check-in, load its values into the form.
  useEffect(() => {
    if (existing) {
      setMood(existing.mood);
      setNote(existing.note ?? "");
    } else {
      setMood(3);
      setNote("");
    }
  }, [existing]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    setSavedMsg(null);

    try {
      if (existing) {
        await updateCheckIn({
          id: existing.id,
          mood,
          note: note.trim() || undefined,
        });
        setSavedMsg("Updated.");
      } else {
        await createCheckIn({
          mood,
          note: note.trim() || undefined,
          date: selectedDate,
        });
        setSavedMsg("Checked in.");
      }
      await refresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!existing) return;
    const ok = window.confirm(`Delete check-in for ${existing.date}?`);
    if (!ok) return;

    setSaving(true);
    setFormError(null);
    setSavedMsg(null);

    try {
      await deleteCheckIn(existing.id);
      setMood(3);
      setNote("");
      setSavedMsg("Deleted.");
      await refresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app">
      <p className="brand">DayMark</p>
      <h1>Mark the day. Keep the streak.</h1>
      <p className="lede">
        Pick a day, log your mood, watch the streak and chart update.
        {version != null ? ` · live v${version}` : ""}
      </p>

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

      <div className="split">
        <Calendar
          checkIns={checkIns}
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setFormError(null);
            setSavedMsg(null);
          }}
        />

        <section className="panel form-panel">
          <p className="section">
            {existing
              ? isToday
                ? "Edit today's check-in"
                : `Edit · ${selectedDate}`
              : isToday
                ? "Today's check-in"
                : `Check-in · ${selectedDate}`}
          </p>

          <form className="form bare" onSubmit={onSubmit}>
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

            <div className="actions">
              <button type="submit" disabled={saving}>
                {saving ? "Saving…" : existing ? "Save changes" : "Check in"}
              </button>
              {existing && (
                <button
                  type="button"
                  className="danger"
                  disabled={saving}
                  onClick={() => void onDelete()}
                >
                  Delete
                </button>
              )}
            </div>
          </form>
        </section>
      </div>

      <MoodChart checkIns={checkIns} />

      {loading && <p className="muted">Loading…</p>}

      {error && (
        <p className="error">
          Couldn&apos;t reach the API ({error}). Run the latest server branch.
        </p>
      )}

      <ul className="list">
        {checkIns.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="linkish"
              onClick={() => {
                setSelectedDate(item.date);
                setFormError(null);
                setSavedMsg(null);
              }}
            >
              <strong>{item.date}</strong>
            </button>
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
