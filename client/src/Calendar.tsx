import { useMemo, useState } from "react";
import type { CheckIn } from "./api";
import { buildMonthGrid, monthLabel, todayKey } from "./dates";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Props = {
  checkIns: CheckIn[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

export function Calendar({ checkIns, selectedDate, onSelectDate }: Props) {
  const today = todayKey();
  const [year, setYear] = useState(() => Number(selectedDate.slice(0, 4)));
  const [monthIndex, setMonthIndex] = useState(
    () => Number(selectedDate.slice(5, 7)) - 1,
  );

  const byDate = useMemo(() => {
    const map = new Map<string, CheckIn>();
    for (const row of checkIns) map.set(row.date, row);
    return map;
  }, [checkIns]);

  const cells = buildMonthGrid(year, monthIndex);

  function shift(delta: number) {
    const next = new Date(year, monthIndex + delta, 1);
    setYear(next.getFullYear());
    setMonthIndex(next.getMonth());
  }

  return (
    <section className="panel">
      <div className="cal-head">
        <p className="section">Calendar</p>
        <div className="cal-nav">
          <button type="button" className="ghost" onClick={() => shift(-1)}>
            ‹
          </button>
          <span>{monthLabel(year, monthIndex)}</span>
          <button type="button" className="ghost" onClick={() => shift(1)}>
            ›
          </button>
        </div>
      </div>
      <p className="muted small">Pick a day to check in or review.</p>

      <div className="cal-grid">
        {WEEKDAYS.map((d) => (
          <div key={d} className="cal-wd">
            {d}
          </div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} className="cal-day empty" />;

          const existing = byDate.get(date);
          const future = date > today;
          return (
            <button
              key={date}
              type="button"
              disabled={future}
              className={[
                "cal-day",
                date === selectedDate ? "selected" : "",
                date === today ? "today" : "",
                existing ? `m${existing.mood}` : "",
                future ? "future" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelectDate(date)}
            >
              {Number(date.slice(8))}
            </button>
          );
        })}
      </div>
    </section>
  );
}
