import { useMemo } from "react";
import type { CheckIn } from "./api";
import { MOOD_LABELS } from "./api";

type Props = {
  checkIns: CheckIn[];
};

export function MoodChart({ checkIns }: Props) {
  const points = useMemo(
    () => [...checkIns].sort((a, b) => a.date.localeCompare(b.date)).slice(-14),
    [checkIns],
  );

  const width = 560;
  const height = 200;
  const pad = { t: 16, r: 12, b: 28, l: 28 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;

  const coords = points.map((p, i) => {
    const x =
      points.length === 1
        ? pad.l + innerW / 2
        : pad.l + (i / (points.length - 1)) * innerW;
    const y = pad.t + ((5 - p.mood) / 4) * innerH;
    return { ...p, x, y };
  });

  const line = coords
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const avg =
    points.length === 0
      ? null
      : points.reduce((s, p) => s + p.mood, 0) / points.length;

  return (
    <section className="panel">
      <p className="section">Mood trend</p>
      <p className="muted small">
        Last {points.length} check-in{points.length === 1 ? "" : "s"}
        {avg != null ? ` · avg ${avg.toFixed(1)}` : ""}
      </p>

      {points.length === 0 ? (
        <p className="muted">Check in a few days to see a chart.</p>
      ) : (
        <svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img">
          {[1, 2, 3, 4, 5].map((mood) => {
            const y = pad.t + ((5 - mood) / 4) * innerH;
            return (
              <g key={mood}>
                <line
                  x1={pad.l}
                  x2={width - pad.r}
                  y1={y}
                  y2={y}
                  className="grid"
                />
                <text x={pad.l - 6} y={y + 3} className="axis" textAnchor="end">
                  {mood}
                </text>
              </g>
            );
          })}
          <path d={line} className="line" fill="none" />
          {coords.map((p) => (
            <circle key={p.id} cx={p.x} cy={p.y} r={4.5} className={`dot m${p.mood}`}>
              <title>{`${p.date}: ${MOOD_LABELS[p.mood]}`}</title>
            </circle>
          ))}
          {coords.map((p, i) =>
            points.length <= 8 || i === 0 || i === coords.length - 1 || i % 2 === 0 ? (
              <text
                key={`l-${p.id}`}
                x={p.x}
                y={height - 8}
                className="axis"
                textAnchor="middle"
              >
                {p.date.slice(5)}
              </text>
            ) : null,
          )}
        </svg>
      )}
    </section>
  );
}
