# Dadgad

March Madness–style song brackets for your favorite artists. Search Apple Music, seed a tournament of top tracks, pick winners round by round, and crown a champion.

Live site: [https://dadgad.netlify.app/](https://dadgad.netlify.app/)

## Architecture

| Layer | Stack |
| --- | --- |
| Frontend | React 19, Next.js (App Router), Redux Toolkit / RTK Query, Bootstrap 5 |
| Backend | Django 5.2, Django REST Framework |
| Database | PostgreSQL 15 |
| Background jobs | Celery 5 + Redis 7 (local) / Upstash (production-ready) |
| Music data | Apple Music API |
| Frontend host | Netlify (`@netlify/plugin-nextjs`) |
| Backend host | Render (gunicorn) |

Monorepo layout:

```
services/
  dadgad/            # Next.js frontend (port 1207 in local dev)
  django_backend/    # Django API + Celery workers
docker-compose.yml   # PostgreSQL, Redis, pgAdmin
```

See [documentation/architecture.md](documentation/architecture.md) for a full system overview and [documentation/modernization-roadmap.md](documentation/modernization-roadmap.md) for the phased modernization backlog.

## Prerequisites

- Node.js 20+
- Python 3.10+
- Docker (PostgreSQL + Redis)

## Quick start

1. **Environment**

   ```bash
   cp .env.example .env
   ```

   Fill in Apple Music credentials (`apple_key_id`, `apple_team_id`, `apple_auth_key`) and `DJANGO_SECRET_KEY`. Set pgAdmin credentials if you use that service.

2. **Infrastructure**

   ```bash
   make docker-start
   ```

   Starts PostgreSQL (`localhost:5432`), Redis (`localhost:6379`), and pgAdmin (`localhost:8888`).

3. **Backend**

   ```bash
   cd services/django_backend
   make install
   make migrate
   make app-start
   ```

   Django runs at `http://localhost:8000`. Celery starts alongside the API.

4. **Frontend**

   ```bash
   make dadgad-start
   ```

   Next.js runs at `http://localhost:1207` (Turbopack). Set `NEXT_PUBLIC_SERVER=http://localhost:8000` if needed.

## Common Make targets

| Target | Description |
| --- | --- |
| `make docker-start` / `docker-stop` | Start/stop Postgres, Redis, pgAdmin |
| `make django-start` / `django-stop` | Start/stop Django + Celery |
| `make django-migrate` | Run migrations |
| `make django-test` | Run Django tests |
| `make dadgad-start` / `dadgad-stop` | Start/stop Next.js |
| `make postgres-shell` | `psql` into the local database |

## Testing

**Frontend** (Jest + Testing Library):

```bash
cd services/dadgad
npm test
```

**Backend** (Django test runner + coverage):

```bash
cd services/django_backend
make test
make test-coverage
```

## Environment variables

See [.env.example](.env.example). Important groups:

- **Apple Music** — `apple_key_id`, `apple_team_id`, `apple_auth_key`, catalog URLs
- **Postgres** — `POSTGRES_*` for Docker; `database_*` for Django local settings
- **Redis / Celery** — `REDIS_URL`, `UPSTASH_REDIS_URL`
- **Django** — `DJANGO_SECRET_KEY`, `environment` (`development` / `production`)
- **Frontend** — `NEXT_PUBLIC_SERVER`, `NEXT_PUBLIC_NAME`, `NEXT_PUBLIC_MAINTENANCE_MODE`

## Documentation

- [Architecture](documentation/architecture.md)
- [Modernization roadmap & backlog](documentation/modernization-roadmap.md)
- [Modernization plan (source)](documentation/Modernization.md)
