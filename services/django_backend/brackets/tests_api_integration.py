"""
T041 — DRF APIClient integration tests for bracket endpoints.

Covers create/resume, select/advance, and full tournament completion
through the HTTP API surface (including select-matchup-winner).
"""

from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIClient

from .models import Bracket
from .services import BracketService
from .test_factories import make_songs


class BracketAPIIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.songs = make_songs(16)
        self.bracket = BracketService.create_bracket(
            "api-artist", "API Artist", self.songs
        )

    def _open_matchups(self):
        return list(
            self.bracket.matchups.filter(
                winner__isnull=True,
                item1__isnull=False,
                item2__isnull=False,
            ).order_by("round_number", "matchup_num")
        )

    def test_bracket_detail_includes_structure_and_championship(self):
        response = self.client.get(f"/api/brackets/{self.bracket.id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.bracket.id)
        self.assertIn("bracket", response.data)
        self.assertIn("championship", response.data)
        self.assertIn("champion", response.data)
        self.assertIsNone(response.data["champion"])
        self.assertFalse(response.data.get("is_completed", False))

    def test_matchup_winner_endpoint_advances_round(self):
        matchup = self._open_matchups()[0]
        response = self.client.post(
            f"/api/matchups/{matchup.id}/winner/",
            {"winner_id": matchup.item1_id},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["winner"]["id"], matchup.item1_id)

        matchup.refresh_from_db()
        self.assertEqual(matchup.winner_id, matchup.item1_id)
        if matchup.next_matchup_id:
            next_m = matchup.next_matchup
            next_m.refresh_from_db()
            slot_item = (
                next_m.item1_id if matchup.next_slot != 2 else next_m.item2_id
            )
            self.assertEqual(slot_item, matchup.item1_id)

    def test_select_matchup_winner_by_apple_id(self):
        matchup = self._open_matchups()[0]
        matchup_id = f"{matchup.item1.apple_id}{matchup.item2.apple_id}"
        response = self.client.post(
            "/api/brackets/select-matchup-winner/",
            {
                "bracket_id": self.bracket.id,
                "matchupId": matchup_id,
                "selectedSong": {"song": {"id": matchup.item1.apple_id}},
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "Success")
        self.assertEqual(response.data["bracket_id"], self.bracket.id)
        self.assertIn("bracket", response.data)
        self.assertIn("championship", response.data)
        self.assertFalse(response.data["is_completed"])

        matchup.refresh_from_db()
        self.assertEqual(matchup.winner.apple_id, matchup.item1.apple_id)

    def test_select_matchup_winner_validation_errors(self):
        response = self.client.post(
            "/api/brackets/select-matchup-winner/",
            {},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["code"], "validation_error")

        response = self.client.post(
            "/api/brackets/select-matchup-winner/",
            {
                "bracket_id": self.bracket.id,
                "matchupId": "nosuch",
                "selectedSong": {"song": {"id": "missing"}},
            },
            format="json",
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["code"], "song_not_found")

    def test_full_tournament_via_select_matchup_winner(self):
        """Play 16-song bracket to champion entirely through the pick API."""
        picks = 0
        while True:
            open_matchup = (
                self.bracket.matchups.filter(
                    winner__isnull=True,
                    item1__isnull=False,
                    item2__isnull=False,
                )
                .order_by("round_number", "matchup_num")
                .first()
            )
            if not open_matchup:
                break

            matchup_id = (
                f"{open_matchup.item1.apple_id}{open_matchup.item2.apple_id}"
            )
            response = self.client.post(
                "/api/brackets/select-matchup-winner/",
                {
                    "bracket_id": self.bracket.id,
                    "matchupId": matchup_id,
                    "selectedSong": {
                        "song": {"id": open_matchup.item1.apple_id}
                    },
                },
                format="json",
            )
            self.assertEqual(response.status_code, 200, response.data)
            picks += 1
            self.bracket.refresh_from_db()

        self.assertEqual(picks, 15)
        self.assertTrue(self.bracket.is_completed)

        detail = self.client.get(f"/api/brackets/{self.bracket.id}/")
        self.assertEqual(detail.status_code, 200)
        self.assertTrue(detail.data["is_completed"])
        self.assertIsNotNone(detail.data["champion"])
        self.assertEqual(
            detail.data["champion"]["id"],
            BracketService.get_champion(self.bracket)["id"],
        )

    def test_full_64_tournament_via_matchup_winner_api(self):
        """Highest-value API path: 64 → champion through /api/matchups/.../winner/."""
        songs = make_songs(64, prefix="big")
        bracket = BracketService.create_bracket("big-artist", "Big", songs)
        self.assertEqual(
            bracket.matchups.filter(round_number=1).count(), 32
        )

        while True:
            open_matchup = (
                bracket.matchups.filter(
                    winner__isnull=True,
                    item1__isnull=False,
                    item2__isnull=False,
                )
                .order_by("round_number", "matchup_num")
                .first()
            )
            if not open_matchup:
                break
            response = self.client.post(
                f"/api/matchups/{open_matchup.id}/winner/",
                {"winner_id": open_matchup.item1_id},
                format="json",
            )
            self.assertEqual(response.status_code, 200, response.data)

        bracket.refresh_from_db()
        self.assertTrue(bracket.is_completed)
        detail = self.client.get(f"/api/brackets/{bracket.id}/")
        self.assertTrue(detail.data["is_completed"])
        self.assertIsNotNone(detail.data["champion"])
        self.assertTrue(len(detail.data["championship"]) >= 1)


class BracketCreateResumeAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.songs = make_songs(8)

    @patch("apple_search.artist_page.get_artist_high_level_details")
    @patch("apple_search.artist_page.get_artist_id_by_name")
    @patch("apple_search.artist_page.top_songs_list_builder")
    @patch("apple_search.artist_page.featured_album_details")
    @patch("apple_search.artist_page.add_weight_to_songs")
    def test_create_resume_and_force_new(
        self,
        mock_weights,
        mock_albums,
        mock_songs,
        mock_get_id,
        mock_details,
    ):
        mock_get_id.return_value = "999"
        mock_songs.return_value = self.songs
        mock_albums.return_value = {"data": []}
        mock_weights.side_effect = lambda songs, albums: songs
        mock_details.return_value = {"name": "Resume Artist"}

        first = self.client.get("/api/brackets/artist/resume-artist")
        self.assertEqual(first.status_code, 200)
        self.assertEqual(first.data["artist_id"], "999")
        self.assertTrue(first.data["bracket_id"])
        round1 = [
            m
            for m in first.data["matchups"]
            if m.get("round_number") == 1
        ]
        self.assertEqual(len(round1), 4)

        second = self.client.get("/api/brackets/artist/resume-artist")
        self.assertEqual(second.data["bracket_id"], first.data["bracket_id"])

        forced = self.client.get("/api/brackets/artist/resume-artist?new=1")
        self.assertNotEqual(forced.data["bracket_id"], first.data["bracket_id"])
        self.assertEqual(Bracket.objects.filter(artist_id="999").count(), 2)
