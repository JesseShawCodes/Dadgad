from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from django.core.cache import cache
from .models import Bracket
from .serializers import BracketSerializer, MatchupSerializer
from .services import BracketService
from apple_search.artist_page import (
    top_songs_list_builder,
    featured_album_details,
    add_weight_to_songs,
    get_artist_id_by_name,
)


class BracketCreateFromArtistView(APIView):
    renderer_classes = [JSONRenderer]

    def get(self, request, artist_name):
        artist_id = get_artist_id_by_name(artist_name)
        cache_key = f"bracket_create:{artist_id}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)

        artist_name = artist_name.replace('-', ' ').title()
        songs = top_songs_list_builder(artist_id)
        albums = featured_album_details(artist_id)
        artist_id = get_artist_id_by_name(artist_name)
        # Add weights (rank and featured_album status) to songs
        songs = add_weight_to_songs(
            songs,
            albums.get("data", []) if albums and "data" in albums else []
        )

        bracket = BracketService.create_bracket(
            artist_id,
            artist_name,
            songs
        )

        data = {
            "name": f"{artist_name} Madness (Mock)",
            "artist_name": artist_name,
            "artist_id": artist_id,
            "featured_albums": albums,
            "top_songs_list": songs,
            "matchups": MatchupSerializer(
                bracket.matchups.all(),
                many=True
            ).data,
            "bracket_id": bracket.id,
            "bracket": BracketService.get_structured_bracket(bracket, songs)
        }
        cache.set(cache_key, data, timeout=3600)
        return Response(data, status=status.HTTP_200_OK)


class BracketDetailView(APIView):
    renderer_classes = [JSONRenderer]

    def get(self, request, pk):
        try:
            bracket = Bracket.objects.prefetch_related(
                'items',
                'matchups__item1',
                'matchups__item2',
                'matchups__winner',
            ).get(pk=pk)
            serializer = BracketSerializer(bracket)
            return Response(serializer.data)
        except Bracket.DoesNotExist:
            return Response(
                {"error": "Bracket not found"},
                status=status.HTTP_404_NOT_FOUND,
            )


class MatchupWinnerView(APIView):
    renderer_classes = [JSONRenderer]

    def post(self, request, pk):
        winner_id = request.data.get('winner_id')
        if not winner_id:
            return Response(
                {"error": "winner_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            matchup = BracketService.advance_winner(pk, winner_id)
            serializer = MatchupSerializer(matchup)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
