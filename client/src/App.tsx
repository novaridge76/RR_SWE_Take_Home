import { useEffect, useState } from "react";
import { loadCheckIns, MOOD_LABELS, type CheckIn } from "./api";

export default function App() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    loadCheckIns()
      .then((rows) => {
        if (!cancelled) {
          setCheckIns(rows);
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

  return (
    <div className="app">
      <p className="brand">DayMark</p>
      <h1>Mark the day. Keep the streak.</h1>
      <p className="lede">Recent check-ins from the API.</p>

      {loading && <p className="muted">Loading…</p>}

      {error && (
        <p className="error">
          Couldn&apos;t reach the API ({error}). Start the server on the{" "}
          <code>server</code> branch first.
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
