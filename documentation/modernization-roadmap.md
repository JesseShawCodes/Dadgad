# Dadgad Modernization Roadmap

Prioritized backlog derived from the Phase 1 codebase audit. Prefer small, reversible milestones: do not combine dependency upgrades with architectural rewrites in the same change set.

Source plan: [Modernization.md](./Modernization.md)  
Baseline architecture: [architecture.md](./architecture.md)

---

## Phase status

| Phase | Focus | Status |
| --- | --- | --- |
| 1 | Codebase audit and baseline | **Complete** (this doc + architecture + README/Compose fixes) |
| 2 | Frontend modernization | Not started |
| 3 | Backend modernization | Not started |
| 4 | Testing and reliability | Not started |
| 5 | Infrastructure and deployment | Not started |
| 6 | Product and UX improvements | Not started |

### Phase 1 audit checklist

| Area | Reviewed |
| --- | --- |
| Frontend architecture | Done |
| Frontend dependencies | Done |
| Backend architecture | Done |
| Database | Done |
| Bracket engine | Done |
| Apple Music integration | Done |
| Infrastructure | Done |
| Testing and CI/CD | Done |

### Phase 1 changes shipped with the baseline

- Corrected root README (Django / Next.js / PostgreSQL / Redis — not Flask/MySQL/WebSockets)
- Moved pgAdmin credentials to environment variables
- Expanded `.env.example` (aligned `POSTGRES_*` and `database_*`)
- Hardened `.gitignore` (`.venv`, `node_modules`, `.env.production`, Apple key patterns)
- Added `documentation/architecture.md` and this roadmap

---

## Milestones

| ID | Outcome | Phase |
| --- | --- | --- |
| M1 | Repository audit and dependency inventory | 1 ✓ |
| M2 | Updated development environment docs/config | 1 ✓ |
| M3 | Frontend dependency modernization | 2 |
| M4 | Frontend architecture cleanup | 2 |
| M5 | Backend architecture cleanup | 3 |
| M6 | Server-side bracket generation as source of truth | 2–3 |
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
| T005 | Implement or delete stub `SelectMatchupWinnerView` | Currently returns fake success | M6 |

### P1 — Frontend modernization (Phase 2)

| ID | Task | Notes | Milestone |
| --- | --- | --- | --- |
| T010 | Inventory and remove unused deps (`firebase`, `axios`, unused p5 wrappers) | Shrink install surface before upgrades | M3 |
| T011 | Standardize on one data-fetching approach | Prefer RTK Query for API; keep or migrate SWR polling | M3 / M4 |
| T012 | Migrate remaining JSX → TypeScript | Start with services + context | M3 |
| T013 | Introduce a typed API client module | Wrap bracket + artist endpoints consistently | M4 |
| T014 | Clarify component hierarchy | pages / features / ui; reduce `pages/` vs App Router duplication | M4 |
| T015 | Centralize bracket state | Keep Context or move domain state into Redux; document the choice | M4 |
| T016 | Wire UI to server bracket APIs | Stop calling `createMatchups` as source of truth once M6 lands | M6 |
| T017 | Accessibility pass on matchup selection | Keyboard + semantic controls | M9-prep |

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
| T030 | Backend: create tournament + initial matchups (already largely in `BracketService`) | Expose as the create path the UI uses | M6 |
| T031 | Backend: record match selections and advance rounds | Use `/matchups/<pk>/winner/` end-to-end | M6 |
| T032 | Backend: return structured bracket payload the UI can render | Reuse / refine `get_structured_bracket` | M6 |
| T033 | Frontend: replace local `createMatchups` progression with API responses | Keep localStorage as cache/offline only if needed | M6 |
| T034 | Persist championship / final rounds on server | Mirror frontend championship state | M6 |

### P1 — Testing (Phase 4)

| ID | Task | Notes | Milestone |
| --- | --- | --- | --- |
| T040 | End-to-end bracket progression tests (64 → champion) | Highest-value backend tests | M7 |
| T041 | DRF APIClient integration tests for bracket endpoints | Create, select, advance, complete | M7 |
| T042 | Frontend tests for API-driven bracket flow | After M6 | M7 |
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
| T062 | Saved tournaments / history / sharing | Needs server-side brackets (M6) | M9 |
| T063 | Music discovery UX improvements | Search + metadata | M9 |

---

## Suggested next session (start of Phase 2)

1. **T010** — Remove unused frontend packages and verify `npm test` / `npm run build`.
2. **T011** — Decide RTK Query vs SWR for task polling; implement one path.
3. **T005 + T030–T032** — Spike: call existing `BracketCreateFromArtistView` from the artist page and render server matchups (read-only) before switching writes.

Do not upgrade React/Next while restructuring components in the same PR.

---

## Claude / Cursor working agreements

Recommended project docs (add when the corresponding phase starts):

```
documentation/
├── Modernization.md           # Original plan
├── architecture.md            # Baseline (Phase 1)
├── modernization-roadmap.md   # This backlog
├── frontend-guidelines.md     # Phase 2
├── backend-guidelines.md      # Phase 3
└── testing-strategy.md        # Phase 4
```

For each milestone: inspect → plan → one logical change → run tests → summarize risks.
