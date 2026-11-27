"""
URL configuration for madness_backend project.
"""

from django.contrib import admin
from django.urls import path, include
from apple_search.views import (
    artist_search_view,
    artist_page_view,
    task_status_view,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    # Canonical API surface
    path("api/", include("brackets.urls")),
    path("api/artists/search", artist_search_view, name="artist-search"),
    path(
        "api/artists/<str:artist_name>/page",
        artist_page_view,
        name="artist-page",
    ),
    path("api/task-status", task_status_view, name="task-status"),
    # Legacy aliases (kept for older clients / tests)
    path("artist", artist_search_view),
    path("artist-page/<str:artist_name>", artist_page_view),
]
