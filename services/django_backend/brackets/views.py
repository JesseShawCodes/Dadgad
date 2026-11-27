from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer

from madness_backend.api_errors import error_response
from .exceptions import ArtistNotFound, BracketError
from .models import Bracket, BracketItem
from .serializers import BracketSerializer, MatchupSerializer
from .services import BracketService


class BracketCreateFromArtistView(APIView):
    renderer_classes = [JSONRenderer]

    def get(self, request, artist_name):
        force_new = request.query_params.get("new", "").lower() in (
            "1",
            "true",
            "yes",
        )
        try:
            payload = BracketService.build_artist_bracket_payload(
                artist_name,
                force_new=force_new,
            )
        except ArtistNotFound as exc:
            return error_response(
                str(exc),
                status.HTTP_404_NOT_FOUND,
                code=exc.code,
            )

        matchups = payload.pop("matchups")
        payload["matchups"] = MatchupSerializer(matchups, many=True).data
        return Response(payload, status=status.HTTP_200_OK)


class BracketDetailView(APIView):
    renderer_classes = [JSONRenderer]

    def get(self, request, pk):
        try:
            bracket = Bracket.objects.prefetch_related(
                "items",
                "matchups__item1",
                "matchups__item2",
                "matchups__winner",
            ).get(pk=pk)
        except Bracket.DoesNotExist:
            return error_response(
                "Bracket not found",
                status.HTTP_404_NOT_FOUND,
                code="bracket_not_found",
            )

        serializer = BracketSerializer(bracket)
        songs = BracketService.get_songs_for_bracket(bracket)
        data = serializer.data
        data["bracket"] = BracketService.get_structured_bracket(bracket, songs)
        data["championship"] = BracketService.get_championship_rounds(
            bracket, songs
        )
        data["champion"] = BracketService.get_champion(bracket)
        return Response(data)


class MatchupWinnerView(APIView):
    renderer_classes = [JSONRenderer]

    def post(self, request, pk):
        winner_id = request.data.get("winner_id")
        if not winner_id:
            return error_response(
                "winner_id is required",
                status.HTTP_400_BAD_REQUEST,
                code="validation_error",
            )

        try:
            matchup = BracketService.advance_winner(pk, winner_id)
        except BracketError as exc:
            return error_response(
                str(exc),
                status.HTTP_400_BAD_REQUEST,
                code=exc.code,
            )
        except Exception as exc:
            return error_response(str(exc), status.HTTP_400_BAD_REQUEST)

        serializer = MatchupSerializer(matchup)
        return Response(serializer.data)


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
            return error_response(
                "matchupId and selectedSong.song.id are required",
                status.HTTP_400_BAD_REQUEST,
                code="validation_error",
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
                ).order_by("-bracket_id").first()
                if not winner_item:
                    raise BracketItem.DoesNotExist
        except BracketItem.DoesNotExist:
            return error_response(
                "Winning song not found in bracket",
                status.HTTP_404_NOT_FOUND,
                code="song_not_found",
            )

        bracket = winner_item.bracket
        matchup = BracketService.resolve_matchup_for_pick(
            bracket, matchup_id_str, winner_item
        )
        if not matchup:
            return error_response(
                "Matchup not found",
                status.HTTP_404_NOT_FOUND,
                code="matchup_not_found",
            )

        try:
            updated = BracketService.advance_winner(matchup.id, winner_item.id)
        except BracketError as exc:
            return error_response(
                str(exc),
                status.HTTP_400_BAD_REQUEST,
                code=exc.code,
            )

        songs = BracketService.get_songs_for_bracket(bracket)
        structured = BracketService.get_structured_bracket(bracket, songs)
        bracket.refresh_from_db()

        return Response(
            {
                "message": "Success",
                "bracket_id": bracket.id,
                "matchup": MatchupSerializer(updated).data,
                "bracket": structured,
                "is_completed": bracket.is_completed,
                "champion": BracketService.get_champion(bracket),
                "championship": BracketService.get_championship_rounds(
                    bracket, songs
                ),
            },
            status=status.HTTP_200_OK,
        )
