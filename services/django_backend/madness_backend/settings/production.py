"""Production settings."""

import dj_database_url

from .base import *  # noqa: F401, F403

DEBUG = False

_raw_hosts = os.environ.get(  # noqa: F405
    "allowed_hosts",
    "music-march-maddness.onrender.com",
)
ALLOWED_HOSTS = [h.strip() for h in _raw_hosts.split(",") if h.strip()]

DATABASES = {
    "default": dj_database_url.config(
        default=os.environ.get("DATABASE_URL"),  # noqa: F405
        conn_max_age=600,
    )
}

CELERY_TASK_ALWAYS_EAGER = False
CELERY_TASK_EAGER_PROPAGATES = True

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
