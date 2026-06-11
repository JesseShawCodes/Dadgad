from django.test import TestCase
from rest_framework.test import APIClient

class BracketViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_bracket_create_from_artist_mock(self):
        response = self.client.get("/api/brackets/artist/123456789")

        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data["artist_name"], str)
        self.assertIsInstance(response.data["artist_id"], int)
        self.assertEqual(len(response.data["top_songs_list"]), 0)
        self.assertEqual(len(response.data["matchups"]), 0)
