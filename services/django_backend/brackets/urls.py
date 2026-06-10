from django.urls import path
from .views import (
    BracketCreateView,
    BracketDetailView,
    MatchupWinnerView,
    BracketCreateFromArtistView,
)

urlpatterns = [
    path("brackets/", BracketCreateView.as_view(), name="bracket-create"),
    path(
        "brackets/from-artist/<str:artist_name>/",
        BracketCreateFromArtistView.as_view(),
        name="bracket-create-from-artist",
    ),
    path("brackets/<int:pk>/", BracketDetailView.as_view(), name="bracket-detail"),
    path(
        "matchups/<int:pk>/winner/", MatchupWinnerView.as_view(), name="matchup-winner"
    ),
]
