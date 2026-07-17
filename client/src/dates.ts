export function todayKey(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function monthLabel(year: number, monthIndex: number) {
  return new Date(year, monthIndex, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function buildMonthGrid(year: number, monthIndex: number) {
  const startWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: Array<string | null> = [];

  for (let i = 0; i < startWeekday; i++) cells.push(null);

  for (let day = 1; day <= daysInMonth; day++) {
    const m = String(monthIndex + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    cells.push(`${year}-${m}-${d}`);
  }

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
