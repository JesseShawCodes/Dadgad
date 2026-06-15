from django.test import TestCase
from rest_framework.test import APIClient
from .models import Bracket
from .services import BracketService


class BracketViewTests(TestCase):
    """Test the bracket creation view"""
    def setUp(self):
        self.client = APIClient()

    def test_bracket_create_from_artist_mock(self):
        response = self.client.get("/api/brackets/artist/123456789")

        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data["artist_name"], str)
        self.assertIsInstance(response.data["artist_id"], int)
        self.assertEqual(len(response.data["top_songs_list"]), 0)
        self.assertEqual(len(response.data["matchups"]), 0)


class BracketServiceTests(TestCase):
    def setUp(self):
        self.artist_id = "12345"
        self.artist_name = "Test Artist"
        self.songs = [
            {"id": "s1", "attributes": {"name": "Song 1", "artwork": {"url": "url1"}}},
            {"id": "s2", "attributes": {"name": "Song 2", "artwork": {"url": "url2"}}},
            {"id": "s3", "attributes": {"name": "Song 3", "artwork": {"url": "url3"}}},
            {"id": "s4", "attributes": {"name": "Song 4", "artwork": {"url": "url4"}}},
        ]

    def test_create_bracket_new(self):
        """Test creating a new bracket when none exists"""
        self.assertEqual(Bracket.objects.count(), 0)
        bracket = BracketService.create_bracket(self.artist_id, self.artist_name, self.songs)
        self.assertEqual(Bracket.objects.count(), 1)
        self.assertEqual(bracket.artist_id, self.artist_id)
        self.assertEqual(bracket.name, f"{self.artist_name} Madness")

    def test_create_bracket_existing(self):
        """Test that create_bracket returns existing bracket if artist_id matches"""
        # Create first bracket
        bracket1 = BracketService.create_bracket(self.artist_id, self.artist_name, self.songs)
        self.assertEqual(Bracket.objects.count(), 1)
        
        # Try to create another one with same artist_id
        bracket2 = BracketService.create_bracket(self.artist_id, "Different Name", [])
        
        self.assertEqual(Bracket.objects.count(), 1)
        self.assertEqual(bracket1.id, bracket2.id)
        self.assertEqual(bracket2.name, f"{self.artist_name} Madness") # Should be the first one's name
