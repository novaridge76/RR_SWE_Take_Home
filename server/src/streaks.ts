/** YYYY-MM-DD helpers + streak math */

export function addDays(day: string, delta: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  date.setUTCDate(date.getUTCDate() + delta);
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const ms =
    Date.UTC(by, bm - 1, bd, 12) - Date.UTC(ay, am - 1, ad, 12);
  return Math.round(ms / 86_400_000);
}

/**
 * Current streak counts consecutive days ending today or yesterday
 * (so missing "today so far" doesn't break it).
 * Longest is the best consecutive run in the whole history.
 */
export function computeStreaks(dates: string[], today: string) {
  const unique = [...new Set(dates)].sort();
  if (unique.length === 0) {
    return { current: 0, longest: 0 };
  }

  let longest = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    if (dayDiff(unique[i - 1], unique[i]) === 1) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  const yesterday = addDays(today, -1);
  const last = unique[unique.length - 1];
  if (last !== today && last !== yesterday) {
    return { current: 0, longest };
  }

  let current = 1;
  for (let i = unique.length - 1; i > 0; i--) {
    if (dayDiff(unique[i - 1], unique[i]) === 1) {
      current += 1;
    } else {
      break;
    }
  }

  return { current, longest: Math.max(longest, current) };
}
