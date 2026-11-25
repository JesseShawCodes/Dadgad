# Dadgad frontend

Next.js (App Router) + React 19 client for the Dadgad song bracket app.

Local dev runs on **port 1207** (`npm run dev` / `make dadgad-start` from the repo root).

```bash
npm install
npm run dev      # http://localhost:1207
npm test
npm run build
```

Set `NEXT_PUBLIC_SERVER` to the Django API base URL (default `http://localhost:8000`).

Project docs: [../../documentation/architecture.md](../../documentation/architecture.md)
