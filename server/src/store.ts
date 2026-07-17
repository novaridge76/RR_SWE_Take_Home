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
let version = 0;
let writing = false;
let watchReady = false;
let reloadTimer: ReturnType<typeof setTimeout> | null = null;

export function getDataVersion() {
  return version;
}

export function initStore() {
  fs.mkdirSync(dataDir, { recursive: true });

  if (!fs.existsSync(dbFile)) {
    store = { checkIns: [] };
    save();
  } else {
    loadFromDisk();
  }

  watchFile();
}

function loadFromDisk() {
  const raw = fs.readFileSync(dbFile, "utf8");
  const parsed = JSON.parse(raw) as Store;
  store = {
    checkIns: Array.isArray(parsed.checkIns) ? parsed.checkIns : [],
  };
}

function save() {
  writing = true;
  fs.writeFileSync(dbFile, JSON.stringify(store, null, 2), "utf8");
  version += 1;
  setTimeout(() => {
    writing = false;
  }, 150);
}

function watchFile() {
  if (watchReady) return;
  watchReady = true;

  try {
    fs.watch(dbFile, () => {
      if (writing) return;
      if (reloadTimer) clearTimeout(reloadTimer);
      reloadTimer = setTimeout(() => {
        reloadTimer = null;
        if (writing || !fs.existsSync(dbFile)) return;
        try {
          loadFromDisk();
          version += 1;
          console.log(`reloaded daymark.json (v${version})`);
        } catch (err) {
          console.warn("failed to reload data file", err);
        }
      }, 100);
    });
  } catch (err) {
    console.warn("could not watch data file", err);
  }
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

export function findById(id: string): CheckIn | undefined {
  return store.checkIns.find((c) => c.id === id);
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

export function updateCheckIn(
  id: string,
  patch: { mood?: number; note?: string | null },
): CheckIn | null {
  const row = store.checkIns.find((c) => c.id === id);
  if (!row) return null;

  if (patch.mood !== undefined) row.mood = patch.mood;
  if (patch.note !== undefined) row.note = patch.note;
  save();
  return row;
}

export function deleteCheckIn(id: string): CheckIn | null {
  const index = store.checkIns.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const [removed] = store.checkIns.splice(index, 1);
  save();
  return removed;
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
