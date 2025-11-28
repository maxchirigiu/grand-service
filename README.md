# Grand Service — Local Development

This repository contains a static front-end and a minimal Node.js backend for handling booking requests.

## Requirements
- Node.js 16+ (npm included)

## Install
From the project root (`/Users/maxim/HTML/grand-service`):

```bash
npm install
```

## Run
Start the server:

```bash
npm start
```

This will start an Express server on `http://localhost:3000` and serve the static pages. The booking form will POST to `/api/bookings` and bookings are saved in `data/bookings.json`.

For development with auto-reload (if installed globally), you can use:

```bash
npm run dev
```

## Files added for backend
- `server.js` — Express server that serves static files and provides `POST /api/bookings` and `GET /api/bookings`.
- `package.json` — dependencies and scripts.
- `data/bookings.json` — storage for bookings (simple JSON file).

## Notes
- The front-end also uses `localStorage` as a fallback when the server is unavailable.
- To view saved bookings, visit `http://localhost:3000/api/bookings`.

If you want a production-ready backend (database, email notifications), tell me and I can scaffold it next.