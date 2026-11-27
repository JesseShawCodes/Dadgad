# Dadgad — agent instructions

Dadgad is a March Madness–style song bracket app: Next.js frontend + Django/Celery backend + PostgreSQL + Redis, with Apple Music as the catalog source.

## Before changing code

1. Read [documentation/architecture.md](documentation/architecture.md) for the current system.
2. Use [documentation/modernization-roadmap.md](documentation/modernization-roadmap.md) for prioritized tasks.
3. Prefer one logical change per PR; do not mix dependency upgrades with architecture rewrites.

## Layout

- Frontend: `services/dadgad` (Next.js App Router, port 1207)
- Backend: `services/django_backend` (Django project `madness_backend`)
- Infra: root `docker-compose.yml` (Postgres, Redis, pgAdmin)
- Env: root `.env` (see `.env.example`); backend may override with `services/django_backend/.env`

## Commands

```bash
make setup              # first-time: .env, docker, pip install, migrate
make docker-start       # Postgres + Redis + pgAdmin
make django-start       # API + Celery
make dadgad-start       # Next.js
make django-test        # backend tests (manage.py test)
make django-pytest      # backend tests (pytest; preferred)
make dadgad-test        # frontend Jest
make dadgad-lint        # frontend ESLint
```


## Preserve

- `brackets/services.py` (`BracketService`) as the server bracket engine
- Apple Music auth helpers in `apple_search/auth.py`
- Existing bracket models/migrations unless a migration is required

## Core product direction

Tournament generation and progression should become **server-side** (roadmap M6). The frontend should display brackets and send selections; it should not remain the source of truth via `createMatchups` + localStorage alone.
