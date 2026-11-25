from unittest.mock import patch
from django.test import TestCase
from rest_framework.test import APIClient
from .models import Bracket, BracketItem, Matchup
from .services import BracketService
from .exceptions import InvalidWinner, MatchupAlreadyComplete


class BracketViewTests(TestCase):
    """Test the bracket creation view"""

    def setUp(self):
        self.client = APIClient()

    def test_bracket_create_from_artist_mock(self):
        response = self.client.get("/api/brackets/artist/deftones")

        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data["artist_name"], str)
        self.assertIsInstance(response.data["artist_id"], str)
        self.assertGreaterEqual(len(response.data["top_songs_list"]), 0)
        self.assertGreaterEqual(len(response.data["matchups"]), 0)
        self.assertIn("is_completed", response.data)
        self.assertIn("championship", response.data)

    def test_bracket_detail_view_success(self):
        bracket = Bracket.objects.create(
            name="Test", artist_id="123", artist_name="Artist"
        )
        response = self.client.get(f"/api/brackets/{bracket.id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Test")
        self.assertIn("championship", response.data)

    def test_bracket_detail_view_not_found(self):
        response = self.client.get("/api/brackets/999/")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["error"], "Bracket not found")
        self.assertEqual(response.data["code"], "bracket_not_found")

    def test_matchup_winner_view_success(self):
        bracket = Bracket.objects.create(
            name="Test", artist_id="123", artist_name="Artist"
        )
        item1 = BracketItem.objects.create(
            bracket=bracket, name="Song 1", apple_id="s1", seed=1
        )
        item2 = BracketItem.objects.create(
            bracket=bracket, name="Song 2", apple_id="s2", seed=2
        )
        matchup = Matchup.objects.create(
            bracket=bracket,
            round_number=1,
            matchup_num=0,
            item1=item1,
            item2=item2,
        )

        response = self.client.post(
            f"/api/matchups/{matchup.id}/winner/",
            {"winner_id": item1.id},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["winner"]["id"], item1.id)

    def test_matchup_winner_view_missing_winner_id(self):
        response = self.client.post(
            "/api/matchups/1/winner/", {}, format="json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "winner_id is required")
        self.assertEqual(response.data["code"], "validation_error")

    def test_matchup_winner_view_error(self):
        bracket = Bracket.objects.create(
            name="Test", artist_id="123", artist_name="Artist"
        )
        item1 = BracketItem.objects.create(
            bracket=bracket, name="Song 1", apple_id="s1", seed=1
        )
        item2 = BracketItem.objects.create(
            bracket=bracket, name="Song 2", apple_id="s2", seed=2
        )
        matchup = Matchup.objects.create(
            bracket=bracket,
            round_number=1,
            matchup_num=0,
            item1=item1,
            item2=item2,
        )

        other_item = BracketItem.objects.create(
            bracket=bracket, name="Other", apple_id="o1", seed=3
        )
        response = self.client.post(
            f"/api/matchups/{matchup.id}/winner/",
            {"winner_id": other_item.id},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)
        self.assertEqual(response.data["code"], "invalid_winner")

    def test_matchup_winner_rejects_second_pick(self):
        bracket = Bracket.objects.create(
            name="Test", artist_id="123", artist_name="Artist"
        )
        item1 = BracketItem.objects.create(
            bracket=bracket, name="Song 1", apple_id="s1", seed=1
        )
        item2 = BracketItem.objects.create(
            bracket=bracket, name="Song 2", apple_id="s2", seed=2
        )
        matchup = Matchup.objects.create(
            bracket=bracket,
            round_number=1,
            matchup_num=0,
            item1=item1,
            item2=item2,
        )
        BracketService.advance_winner(matchup.id, item1.id)
        response = self.client.post(
            f"/api/matchups/{matchup.id}/winner/",
            {"winner_id": item2.id},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["code"], "matchup_already_complete")


class BracketServiceTests(TestCase):
    def setUp(self):
        self.artist_id = "12345"
        self.artist_name = "Test Artist"
        self.songs = [
            {
                "id": "s1",
                "attributes": {"name": "Song 1", "artwork": {"url": "url1"}},
            },
            {
                "id": "s2",
                "attributes": {"name": "Song 2", "artwork": {"url": "url2"}},
            },
            {
                "id": "s3",
                "attributes": {"name": "Song 3", "artwork": {"url": "url3"}},
            },
            {
                "id": "s4",
                "attributes": {"name": "Song 4", "artwork": {"url": "url4"}},
            },
        ]

    def test_create_bracket_new(self):
        """Test creating a new bracket when none exists"""
        self.assertEqual(Bracket.objects.count(), 0)
        bracket = BracketService.create_bracket(
            self.artist_id, self.artist_name, self.songs
        )
        self.assertEqual(Bracket.objects.count(), 1)
        self.assertEqual(bracket.artist_id, self.artist_id)
        self.assertEqual(bracket.name, f"{self.artist_name} Madness")

    def test_create_bracket_allows_multiple_per_artist(self):
        """Multiple tournaments can exist for the same artist."""
        bracket1 = BracketService.create_bracket(
            self.artist_id, self.artist_name, self.songs
        )
        bracket2 = BracketService.create_bracket(
            self.artist_id, "Different Name", self.songs
        )

        self.assertEqual(Bracket.objects.count(), 2)
        self.assertNotEqual(bracket1.id, bracket2.id)

    def test_get_or_create_reuses_incomplete(self):
        bracket1, created1 = BracketService.get_or_create_bracket(
            self.artist_id, self.artist_name, self.songs
        )
        bracket2, created2 = BracketService.get_or_create_bracket(
            self.artist_id, self.artist_name, self.songs
        )
        self.assertTrue(created1)
        self.assertFalse(created2)
        self.assertEqual(bracket1.id, bracket2.id)
        self.assertEqual(Bracket.objects.count(), 1)

    def test_get_or_create_force_new(self):
        bracket1, _ = BracketService.get_or_create_bracket(
            self.artist_id, self.artist_name, self.songs
        )
        bracket2, created = BracketService.get_or_create_bracket(
            self.artist_id, self.artist_name, self.songs, force_new=True
        )
        self.assertTrue(created)
        self.assertNotEqual(bracket1.id, bracket2.id)

    def test_advance_winner_transactional_validation(self):
        bracket = BracketService.create_bracket(
            self.artist_id, self.artist_name, self.songs
        )
        matchup = bracket.matchups.filter(round_number=1).first()
        with self.assertRaises(InvalidWinner):
            BracketService.advance_winner(matchup.id, 999999)

        other = BracketItem.objects.create(
            bracket=bracket, name="X", apple_id="sx", seed=99
        )
        with self.assertRaises(InvalidWinner):
            BracketService.advance_winner(matchup.id, other.id)

        BracketService.advance_winner(matchup.id, matchup.item1_id)
        with self.assertRaises(MatchupAlreadyComplete):
            BracketService.advance_winner(matchup.id, matchup.item2_id)

    def test_advance_winner_marks_champion(self):
        bracket = BracketService.create_bracket(
            self.artist_id, self.artist_name, self.songs
        )
        # Play through all matchups in order
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
            BracketService.advance_winner(open_matchup.id, open_matchup.item1_id)

        bracket.refresh_from_db()
        self.assertTrue(bracket.is_completed)
        champion = BracketService.get_champion(bracket)
        self.assertIsNotNone(champion)
        championship = BracketService.get_championship_rounds(bracket)
        self.assertTrue(len(championship) >= 1)

    def test_get_structured_bracket(self):
        """Test the structured bracket output format"""
        bracket = BracketService.create_bracket(
            self.artist_id, self.artist_name, self.songs
        )
        structured = BracketService.get_structured_bracket(
            bracket, self.songs
        )

        for i in range(1, 5):
            self.assertIn(f"group{i}", structured)

        self.assertIn("round1", structured["group1"])
        r1_m1 = structured["group1"]["round1"]["roundMatchups"][0]
        self.assertEqual(r1_m1["matchupId"], "s1s4")
        self.assertEqual(r1_m1["attributes"]["song1"]["song"]["id"], "s1")
        self.assertIsNone(r1_m1["attributes"]["song1"]["winner"])


class BracketCreatePayloadTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch("apple_search.artist_page.get_artist_id_by_name")
    @patch("apple_search.artist_page.top_songs_list_builder")
    @patch("apple_search.artist_page.featured_album_details")
    @patch("apple_search.artist_page.add_weight_to_songs")
    def test_bracket_create_builds_payload(
        self,
        mock_weights,
        mock_albums,
        mock_songs,
        mock_get_id,
    ):
        mock_get_id.return_value = "12345"
        mock_songs.return_value = [
            {
                "id": "s1",
                "attributes": {"name": "Song 1", "artwork": {"url": "u"}},
            },
            {
                "id": "s2",
                "attributes": {"name": "Song 2", "artwork": {"url": "u"}},
            },
            {
                "id": "s3",
                "attributes": {"name": "Song 3", "artwork": {"url": "u"}},
            },
            {
                "id": "s4",
                "attributes": {"name": "Song 4", "artwork": {"url": "u"}},
            },
        ]
        mock_albums.return_value = {"data": []}
        mock_weights.side_effect = lambda songs, albums: songs

        response = self.client.get("/api/brackets/artist/test-artist")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["artist_id"], "12345")
        self.assertTrue(response.data["bracket_id"])
        self.assertIn("championship", response.data)

        # Second GET reuses incomplete bracket
        first_id = response.data["bracket_id"]
        response2 = self.client.get("/api/brackets/artist/test-artist")
        self.assertEqual(response2.data["bracket_id"], first_id)

        # ?new=1 creates another
        response3 = self.client.get("/api/brackets/artist/test-artist?new=1")
        self.assertNotEqual(response3.data["bracket_id"], first_id)
        self.assertEqual(Bracket.objects.filter(artist_id="12345").count(), 2)

    @patch("apple_search.artist_page.get_artist_id_by_name")
    def test_bracket_create_artist_not_found(self, mock_get_id):
        mock_get_id.return_value = None
        response = self.client.get("/api/brackets/artist/missing")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["code"], "artist_not_found")
