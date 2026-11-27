# Dadgad Modernization Roadmap

Prioritized backlog derived from the Phase 1 codebase audit. Prefer small, reversible milestones: do not combine dependency upgrades with architectural rewrites in the same change set.

Source plan: [Modernization.md](./Modernization.md)  
Baseline architecture: [architecture.md](./architecture.md)  
Frontend guidelines: [frontend-guidelines.md](./frontend-guidelines.md)

---

## Phase status

| Phase | Focus | Status |
| --- | --- | --- |
| 1 | Codebase audit and baseline | **Complete** |
| 2 | Frontend modernization | **Complete** (M3 + M4 + server create path / pick persistence) |
| 3 | Backend modernization | **Complete** (M5 + multi-bracket / transactional picks / championship payload) |
| 4 | Testing and reliability | **Complete** (M7 + CI kickoff / T050) |
| 5 | Infrastructure and deployment | Not started (T050 CI shipped early with Phase 4) |
| 6 | Product and UX improvements | Not started |

### Phase 2 changes shipped

- Removed unused frontend packages (`firebase`, `axios`, `swr`, `@p5-wrapper/*`, `p5js`)
- Standardized search + polling on RTK Query
- Added typed API client (`src/app/api/client.ts`) and shared types
- Migrated core services/context/store to TypeScript
- Clarified component hierarchy (dropped legacy `pages/` leftovers; guidelines doc)
- Documented bracket state choice: Context for play state, RTK Query for server cache
- Artist page loads via `/api/brackets/artist/...`; Generate prefers server round-1 structure
- Implemented `SelectMatchupWinnerView` and wired UI picks to it (local progression still drives UX)
- Added `documentation/frontend-guidelines.md`

---

## Milestones

| ID | Outcome | Phase |
| --- | --- | --- |
| M1 | Repository audit and dependency inventory | 1 ✓ |
| M2 | Updated development environment docs/config | 1 ✓ |
| M3 | Frontend dependency modernization | 2 ✓ |
| M4 | Frontend architecture cleanup | 2 ✓ |
| M5 | Backend architecture cleanup | 3 ✓ |
| M6 | Server-side bracket generation as source of truth | 2–3 (create + pick persist + multi-bracket + championship payload ✓; UI still drives local progression) |
| M7 | Automated test coverage (esp. bracket progression) | 4 ✓ |
| M8 | CI/CD and deployment improvements | 5 (CI workflow ✓; deploy hardening remains) |
| M9 | UI/UX redesign | 6 |

---

## Prioritized backlog

Priority: **P0** = do next / unblockers · **P1** = core modernization · **P2** = important cleanup · **P3** = polish / later

### P0 — Immediate follow-ups

| ID | Task | Notes | Milestone |
| --- | --- | --- | --- |
| T001 | Confirm local `.env` has `PGADMIN_*` and matching `database_*` / `POSTGRES_*` | Required after Compose change | M2 |
| T002 | Copy Apple credentials into `services/django_backend/.env` or symlink root `.env` | Django loads dotenv from the backend package dir | M2 |
| T003 | Verify `make docker-start` + migrate + `dadgad-start` + Celery end-to-end | Smoke-test the documented quick start | M2 |
| T004 | Remove `"*"` from production `ALLOWED_HOSTS` | Security | M8 |
| T005 | Implement or delete stub `SelectMatchupWinnerView` | **Done** — advances via `BracketService.advance_winner` | M6 ✓ |

### P1 — Frontend modernization (Phase 2)

| ID | Task | Notes | Milestone |
| --- | --- | --- | --- |
| T010 | Inventory and remove unused deps | **Done** | M3 ✓ |
| T011 | Standardize on one data-fetching approach | **Done** — RTK Query only | M3 / M4 ✓ |
| T012 | Migrate remaining JSX → TypeScript | **Partial** — services, context, store, search, API client | M3 ✓ |
| T013 | Introduce a typed API client module | **Done** — `api/client.ts` | M4 ✓ |
| T014 | Clarify component hierarchy | **Done** | M4 ✓ |
| T015 | Centralize bracket state | **Done** — keep Context; documented | M4 ✓ |
| T016 | Wire UI to server bracket APIs | **Partial** — create path wired; pick persistence / full progression deferred | M6 |
| T017 | Accessibility pass on matchup selection | **Partial** — aria on matchup buttons | M9-prep |

### P1 — Backend modernization (Phase 3)

| ID | Task | Notes | Milestone |
| --- | --- | --- | --- |
| T020 | Split settings into `settings/base.py`, `local.py`, `production.py` | **Done** | M5 ✓ |
| T021 | Keep business logic in services; thin views | **Done** — `build_artist_bracket_payload` + thin DRF views | M5 ✓ |
| T022 | Normalize API under `/api/` with consistent error shapes | **Done** — `/api/artists/*` + `{error, code}`; legacy aliases kept | M5 ✓ |
| T023 | Support multiple brackets per artist/user | **Done** — always create; resume latest incomplete; `?new=1` | M6 ✓ |
| T024 | Transactional `advance_winner` + validation | **Done** — `select_for_update`, reject completed/invalid | M6 ✓ |
| T025 | Add DB indexes for `artist_id`, matchup lookups | **Done** | M5 ✓ |
| T026 | Review Celery retries / failure handling | **Done** — retries/backoff/time limits; removed `sleep(2)` | M5 ✓ |
| T027 | Fix `ArtistDetails.updated` field (`auto_now`) | **Done** | M5 ✓ |
| T028 | Align or remove unused allauth surface until auth is productized | **Done** — removed from settings + requirements until needed | M5 ✓ |

### P1 — Server-side bracket as source of truth (M6)

| ID | Task | Notes | Milestone |
| --- | --- | --- | --- |
| T030 | Backend: create tournament + initial matchups | UI uses create-from-artist | M6 ✓ |
| T031 | Backend: record match selections and advance rounds | Backend endpoint implemented; UI wiring deferred (local play for now) | M6 partial |
| T032 | Backend: return structured bracket payload the UI can render | `get_structured_bracket` | M6 ✓ |
| T033 | Frontend: replace local `createMatchups` as sole create path | Prefers server round-1; `createMatchups` remains fallback | M6 partial |
| T034 | Persist championship / final rounds on server as UX source of truth | **Partial** — DB championship matchups + `championship`/`champion` payload; UI still advances locally | M6 partial |

### P1 — Testing (Phase 4)

| ID | Task | Notes | Milestone |
| --- | --- | --- | --- |
| T040 | End-to-end bracket progression tests (64 → champion) | **Done** — `brackets/tests_progression.py` | M7 ✓ |
| T041 | DRF APIClient integration tests for bracket endpoints | **Done** — `brackets/tests_api_integration.py` | M7 ✓ |
| T042 | Frontend tests for API-driven bracket flow | **Partial** — client pick-flow contract; UI play still local | M7 partial |
| T043 | Add Playwright smoke for search → artist → first pick | Deferred until server-driven play UX | M7 |
| T044 | Consider pytest + pytest-django | **Done** — pytest primary; `manage.py test` retained | M7 ✓ |

### P2 — Infrastructure (Phase 5)

| ID | Task | Notes | Milestone |
| --- | --- | --- | --- |
| T050 | GitHub Actions: lint + frontend tests + Django tests + migrate check | **Done** — `.github/workflows/ci.yml` | M8 ✓ |
| T051 | Fix `startup.sh` WSGI module (`madness_backend.wsgi`) | Currently wrong | M8 |
| T052 | Harden Docker image build (collectstatic / env) | Fragile at build time | M8 |
| T053 | Document Netlify + Render env vars and deploy order | Ops runbook | M8 |
| T054 | Confirm Redis/Upstash and Postgres backups for production | Ops | M8 |

### P3 — Product / UX (Phase 6)

| ID | Task | Notes | Milestone |
| --- | --- | --- | --- |
| T060 | Visual identity (type, color, spacing, artwork) | After architecture is stable | M9 |
| T061 | Responsive bracket navigation | | M9 |
| T062 | Saved tournaments / history / sharing | Needs fuller server-side brackets | M9 |
| T063 | Music discovery UX improvements | Search + metadata | M9 |

---

### Phase 3 changes shipped

- Split Django settings into `madness_backend/settings/{base,local,production}.py`
- Thin bracket views; artist-page assembly moved into `BracketService`
- Canonical `/api/artists/search` + `/api/artists/<name>/page` with `{error, code}` shape (legacy aliases kept)
- Multiple brackets per artist; resume latest incomplete; `?new=1` forces create
- Transactional `advance_winner` with validation
- DB indexes + championship fields (`is_championship`, feeders, `next_slot`)
- Celery retries/backoff; fixed `ArtistDetails.updated`; removed unused allauth
- Added `documentation/backend-guidelines.md`

### Phase 4 changes shipped

- Bracket progression suites: 64 → champion, size matrix, round-2 readiness
- DRF APIClient integration: create/resume, select-matchup-winner, full 16/64 via HTTP
- pytest + pytest-django + pytest-cov; `madness_backend.settings.test`
- GitHub Actions CI (Ruff, migration check, pytest, ESLint, Jest)
- `documentation/testing-strategy.md`
- Fixed flaky live-API bracket view test + InProgressBracket handle mismatch

## Suggested next session (start of Phase 5)

1. **T051 / T052** — Fix `startup.sh` WSGI module; harden Docker image build.
2. **T053 / T054** — Document Netlify + Render env/deploy order; confirm prod Redis/Postgres backups.
3. **T043 / remaining T042** — Playwright smoke + fuller frontend pick/championship tests once UI is server-driven.

Do not upgrade Django majors while expanding deploy tooling in the same PR.

---

## Claude / Cursor working agreements

```
documentation/
├── Modernization.md
├── architecture.md
├── modernization-roadmap.md
├── frontend-guidelines.md     # Phase 2 ✓
├── backend-guidelines.md      # Phase 3 ✓
└── testing-strategy.md        # Phase 4 ✓
```

For each milestone: inspect → plan → one logical change → run tests → summarize risks.
