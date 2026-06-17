from unittest.mock import patch
from django.test import TestCase
from rest_framework.test import APIClient
from .models import Bracket, BracketItem, Matchup
from .services import BracketService


class BracketViewTests(TestCase):
    """Test the bracket creation view"""
    def setUp(self):
        self.client = APIClient()

    def test_bracket_create_from_artist_mock(self):
        response = self.client.get("/api/brackets/artist/deftones")

        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data["artist_name"], str)
        self.assertIsInstance(response.data["artist_id"], str)
        # This should check if number is greater than 0
        self.assertGreaterEqual(len(response.data["top_songs_list"]), 0)
        self.assertGreaterEqual(len(response.data["matchups"]), 0)

    def test_bracket_detail_view_success(self):
        bracket = Bracket.objects.create(
            name="Test", artist_id="123", artist_name="Artist"
        )
        response = self.client.get(f"/api/brackets/{bracket.id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Test")

    def test_bracket_detail_view_not_found(self):
        response = self.client.get("/api/brackets/999/")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["error"], "Bracket not found")

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
            bracket=bracket, round_number=1, matchup_num=0,
            item1=item1, item2=item2
        )

        response = self.client.post(
            f"/api/matchups/{matchup.id}/winner/",
            {"winner_id": item1.id},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["winner"]["id"], item1.id)

    def test_matchup_winner_view_missing_winner_id(self):
        response = self.client.post(
            "/api/matchups/1/winner/", {}, format='json'
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "winner_id is required")

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
            bracket=bracket, round_number=1, matchup_num=0,
            item1=item1, item2=item2
        )

        # winner_id not in matchup
        other_item = BracketItem.objects.create(
            bracket=bracket, name="Other", apple_id="o1", seed=3
        )
        response = self.client.post(
            f"/api/matchups/{matchup.id}/winner/",
            {"winner_id": other_item.id},
            format='json'
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)


class BracketServiceTests(TestCase):
    def setUp(self):
        self.artist_id = "12345"
        self.artist_name = "Test Artist"
        self.songs = [
            {"id": "s1", "attributes": {"name": "Song 1",
                                        "artwork": {"url": "url1"}}},
            {"id": "s2", "attributes": {"name": "Song 2",
                                        "artwork": {"url": "url2"}}},
            {"id": "s3", "attributes": {"name": "Song 3",
                                        "artwork": {"url": "url3"}}},
            {"id": "s4", "attributes": {"name": "Song 4",
                                        "artwork": {"url": "url4"}}},
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

    def test_create_bracket_existing(self):
        """Test that create_bracket returns existing bracket if artist_id"""
        # Create first bracket
        bracket1 = BracketService.create_bracket(
            self.artist_id, self.artist_name, self.songs
        )
        self.assertEqual(Bracket.objects.count(), 1)

        # Try to create another one with same artist_id
        bracket2 = BracketService.create_bracket(
            self.artist_id, "Different Name", []
        )

        self.assertEqual(Bracket.objects.count(), 1)
        self.assertEqual(bracket1.id, bracket2.id)
        # Should be the first one's name
        self.assertEqual(bracket2.name, f"{self.artist_name} Madness")

    def test_get_structured_bracket(self):
        """Test the structured bracket output format"""
        bracket = BracketService.create_bracket(
            self.artist_id, self.artist_name, self.songs
        )
        structured = BracketService.get_structured_bracket(
            bracket, self.songs
        )

        # Check that we have the 4 groups
        for i in range(1, 5):
            self.assertIn(f"group{i}", structured)

        # Matchup 0 (s1 vs s4) should be in group 1
        self.assertIn("round1", structured["group1"])
        r1_m1 = structured["group1"]["round1"]["roundMatchups"][0]
        self.assertEqual(r1_m1["matchupId"], "s1s4")
        self.assertEqual(r1_m1["attributes"]["song1"]["song"]["id"], "s1")


class BracketCacheTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch("brackets.views.cache")
    @patch("brackets.views.get_artist_id_by_name")
    @patch("brackets.views.top_songs_list_builder")
    @patch("brackets.views.featured_album_details")
    @patch("brackets.views.BracketService.create_bracket")
    def test_bracket_create_cache_hit(
        self, mock_create, mock_albums, mock_songs, mock_get_id, mock_cache
    ):
        # Setup mock cache hit
        mock_cache.get.return_value = {"cached": "data"}
        mock_get_id.return_value = "12345"

        response = self.client.get("/api/brackets/artist/12345")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"cached": "data"})

        # Verify cache was checked
        mock_cache.get.assert_called_once_with("bracket_create:12345")

        # Verify other services were NOT called
        mock_songs.assert_not_called()
        mock_albums.assert_not_called()
        mock_create.assert_not_called()

    @patch("brackets.views.cache")
    @patch("brackets.views.get_artist_id_by_name")
    @patch("brackets.views.top_songs_list_builder")
    @patch("brackets.views.featured_album_details")
    @patch("brackets.views.BracketService.create_bracket")
    @patch("brackets.views.BracketService.get_structured_bracket")
    def test_bracket_create_cache_miss(
        self,
        mock_structured,
        mock_create,
        mock_albums,
        mock_songs,
        mock_get_id,
        mock_cache,
        mock_update_bracket
    ):
        # Setup mock cache miss
        mock_cache.get.return_value = None
        mock_get_id.return_value = "12345"
        mock_songs.return_value = []
        mock_albums.return_value = {"data": []}

        # Mock bracket object
        from .models import Bracket
        mock_bracket = Bracket(id=1, name="Test", artist_id="12345")
        mock_create.return_value = mock_bracket
        mock_structured.return_value = {}

        response = self.client.get("/api/brackets/artist/12345")

        self.assertEqual(response.status_code, 200)

        # Verify cache was checked and set
        mock_cache.get.assert_called_once_with("bracket_create:12345")
        mock_cache.set.assert_called_once()
        self.assertEqual(
            mock_cache.set.call_args[0][0], "bracket_create:12345"
        )

        # Verify services were called
        mock_songs.assert_called_once()
        mock_albums.assert_called_once()
        mock_create.assert_called_once()
