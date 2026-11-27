"""Local / development settings."""

from .base import *  # noqa: F401, F403

DEBUG = True

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("database_name", "maddness"),  # noqa: F405
        "USER": os.environ.get("database_user", "postgres"),  # noqa: F405
        "HOST": os.environ.get("database_host", "127.0.0.1"),  # noqa: F405
        "PORT": os.environ.get("database_port", 5432),  # noqa: F405
        "PASSWORD": os.environ.get("database_password", "postgres"),  # noqa: F405
    }
}

CELERY_TASK_ALWAYS_EAGER = False
CELERY_TASK_EAGER_PROPAGATES = True
