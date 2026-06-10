from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Bracket, Matchup
from .serializers import BracketSerializer, MatchupSerializer
from .services import BracketService
from apple_search.artist_page import artist_content

class BracketCreateView(APIView):
    def post(self, request):
        artist_id = request.data.get('artist_id')
        if not artist_id:
            return Response({"error": "artist_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Fetch artist data using existing logic in apple_search
        data = artist_content(artist_id)
        if "error" in data:
            return Response(data, status=status.HTTP_404_NOT_FOUND)
        
        songs = data.get('top_songs_list', [])
        artist_name = data.get('artist_name')
        
        if not songs:
            return Response({"error": "No songs found for this artist"}, status=status.HTTP_400_BAD_REQUEST)
            
        bracket = BracketService.create_bracket(artist_id, artist_name, songs)
        serializer = BracketSerializer(bracket)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class BracketDetailView(APIView):
    def get(self, request, pk):
        try:
            bracket = Bracket.objects.prefetch_related('items', 'matchups__item1', 'matchups__item2', 'matchups__winner').get(pk=pk)
            serializer = BracketSerializer(bracket)
            return Response(serializer.data)
        except Bracket.DoesNotExist:
            return Response({"error": "Bracket not found"}, status=status.HTTP_404_NOT_FOUND)

class MatchupWinnerView(APIView):
    def post(self, request, pk):
        winner_id = request.data.get('winner_id')
        if not winner_id:
            return Response({"error": "winner_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            matchup = BracketService.advance_winner(pk, winner_id)
            serializer = MatchupSerializer(matchup)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
