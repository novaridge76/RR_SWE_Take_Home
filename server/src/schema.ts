import { GraphQLError } from "graphql";
import { randomUUID } from "node:crypto";
import {
  addCheckIn,
  allDates,
  findByDate,
  getDataVersion,
  listCheckIns,
} from "./store.js";
import { computeStreaks } from "./streaks.js";

function todayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const typeDefs = `#graphql
  type CheckIn {
    id: ID!
    date: String!
    mood: Int!
    note: String
    createdAt: String!
  }

  type StreakSummary {
    current: Int!
    longest: Int!
  }

  type Query {
    health: String!
    checkIns(limit: Int = 30): [CheckIn!]!
    streakSummary: StreakSummary!
    dataVersion: Int!
  }

  type Mutation {
    createCheckIn(date: String, mood: Int!, note: String): CheckIn!
  }
`;

export const resolvers = {
  Query: {
    health: () => "ok",
    checkIns: (_: unknown, args: { limit?: number }) =>
      listCheckIns(args.limit ?? 30),
    streakSummary: () => computeStreaks(allDates(), todayKey()),
    dataVersion: () => getDataVersion(),
  },

  Mutation: {
    createCheckIn: (
      _: unknown,
      args: { date?: string | null; mood: number; note?: string | null },
    ) => {
      const today = todayKey();
      const date = args.date ?? today;

      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new GraphQLError("Date must be YYYY-MM-DD");
      }
      if (date > today) {
        throw new GraphQLError("Can't check in for a future date");
      }
      if (!Number.isInteger(args.mood) || args.mood < 1 || args.mood > 5) {
        throw new GraphQLError("Mood must be 1–5");
      }
      if (findByDate(date)) {
        throw new GraphQLError(`Already checked in for ${date}`);
      }

      return addCheckIn({
        id: randomUUID(),
        date,
        mood: args.mood,
        note: args.note,
      });
    },
  },
};
