import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type CheckIn = {
  id: string;
  date: string;
  mood: number;
  note: string | null;
  createdAt: string;
};

type Store = {
  checkIns: CheckIn[];
};

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../data");
const dbFile = path.join(dataDir, "daymark.json");

let store: Store = { checkIns: [] };

export function initStore() {
  fs.mkdirSync(dataDir, { recursive: true });

  if (!fs.existsSync(dbFile)) {
    store = { checkIns: [] };
    save();
    return;
  }

  const raw = fs.readFileSync(dbFile, "utf8");
  const parsed = JSON.parse(raw) as Store;
  store = {
    checkIns: Array.isArray(parsed.checkIns) ? parsed.checkIns : [],
  };
}

function save() {
  fs.writeFileSync(dbFile, JSON.stringify(store, null, 2), "utf8");
}

export function listCheckIns(limit = 30): CheckIn[] {
  return [...store.checkIns]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export function allDates(): string[] {
  return store.checkIns.map((c) => c.date);
}

export function findByDate(date: string): CheckIn | undefined {
  return store.checkIns.find((c) => c.date === date);
}

export function addCheckIn(input: {
  id: string;
  date: string;
  mood: number;
  note?: string | null;
}): CheckIn {
  const row: CheckIn = {
    id: input.id,
    date: input.date,
    mood: input.mood,
    note: input.note ?? null,
    createdAt: new Date().toISOString(),
  };
  store.checkIns.push(row);
  save();
  return row;
}

export function seedIfEmpty() {
  if (store.checkIns.length > 0) return;

  const samples: Array<Omit<CheckIn, "id" | "createdAt"> & { id: string }> = [
    {
      id: "seed-1",
      date: "2026-07-01",
      mood: 3,
      note: "Slow start, but I showed up.",
    },
    {
      id: "seed-2",
      date: "2026-07-02",
      mood: 4,
      note: "Felt steadier today.",
    },
    {
      id: "seed-3",
      date: "2026-07-03",
      mood: 4,
      note: "Kept my evening routine.",
    },
    {
      id: "seed-4",
      date: "2026-07-04",
      mood: 5,
      note: "Really good day.",
    },
    {
      id: "seed-5",
      date: "2026-07-05",
      mood: 4,
      note: "Tired, still checked in.",
    },
  ];

  for (const sample of samples) {
    store.checkIns.push({
      ...sample,
      createdAt: new Date().toISOString(),
    });
  }
  save();
}
