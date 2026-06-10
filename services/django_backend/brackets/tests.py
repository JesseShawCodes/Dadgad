from django.test import TestCase
from rest_framework.test import APIClient


class BracketLogicTest(TestCase):
    def test_seeding_logic(self):
        # Placeholder for seeding logic test
        pass


class BracketViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_bracket_create_from_artist_mock(self):
        response = self.client.get("/api/brackets/from-artist/Deftones/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["artist_name"], "Deftones")
        self.assertEqual(response.data["artist_id"], "mock_id_123")
        self.assertEqual(len(response.data["top_songs_list"]), 64)
        self.assertEqual(len(response.data["matchups"]), 32)
