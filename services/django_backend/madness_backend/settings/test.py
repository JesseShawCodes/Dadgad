"""
Settings used by pytest / CI.

Uses PostgreSQL when DATABASE_* env vars are set (GitHub Actions service),
otherwise falls back to an in-memory SQLite database for lightweight local runs.
"""

import os

from .base import *  # noqa: F401, F403

DEBUG = False
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "test-secret-key-not-for-prod")

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "testserver"]

# Keep Celery synchronous in tests
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

_db_name = os.environ.get("database_name") or os.environ.get("POSTGRES_DB")
_db_host = os.environ.get("database_host") or os.environ.get("POSTGRES_HOST")

if _db_name and _db_host:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": _db_name,
            "USER": os.environ.get(
                "database_user", os.environ.get("POSTGRES_USER", "postgres")
            ),
            "PASSWORD": os.environ.get(
                "database_password",
                os.environ.get("POSTGRES_PASSWORD", "postgres"),
            ),
            "HOST": _db_host,
            "PORT": os.environ.get(
                "database_port", os.environ.get("POSTGRES_PORT", "5432")
            ),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": ":memory:",
        }
    }

# Avoid requiring Redis during unit/integration tests
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}
