from django.urls import path
from .views import BracketCreateView, BracketDetailView, MatchupWinnerView

urlpatterns = [
    path('brackets/', BracketCreateView.as_view(), name='bracket-create'),
    path('brackets/<int:pk>/', BracketDetailView.as_view(), name='bracket-detail'),
    path('matchups/<int:pk>/winner/', MatchupWinnerView.as_view(), name='matchup-winner'),
]
