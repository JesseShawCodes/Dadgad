# Dadgad Testing Strategy

Phase 4 foundation for automated coverage across the Django API and Next.js frontend.

## Goals

1. Protect the core product loop: create bracket → pick winners → advance rounds → champion.
2. Keep tests fast and hermetic (no live Apple Music calls in CI).
3. Run the same suite locally and in GitHub Actions.

## Tooling

| Layer | Tooling | How to run |
| --- | --- | --- |
| Backend unit / integration | **pytest** + **pytest-django** + DRF `APIClient` | `make django-pytest` or `cd services/django_backend && make pytest` |
| Backend (legacy) | `manage.py test` | `make django-test` |
| Backend coverage | pytest-cov | `cd services/django_backend && make test-coverage` |
| Backend lint | Ruff | `make django-ruff-check` |
| Frontend unit | Jest + React Testing Library | `make dadgad-test` or `cd services/dadgad && npm test` |
| Frontend lint | ESLint | `make dadgad-lint` |
| CI | GitHub Actions (`.github/workflows/ci.yml`) | On push / PR |
| E2E (deferred) | Playwright | T043 — smoke: search → artist → first pick |

Django settings for pytest/CI: `madness_backend.settings.test` (Postgres when `database_*` is set; otherwise in-memory SQLite).

## Highest-value backend suites

| Suite | File | What it proves |
| --- | --- | --- |
| Progression (T040) | `brackets/tests_progression.py` | 64 → 32 R1 matchups → championship → champion; size matrix 8/16/32 |
| API integration (T041) | `brackets/tests_api_integration.py` | Create/resume/`?new=1`, `/api/matchups/.../winner/`, `select-matchup-winner`, full 16 and 64 via HTTP |
| Service / views | `brackets/tests.py`, `brackets/tests_structured.py` | Validation, structure payload, multi-bracket resume |
| Apple Music | `apple_search/tests*.py` | Auth, search, artist page builders (mocked HTTP) |

Shared helpers: `brackets/test_factories.py` (`make_songs`, `play_bracket_to_completion`).

## Frontend focus

| Area | Status |
| --- | --- |
| Presentational / service unit tests | Existing Jest suite (~25+ files) |
| Typed API client + pick contract (T042 partial) | `apiClient.test.ts`, `bracketPickFlow.test.ts`, `serverBracket.test.jsx` |
| UI wired to server progression | Deferred with fuller M6 (local Context still drives play UX) |
| Playwright smoke (T043) | Not yet — add after pick UI is server-driven |

## CI pipeline

`.github/workflows/ci.yml` runs two jobs:

1. **Backend** — Postgres 15 service, install requirements, Ruff, `makemigrations --check --dry-run`, pytest with coverage on `brackets` + `apple_search`.
2. **Frontend** — Node 22, `npm ci`, ESLint, Jest.

Principles:

- Mock all Apple Music / network I/O in tests.
- Prefer one logical assertion group per behavior (create, advance, complete).
- Do not combine Django major upgrades with test-infra changes in the same PR.

## Local checklist before opening a PR

```bash
make django-ruff-check
make django-pytest
make dadgad-lint
make dadgad-test
```

## Next increments

- T043: Playwright smoke for search → artist → first pick (needs running stack or MSW-style stubs).
- Expand T042 once the UI drives championship from server payloads.
- Optionally raise coverage gates in CI once baselines stabilize.
