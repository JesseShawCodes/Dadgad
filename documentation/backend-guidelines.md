# Dadgad Backend Guidelines

Phase 3 conventions for the Django API in `services/django_backend`.

## Stack choices

| Concern | Choice | Notes |
| --- | --- | --- |
| Framework | Django 5.2 + DRF | Do not upgrade majors in the same change as architecture work |
| Settings | `madness_backend/settings/{base,local,production}.py` | Selected via `environment` / `DJANGO_ENV`, or set `DJANGO_SETTINGS_MODULE` explicitly |
| Business logic | **Services** (`brackets/services.py`) | Views stay thin; raise domain exceptions from services |
| Auth productization | Deferred | django-allauth removed from `INSTALLED_APPS` until product needs it; `Bracket.owner` FK remains |
| Background work | Celery + Redis | Tasks declare retries / time limits; avoid hardcoded sleeps |
| Lint | Ruff | `make ruff-check` from the backend package |

## Layout

```
services/django_backend/
├── madness_backend/
│   ├── settings/          # base / local / production
│   ├── api_errors.py      # {error, code} helpers + DRF exception wrapper
│   ├── urls.py            # Canonical /api/ routes + legacy aliases
│   └── celery.py
├── brackets/              # Tournament models, BracketService, DRF views
├── apple_search/          # Apple Music auth, search, artist page, Celery tasks
└── manage.py
```

A full `apps/tournaments|music` package move is **not** required for Phase 3; prefer incremental cleanup inside the existing apps.

## API conventions

1. Prefer paths under `/api/…`.
2. Error shape: `{"error": "<message>", "code": "<snake_case>"}` (`code` optional only for legacy edge cases).
3. Artist search / page:
   - Canonical: `GET /api/artists/search`, `GET /api/artists/<name>/page`
   - Legacy aliases retained: `/artist`, `/artist-page/<name>`
4. Bracket create/resume: `GET /api/brackets/artist/<name>` (reuse latest incomplete). Pass `?new=1` to force a new tournament.
5. Picks: `POST /api/brackets/select-matchup-winner/` or `POST /api/matchups/<id>/winner/`.

## Bracket engine rules

- **`BracketService`** owns create, advance, structured payload, championship, and champion resolution.
- Multiple brackets per `artist_id` are allowed; resume uses the latest incomplete row.
- `advance_winner` is transactional (`select_for_update(of=("self",))`), rejects completed / invalid picks.
- Group structure lives in `bracket` (`group1`…`group4`). Championship rounds live in `championship` / `championshipBracket`-compatible keys (`round5` / `round6` when size ≥ 16).
- Preserve existing models/migrations unless a migration is required (indexes and championship fields are intentional Phase 3 additions).

## Celery

- Declare `autoretry_for`, backoff, and time limits on I/O tasks.
- Do not block workers with fixed `sleep` calls for pacing.

## Testing

- Primary runner: **pytest** + **pytest-django** (`make django-pytest`; settings `madness_backend.settings.test`).
- `manage.py test` remains supported for ad-hoc runs.
- Suites live next to the app (`brackets/tests*.py`, `apple_search/tests*.py`); helpers in `brackets/test_factories.py`.
- Protect bracket progression and validation paths whenever `BracketService` changes (see `tests_progression.py` / `tests_api_integration.py`).
- Mock Apple Music / network I/O — never rely on live catalog calls in CI.
- Strategy doc: [testing-strategy.md](./testing-strategy.md).
