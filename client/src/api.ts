type CheckIn = {
  id: string;
  date: string;
  mood: number;
  note: string | null;
};

const MOOD_LABELS: Record<number, string> = {
  1: "Rough",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Great",
};

async function fetchCheckIns(): Promise<CheckIn[]> {
  const res = await fetch("/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query {
          checkIns(limit: 20) {
            id
            date
            mood
            note
          }
        }
      `,
    }),
  });

  const json = (await res.json()) as {
    data?: { checkIns: CheckIn[] };
    errors?: Array<{ message: string }>;
  };

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }
  if (!json.data) {
    throw new Error("No data from API");
  }
  return json.data.checkIns;
}

export async function loadCheckIns() {
  return fetchCheckIns();
}

export { MOOD_LABELS };
export type { CheckIn };
