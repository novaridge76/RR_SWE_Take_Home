# DayMark

Daily mood check-in app with streaks.

I built this for the take-home. Kept it small: React frontend, GraphQL API, JSON file for storage.

## Features

- Check in once a day (mood 1-5 + optional note)
- Edit or delete a check-in (click the day on the calendar)
- Current streak + longest streak
- Calendar and a simple mood chart
- Data lives in `server/data/daymark.json` (survives restart)
- If you edit that file by hand, the UI updates after a couple seconds

### How streaks work

A streak is consecutive days with a check-in. Current streak still counts if your last check-in was yesterday (so you don't lose it just because you haven't checked in yet today). Miss a day and current resets; longest stays.

## Run it

```bash
npm install
npm run dev
```

- UI: [http://127.0.0.1:5173/](http://127.0.0.1:5173/)
- API: [http://localhost:4000/](http://localhost:4000/)

Tests:

```bash
npm run test
```



## Stack

- Client: React + TypeScript (Vite)
- Server: Apollo GraphQL
- DB: JSON file (simple, no setup)

I used plain `fetch` on the client instead of Apollo Client. Fine for this size.

## Folder layout

```
client/  - UI
server/  - API + streak logic + JSON store
```



## If I had more time

- Login / multiple users
- Reminders
- Better charts
- Deploy it

