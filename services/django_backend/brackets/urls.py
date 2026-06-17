from django.urls import path
from .views import (
    BracketDetailView,
    MatchupWinnerView,
    BracketCreateFromArtistView,
    SelectMatchupWinnerView,
)

urlpatterns = [
    path(
        "brackets/artist/<str:artist_name>",
        BracketCreateFromArtistView.as_view(),
        name="bracket-create-from-artist",
    ),
    path(
        "brackets/<int:pk>/",
        BracketDetailView.as_view(),
        name="bracket-detail",
    ),
    path(
        "matchups/<int:pk>/winner/",
        MatchupWinnerView.as_view(),
        name="matchup-winner",
    ),
    path(
        "brackets/select-matchup-winner/",
        SelectMatchupWinnerView.as_view(),
        name="select-matchup-winner",
    ),
]
