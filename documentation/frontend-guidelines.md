# Dadgad Frontend Guidelines

Phase 2 conventions for the Next.js app in `services/dadgad`.

## Stack choices

| Concern | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js App Router + React 19 | Do not upgrade majors in the same change as architecture work |
| Server data | **RTK Query** (`services/jsonServerApi.ts`) | Artist bracket page, search start, task polling |
| Imperative HTTP | **Typed API client** (`api/client.ts`) | Matchup winner writes and one-off bracket fetches |
| Bracket play state | **React Context + reducer** (`context/BracketContext.tsx`) | Domain state stays in Context; Redux holds RTK Query cache only |
| Styling | Bootstrap 5.3 + SCSS | Preserve existing visual language during Phase 2 |
| Types | TypeScript-first for new/changed modules | Prefer `.ts`/`.tsx`; migrate JSX when touching a file |

## Component hierarchy

```
src/app/
├── api/                 # Typed HTTP client + shared API types
├── context/             # Bracket provider
├── services/            # Domain helpers, RTK API slice, localStorage
├── components/          # UI used by routes (bracket, search cards, layout)
│   └── Matchups/        # Matchup interaction controls
├── boundary/            # Error boundaries
├── artist/[handle]/     # Artist bracket route
├── search/              # Artist search route
├── about/               # Static about route
└── page.js              # Home route
```

Rules:

- **Routes** own composition only; put reusable UI under `components/`.
- Do not reintroduce a legacy `pages/` folder for non-route components.
- Artist route may nest a second `BracketContext` so each artist visit starts from a clean reducer state while the root layout still provides a default provider for other routes.

## Data-fetching rules

1. Prefer RTK Query hooks for GET/polling against known endpoints.
2. Use `api/client.ts` for credentialed POSTs and one-off writes.
3. Do not add SWR, axios, or ad-hoc `fetch` in feature components without an explicit exception.
4. localStorage is a **cache / offline hint** for in-progress UI resume.

## Bracket state

- **Create:** Django `BracketCreateFromArtistView` via RTK `getArtistPage` (`/api/brackets/artist/...`). Generate uses server round-1 structure when present (`serverBracket.buildInitialBracket`), with `createMatchups` as fallback. Pass `?new=1` when starting a fresh tournament for the same artist.
- **Search:** RTK uses canonical `/api/artists/search` and `/api/artists/<name>/page`.
- **During play:** local updates via `bracketLocalUpdate` only. Server pick persistence + championship payload exist; wiring play UX to them remains M6/Phase 4.
- **Resume:** localStorage “in progress” UI today; server resumes latest incomplete bracket on artist-page GET.

## Accessibility baseline

- Matchup song controls are real `<button>` elements with `aria-label` / `aria-pressed`.
- Search input exposes an accessible name.
- Prefer semantic controls over clickable `<div>`s for new interactions.

## Testing

- Co-locate or keep unit tests under `src/app/__tests__` / route `__tests__`.
- When changing API modules, cover request URLs and error shaping in Jest.
- Wrap RTK Query consumers in a test `Provider` with `jsonServerApi` middleware.
