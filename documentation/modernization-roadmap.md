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
| 3 | Backend modernization | Not started |
| 4 | Testing and reliability | Not started |
| 5 | Infrastructure and deployment | Not started |
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
| M5 | Backend architecture cleanup | 3 |
| M6 | Server-side bracket generation as source of truth | 2–3 (create + pick persist ✓; session resume / full server progression remaining) |
| M7 | Automated test coverage (esp. bracket progression) | 4 |
| M8 | CI/CD and deployment improvements | 5 |
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
| T016 | Wire UI to server bracket APIs | **Partial** — create + select-winner wired; full server-driven progression/resume later | M6 |
| T017 | Accessibility pass on matchup selection | **Partial** — aria on matchup buttons | M9-prep |

### P1 — Backend modernization (Phase 3)

| ID | Task | Notes | Milestone |
| --- | --- | --- | --- |
| T020 | Split settings into `settings/base.py`, `local.py`, `production.py` | Replace single-file env branching | M5 |
| T021 | Keep business logic in services; thin views | Extend `BracketService`; avoid new logic in views | M5 |
| T022 | Normalize API under `/api/` with consistent error shapes | Artist search still outside `/api/` | M5 |
| T023 | Support multiple brackets per artist/user | Today: one `Bracket` per `artist_id` | M6 |
| T024 | Transactional `advance_winner` + validation | Concurrent picks, completed matchups | M6 |
| T025 | Add DB indexes for `artist_id`, matchup lookups | Query efficiency | M5 |
| T026 | Review Celery retries / failure handling | `fetch_artist_data` uses hardcoded `sleep(2)` | M5 |
| T027 | Fix `ArtistDetails.updated` field (`auto_now`) | Model bug | M5 |
| T028 | Align or remove unused allauth surface until auth is productized | Config present; product path unclear | M5 |

### P1 — Server-side bracket as source of truth (M6)

| ID | Task | Notes | Milestone |
| --- | --- | --- | --- |
| T030 | Backend: create tournament + initial matchups | UI uses create-from-artist | M6 ✓ |
| T031 | Backend: record match selections and advance rounds | `select-matchup-winner` implemented; UI calls it | M6 ✓ |
| T032 | Backend: return structured bracket payload the UI can render | `get_structured_bracket` | M6 ✓ |
| T033 | Frontend: replace local `createMatchups` as sole create path | Prefers server round-1; `createMatchups` remains fallback | M6 partial |
| T034 | Persist championship / final rounds on server as UX source of truth | Still client-driven for championship UX | M6 |

### P1 — Testing (Phase 4)

| ID | Task | Notes | Milestone |
| --- | --- | --- | --- |
| T040 | End-to-end bracket progression tests (64 → champion) | Highest-value backend tests | M7 |
| T041 | DRF APIClient integration tests for bracket endpoints | Create, select, advance, complete | M7 |
| T042 | Frontend tests for API-driven bracket flow | After fuller M6 | M7 |
| T043 | Add Playwright smoke for search → artist → first pick | Optional but valuable | M7 |
| T044 | Consider pytest + pytest-django | Optional migration from `manage.py test` | M7 |

### P2 — Infrastructure (Phase 5)

| ID | Task | Notes | Milestone |
| --- | --- | --- | --- |
| T050 | GitHub Actions: lint + frontend tests + Django tests + migrate check | No CI today | M8 |
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

## Suggested next session (start of Phase 3)

1. **T020** — Split Django settings into base/local/production.
2. **T021 / T022** — Thin views + normalize `/api/` error shapes.
3. **T023 / T024 / T034** — Multi-bracket ownership, transactional picks, championship as server truth.

Do not upgrade Django majors while restructuring apps in the same PR.

---

## Claude / Cursor working agreements

```
documentation/
├── Modernization.md
├── architecture.md
├── modernization-roadmap.md
├── frontend-guidelines.md     # Phase 2 ✓
├── backend-guidelines.md      # Phase 3
└── testing-strategy.md        # Phase 4
```

For each milestone: inspect → plan → one logical change → run tests → summarize risks.
