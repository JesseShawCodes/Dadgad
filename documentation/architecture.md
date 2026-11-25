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
| API client | RTK Query (`jsonServerApi.jsx`) for artist search / artist page / task status; SWR also used on search page for polling |
| Bracket state | React Context + reducer (`BracketContext.jsx`); persisted to `localStorage` |
| Styling | Bootstrap 5.3 + SCSS (`App.scss`); some CSS modules |
| TypeScript | Partial — a few `.tsx` files; majority still `.jsx` |
| Visualization | p5.js canvas via `react-p5` (`bracketService.jsx`, `p5Sketch.jsx`) |
| Tests | Jest + Testing Library (~25 test files); component/service unit tests |
| Deploy | Netlify with `@netlify/plugin-nextjs`; local dev on port **1207** |

### Key frontend flows

1. **Artist search** — user submits query → `GET /artist?q=` returns Celery `task_id` → frontend polls `GET /api/task-status?q=` (SWR) until results arrive.
2. **Artist page** — `GET /artist-page/<name>` loads songs/albums; frontend builds matchups with `createMatchups()` and stores progress in `localStorage`.
3. **Bracket play** — selections update `BracketContext` and local storage. Backend `BracketService` / matchup winner APIs exist but are **not the primary path** the UI uses today.

### Dependency notes (frontend)

| Package | Status |
| --- | --- |
| `next`, `react`, `react-dom` | Current major versions — preserve |
| `@reduxjs/toolkit`, `react-redux` | Used for RTK Query only (no domain slices) |
| `swr` | Used alongside RTK Query for task polling — dual data-fetching approach |
| `firebase` | Declared; **no source imports found** — candidate for removal |
| `axios` | Declared; **no source imports found** — candidate for removal |
| `p5`, `p5js`, `react-p5`, `@p5-wrapper/*` | Overlapping p5 wrappers; only `react-p5` + `p5` appear in use |
| `prop-types` | Legacy alongside gradual TypeScript adoption |

## 4. Backend architecture

| Concern | Current state |
| --- | --- |
| Framework | Django **5.2.15**, DRF **3.17** |
| Apps | `apple_search`, `brackets` (+ django-allauth, celery results) |
| Settings | Single `madness_backend/settings.py` (dev/prod via `environment` env var) |
| Auth | django-allauth + Apple social provider configured; bracket owner FK exists but optional |
| API style | Mix of function views (`apple_search.views`) and DRF `APIView` (`brackets.views`) |
| Business logic | `brackets/services.py` (`BracketService`) — create, advance winner, structured output |
| Celery | `fetch_artist_data` task wraps artist search; broker = `UPSTASH_REDIS_URL` |
| Lint | Ruff; Makefile targets `ruff-check` / `ruff-check-fix` |
| Tests | Django `TestCase` suites in `apple_search` and `brackets` (~1.3k lines of tests) |
| Deploy | Dockerfile (Python 3.10 + gunicorn); Procfile for Render; host `music-march-maddness.onrender.com` |

### API surface

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/artist?q=` | Queue artist search Celery task |
| GET | `/artist-page/<artist_name>` | Artist page payload (songs, albums, weights) |
| GET | `/api/task-status?q=` | Celery task status / result |
| GET | `/api/brackets/artist/<artist_name>` | Create/fetch bracket from artist (server-side) |
| GET | `/api/brackets/<pk>/` | Bracket detail |
| POST | `/api/matchups/<pk>/winner/` | Advance winner via `BracketService` |
| POST | `/api/brackets/select-matchup-winner/` | **Stub** — returns success; does not update bracket |

### Models

**`brackets`**

- `Bracket` — name, artist_id/name, owner (nullable), is_completed
- `BracketItem` — song entry with seed, apple_id, image_url
- `Matchup` — round_number, matchup_num, item1/item2/winner, next_matchup self-FK

**`apple_search`**

- `AppleAuth` — stored developer JWT tokens
- `ArtistDetails` — sparse artist cache model (limited usage)

Indexes beyond defaults are not defined on bracket tables. `Bracket.objects.filter(artist_id=...).first()` means **one persisted bracket per artist**, not per user/session.

## 5. Bracket engine (dual implementation)

This is the most important architectural finding.

| Location | Role today |
| --- | --- |
| Frontend `createBracket.jsx` | **Primary** — builds 64-song group matchups client-side |
| Frontend `BracketContext` + localStorage | Progression and persistence for the user’s session |
| Backend `BracketService` | Full tree generation + `advance_winner`; used by create-from-artist API |
| Backend `SelectMatchupWinnerView` | Incomplete stub |

Implication: tournament truth lives in the browser. Server-side bracket APIs are partially built but not wired as the source of truth. Modernization Phase 2/3 should consolidate generation and progression on the backend (see roadmap M6).

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
| Frontend unit | Jest + RTL | Services, context, many presentational components |
| Backend unit | `manage.py test` + coverage | Apple auth/search, bracket create/advance/structure |
| E2E | None | No Playwright/Cypress |
| CI | None | No `.github/workflows` |
| Lint | ESLint 9 (frontend), Ruff (backend) | Manual via Make / npm |

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
3. Dual bracket engines (client vs server).
4. Dual data-fetching libraries (RTK Query + SWR).
5. Unused npm packages (`firebase`, `axios`, redundant p5 wrappers).
6. `startup.sh` references nonexistent `apple_search.wsgi`.
7. Django Dockerfile runs `collectstatic` at build without production env — fragile.
8. Settings comment still says Django 5.1; project is on 5.2.
9. `ArtistDetails.updated` uses `auto_now_add` (likely meant `auto_now`).
10. No CI pipeline.

## 11. Related docs

- [Modernization roadmap & backlog](./modernization-roadmap.md)
- [Original modernization plan](./Modernization.md)
