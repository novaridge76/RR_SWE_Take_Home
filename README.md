# DayMark

A small full-stack app for daily mood check-ins with streak tracking.

I built this for a take-home exercise. I wanted something useful that still had real business logic on the server — not only CRUD.

## What it does

- Check in once per calendar day (mood 1–5, optional note)
- See current streak and longest streak
- Pick past days on a calendar (days are colored by mood)
- See a simple mood trend chart
- Data is stored in a JSON file and survives restart
- If you edit `server/data/daymark.json` by hand, the API reloads it and the UI catches up within a couple of seconds

### Streak rule

- One check-in per day (`YYYY-MM-DD`)
- **Current streak** is consecutive days ending on **today** or **yesterday** (so not checking in yet today doesn’t break yesterday’s streak)
- Missing a full day resets the current streak
- **Longest streak** is the best consecutive run in the history
- Future dates and duplicate days are rejected

Days use the server’s local timezone for this demo.

## Stack

| Layer | Choice |
| --- | --- |
| Frontend | React + TypeScript (Vite) |
| API | GraphQL (Apollo Server) |
| Client ↔ API | `fetch` to GraphQL (Vite proxies `/graphql`) |
| Persistence | JSON file on disk |

I kept the client on plain `fetch` instead of adding Apollo Client + TanStack Query. For this size of app it was enough, and it kept the dependency surface smaller.

## Setup

Node 20+ recommended.

```bash
npm install
npm run dev
```

- App: http://127.0.0.1:5173/
- GraphQL: http://localhost:4000/

Or separately:

```bash
npm run dev:server
npm run dev:client
```

### Tests

```bash
npm run test
```

Runs the streak unit tests on the server.

## Project layout

```
client/   React UI (calendar, chart, check-in form)
server/   GraphQL API + JSON store + streak logic
```

On first run the server seeds a short sample history so longest streak is visible before you check in today. Runtime data lives in `server/data/daymark.json` (gitignored).

## Why I structured it this way

- Streak math lives in `server/src/streaks.ts` so the rule is enforced in one place
- JSON persistence was intentional — durable enough for the exercise, and it avoids native SQLite build tools on Windows
- I developed `server` and `client` on separate branches and merged into `main` so the history shows backend and frontend work in parallel

## What I’d do with more time

- Auth and multiple users (with per-user timezones)
- More than one habit/streak type
- Better charts / a year heatmap
- Reminders
- Stronger tests around midnight and DST
- Deploy somewhere and maybe move to Postgres

## Timebox

I stopped at a working vertical slice: persist check-ins, compute streaks on the API, and a UI that can read/write and stay in sync when the data file changes.
