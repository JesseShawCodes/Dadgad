from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from django.core.cache import cache
from django.db.models import Q
from .models import Bracket, BracketItem, Matchup
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
        if isinstance(artist_id, str) and not artist_id.isdigit():
            return Response(
                {"error": artist_id},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not artist_id:
            return Response(
                {"error": "Artist not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        cache_key = f"bracket_create:{artist_id}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)

        songs = top_songs_list_builder(artist_id)
        albums = featured_album_details(artist_id)
        # Add weights (rank and featured_album status) to songs
        songs = add_weight_to_songs(
            songs,
            albums.get("data", []) if albums and "data" in albums else []
        )

        bracket = BracketService.create_bracket(
            artist_id,
            artist_name.replace('-', ' ').title(),
            songs
        )

        data = {
            "artist_name": artist_name.replace('-', ' ').title(),
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


class SelectMatchupWinnerView(APIView):
    renderer_classes = [JSONRenderer]

    def post(self, request):
        matchup_id_str = request.data.get("matchupId")
        selected_song = request.data.get("selectedSong") or {}
        bracket_id = request.data.get("bracket_id")

        winner_apple_id = selected_song.get("song", {}).get("id") or selected_song.get(
            "id"
        )

        if not matchup_id_str or not winner_apple_id:
            return Response(
                {"error": "matchupId and selectedSong.song.id are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            if bracket_id:
                winner_item = BracketItem.objects.get(
                    bracket_id=bracket_id,
                    apple_id=str(winner_apple_id),
                )
            else:
                winner_item = BracketItem.objects.filter(
                    apple_id=str(winner_apple_id)
                ).first()
                if not winner_item:
                    raise BracketItem.DoesNotExist
        except BracketItem.DoesNotExist:
            return Response(
                {"error": "Winning song not found in bracket"},
                status=status.HTTP_404_NOT_FOUND,
            )

        bracket = winner_item.bracket
        matchup = BracketService.find_matchup_by_matchup_id(bracket, matchup_id_str)
        if not matchup:
            # Fallback: open matchup that includes this item
            matchup = (
                Matchup.objects.filter(bracket=bracket, winner__isnull=True)
                .filter(Q(item1=winner_item) | Q(item2=winner_item))
                .first()
            )

        if not matchup:
            return Response(
                {"error": "Matchup not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            updated = BracketService.advance_winner(matchup.id, winner_item.id)
        except Exception as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        songs = BracketService.get_songs_for_bracket(bracket)
        structured = BracketService.get_structured_bracket(bracket, songs)

        return Response(
            {
                "message": "Success",
                "bracket_id": bracket.id,
                "matchup": MatchupSerializer(updated).data,
                "bracket": structured,
            },
            status=status.HTTP_200_OK,
        )
