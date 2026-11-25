"""
Select settings module from DJANGO_ENV / environment.

Prefer explicit modules when needed:
  DJANGO_SETTINGS_MODULE=madness_backend.settings.local
  DJANGO_SETTINGS_MODULE=madness_backend.settings.production

Default `madness_backend.settings` still works via this package.
"""

import os

_env = (
    os.environ.get("DJANGO_ENV")
    or os.environ.get("environment")
    or "development"
).lower()

if _env in ("production", "prod"):
    from .production import *  # noqa: F401, F403
else:
    from .local import *  # noqa: F401, F403
