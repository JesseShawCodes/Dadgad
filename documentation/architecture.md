# Dadgad Architecture

Phase 1 baseline audit (November 2026). Describes the system as it exists today, not the target end state.

## 1. System overview

Dadgad lets users search for artists via Apple Music, generate a seeded song tournament bracket, pick winners matchup-by-matchup, and crown a champion.

```
┌─────────────────────┐     HTTP/JSON      ┌──────────────────────────┐
│  Next.js frontend   │ ────────────────► │  Django API             │
│  services/dadgad    │                   │  services/django_backend │
│  Netlify            │                   │  Render / gunicorn       │
└─────────────────────┘                   └────────────┬─────────────┘
                                                       │
                         ┌─────────────────────────────┼─────────────────┐
                         ▼                             ▼                 ▼
                  PostgreSQL 15                    Redis / Celery    Apple Music API
                  (brackets, auth tokens)          (artist search)   (catalog data)
```

## 2. Repository layout

```
Dadgad/
├── docker-compose.yml          # Postgres 15, Redis 7, pgAdmin
├── .env.example                # Shared env template
├── Makefile                    # Root orchestration
├── documentation/              # Architecture & modernization docs
└── services/
    ├── dadgad/                 # Next.js App Router frontend
    │   ├── src/app/            # Routes, components, services, context
    │   ├── netlify.toml
    │   └── package.json
    └── django_backend/
        ├── madness_backend/    # Project settings, URLs, Celery
        ├── apple_search/       # Apple Music integration + search tasks
        ├── brackets/           # Bracket models, API, BracketService
        ├── requirements.txt
        └── Dockerfile / Procfile
```

## 3. Frontend architecture

| Concern | Current state |
| --- | --- |
| Framework | Next.js `^16.2.7`, React `^19.2.7`, App Router |
| Rendering | Mostly client components (`"use client"`); home page is client-rendered |
| Routing | App Router: `/`, `/search`, `/about`, `/artist/[handle]` |
| API client | RTK Query (`jsonServerApi.ts`) for search / artist bracket / task status; typed `api/client.ts` for matchup writes |
| Bracket state | React Context + reducer (`BracketContext.tsx`); localStorage for in-progress resume |
| Styling | Bootstrap 5.3 + SCSS (`App.scss`); some CSS modules |
| TypeScript | Core services/context/API in TS; many presentational components still JSX |
| Visualization | p5.js canvas via `react-p5` (`bracketService.jsx`, `p5Sketch.jsx`) |
| Tests | Jest + Testing Library (~30 test files); API client + pick-flow contract tests |
| Deploy | Netlify with `@netlify/plugin-nextjs`; local dev on port **1207** |

### Key frontend flows

1. **Artist search** — user submits query → RTK `startSearch` (`GET /artist?q=`) → poll `getTaskStatus` until SUCCESS/FAILURE.
2. **Artist page** — `GET /api/brackets/artist/<name>` loads songs + structured bracket; Generate prefers server round-1 (falls back to `createMatchups`).
3. **Bracket play** — local progression in Context + localStorage resume. Server pick persistence is available via `select-matchup-winner` but not wired in the UI yet.

### Dependency notes (frontend)

| Package | Status |
| --- | --- |
| `next`, `react`, `react-dom` | Current major versions — preserve |
| `@reduxjs/toolkit`, `react-redux` | Used for RTK Query only (no domain slices) |
| `p5`, `react-p5` | Bracket sketch visualization |
| `prop-types` | Legacy alongside gradual TypeScript adoption |
| `firebase`, `axios`, `swr`, `@p5-wrapper/*`, `p5js` | **Removed in Phase 2** |

## 4. Backend architecture

| Concern | Current state |
| --- | --- |
| Framework | Django **5.2.15**, DRF **3.17** |
| Apps | `apple_search`, `brackets` (+ django-allauth, celery results) |
| Settings | Split package `madness_backend/settings/` (`base` / `local` / `production`) |
| Auth | Product auth deferred; django-allauth removed until needed; `Bracket.owner` FK remains optional |
| API style | Function views for search/status; DRF `APIView` for brackets; errors use `{error, code}` |
| Business logic | `brackets/services.py` (`BracketService`) — create, advance, structured + championship payload |
| Celery | `fetch_artist_data` with retries/backoff/time limits; broker = `UPSTASH_REDIS_URL` |
| Lint | Ruff; Makefile targets `ruff-check` / `ruff-check-fix` |
| Tests | pytest + pytest-django (primary) and `manage.py test`; progression + API integration suites |
| Deploy | Dockerfile (Python 3.10 + gunicorn); Procfile for Render; host `music-march-maddness.onrender.com` |

### API surface

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/artists/search?q=` | Queue artist search Celery task (canonical) |
| GET | `/api/artists/<artist_name>/page` | Artist page payload (songs, albums, weights) |
| GET | `/artist?q=` | Legacy alias for artist search |
| GET | `/artist-page/<artist_name>` | Legacy alias for artist page |
| GET | `/api/task-status?q=` | Celery task status / result |
| GET | `/api/brackets/artist/<artist_name>` | Resume latest incomplete or create (`?new=1` forces new) |
| GET | `/api/brackets/<pk>/` | Bracket detail + structured / championship payload |
| POST | `/api/matchups/<pk>/winner/` | Advance winner via `BracketService` |
| POST | `/api/brackets/select-matchup-winner/` | Advance winner + return structured bracket / championship |

### Models

**`brackets`**

- `Bracket` — name, artist_id/name, owner (nullable), is_completed (indexed by artist + created/completed)
- `BracketItem` — song entry with seed, apple_id, image_url (indexed by bracket + apple_id)
- `Matchup` — round_number, matchup_num, item1/item2/winner, next_matchup/next_slot, championship feeders

**`apple_search`**

- `AppleAuth` — stored developer JWT tokens
- `ArtistDetails` — sparse artist cache (`created` auto_now_add, `updated` auto_now)

Multiple brackets per `artist_id` are supported; artist-page GET resumes the latest incomplete unless `?new=1`.

## 5. Bracket engine

Phase 3 hardens the server bracket engine; the UI still advances rounds locally for play UX.

| Location | Role today |
| --- | --- |
| Backend `BracketService` | Multi-bracket create/resume, transactional `advance_winner`, structured + championship payload |
| Frontend `BracketContext` | In-play UI state (Context, not Redux domain slices) |
| Frontend `createMatchups` | Fallback initial round-1 builder when server structure unavailable |
| Frontend localStorage | In-progress resume cache |
| `SelectMatchupWinnerView` | Persists picks via `advance_winner` and returns championship/champion |

Remaining M6 work is mostly frontend: drive play/championship from server payloads instead of local-only progression.

## 6. Apple Music integration

- JWT developer token via ES256 (`apple_search/auth.py`) using `apple_key_id`, `apple_team_id`, `apple_auth_key`
- Tokens persisted in `AppleAuth`; refresh on HTTP 401
- Search and artist-page builders live in `artist_search.py` / `artist_page.py`
- Errors appended to local `error.log` (gitignored)
- Mock data available (`mock_data.json`) for tests

## 7. Infrastructure

| Service | Config |
| --- | --- |
| PostgreSQL 15 | Docker Compose; healthcheck; volume `db-postgres` |
| Redis 7.0 | Docker Compose; Celery broker locally |
| pgAdmin | Port 8888; credentials from env (`PGADMIN_DEFAULT_*`) |
| Frontend | Netlify |
| Backend | Render (gunicorn); Dockerfile uses Python 3.10 |

### Environment variable split

Docker Compose expects `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD`.  
Django local settings expect `database_name` / `database_user` / `database_password` / `database_host` / `database_port`.  
`.env.example` documents both. Django loads `.env` from `services/django_backend/` via `python-dotenv`; Compose reads the **repo root** `.env`.

### Security findings (baseline)

| Issue | Severity | Notes |
| --- | --- | --- |
| Hardcoded pgAdmin credentials in Compose | Fixed in Phase 1 | Now env-driven |
| `ALLOWED_HOSTS` includes `"*"` | High (prod) | Overly permissive |
| `SelectMatchupWinnerView` debug prints | Low | Remove in cleanup |
| Root `.env` gitignored; `.env.production` now gitignored | — | Confirm no secrets ever committed |
| Apple private key must never be committed | Critical | `.gitignore` covers `AuthKey_*.p8` |

## 8. Testing and CI/CD

| Layer | Tooling | Coverage snapshot |
| --- | --- | --- |
| Frontend unit | Jest + RTL | Services, context, API client, presentational components |
| Backend unit / integration | pytest + pytest-django (also `manage.py test`) | 64→champion progression, APIClient create/select/complete, Apple mocks |
| E2E | Deferred | Playwright planned (T043) |
| CI | GitHub Actions | Lint + frontend Jest + Django pytest + migration check |
| Lint | ESLint 9 (frontend), Ruff (backend) | Make targets + CI |

See [testing-strategy.md](./testing-strategy.md) for commands and suite map.

## 9. What to preserve

- Backend `BracketService` tree generation and `advance_winner` logic
- Apple Music auth + request helpers
- Artist search async task + polling pattern (refine, don’t scrap)
- Existing Django bracket models and migrations
- Frontend bracket UX concepts (groups, championship, progress)
- Make-based local orchestration

## 10. Known inconsistencies / debt

1. README previously claimed Flask, WebSockets, and MySQL — corrected in Phase 1.
2. Frontend path in old docs was `services/frontend`; actual path is `services/dadgad`.
3. Client still owns round progression UX while server persists picks and championship structure (wire UI in Phase 4/6).
4. Remaining JSX → TypeScript migration for presentational components.
5. `startup.sh` references nonexistent `apple_search.wsgi`.
6. Django Dockerfile runs `collectstatic` at build without production env — fragile.
7. CI present (Phase 4); deploy hardening (startup.sh WSGI, Docker collectstatic) still open.

## 11. Related docs

- [Modernization roadmap & backlog](./modernization-roadmap.md)
- [Frontend guidelines](./frontend-guidelines.md)
- [Backend guidelines](./backend-guidelines.md)
- [Testing strategy](./testing-strategy.md)
- [Original modernization plan](./Modernization.md)
