type CheckIn = {
  id: string;
  date: string;
  mood: number;
  note: string | null;
};

type StreakSummary = {
  current: number;
  longest: number;
};

const MOOD_LABELS: Record<number, string> = {
  1: "Rough",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Great",
};

async function gql<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch("/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await res.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }
  if (!json.data) {
    throw new Error("No data from API");
  }
  return json.data;
}

export async function loadDashboard() {
  return gql<{
    dataVersion: number;
    checkIns: CheckIn[];
    streakSummary: StreakSummary;
  }>(`
    query {
      dataVersion
      streakSummary { current longest }
      checkIns(limit: 90) {
        id
        date
        mood
        note
      }
    }
  `);
}

export async function createCheckIn(input: {
  mood: number;
  note?: string;
  date?: string;
}) {
  const data = await gql<{ createCheckIn: CheckIn }>(
    `
      mutation CreateCheckIn($mood: Int!, $note: String, $date: String) {
        createCheckIn(mood: $mood, note: $note, date: $date) {
          id
          date
          mood
          note
        }
      }
    `,
    {
      mood: input.mood,
      note: input.note || null,
      date: input.date || null,
    },
  );
  return data.createCheckIn;
}

export async function updateCheckIn(input: {
  id: string;
  mood: number;
  note?: string;
}) {
  const data = await gql<{ updateCheckIn: CheckIn }>(
    `
      mutation UpdateCheckIn($id: ID!, $mood: Int, $note: String) {
        updateCheckIn(id: $id, mood: $mood, note: $note) {
          id
          date
          mood
          note
        }
      }
    `,
    {
      id: input.id,
      mood: input.mood,
      note: input.note || null,
    },
  );
  return data.updateCheckIn;
}

export async function deleteCheckIn(id: string) {
  const data = await gql<{ deleteCheckIn: CheckIn }>(
    `
      mutation DeleteCheckIn($id: ID!) {
        deleteCheckIn(id: $id) {
          id
          date
        }
      }
    `,
    { id },
  );
  return data.deleteCheckIn;
}

export { MOOD_LABELS };
export type { CheckIn, StreakSummary };
