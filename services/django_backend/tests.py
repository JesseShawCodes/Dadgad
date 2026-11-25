"""Django Backend Tests"""

from unittest.mock import patch

from django.test import TestCase, Client
from apple_search.auth import get_auth_token, get_newest_auth


class BaseTestCase(TestCase):
    @classmethod
    def tearDownClass(cls):
        from django.db import connections

        for connection in connections.all():
            connection.close()
        super().tearDownClass()


class AuthTest(BaseTestCase):
    """Authorization Tests"""

    def setUp(self):
        get_auth_token()

    def test_add_auth(self):
        """Auth Token can be retrieved from API"""
        self.assertIsInstance(get_auth_token(), str)

    def test_newest_auth(self):
        """Newest Auth is obtained"""
        self.assertIsInstance(get_newest_auth(), str)


class ArtistSearch(BaseTestCase):
    """Artist Search Tests"""

    def setUp(self):
        get_auth_token()
        self.client = Client()

    @patch("apple_search.views.fetch_artist_data.delay")
    def test_artist_search_view(self, mock_delay):
        """Artist Search Page Test. Should return JSON"""
        mock_delay.return_value.id = "task-123"
        response = self.client.get("/artist?q=deftones")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["Content-Type"], "application/json")
        self.assertEqual(
            response.json(),
            {"task_id": "task-123", "status": "queued"},
        )

    @patch("apple_search.views.artist_content")
    @patch("apple_search.views.get_artist_id_by_name")
    def test_artist_page_view(self, mock_get_id, mock_content):
        """Artist Page Test. Should return JSON"""
        mock_get_id.return_value = "1092903"
        mock_content.return_value = {
            "artist_name": "Deftones",
            "artist_id": 1092903,
        }
        response = self.client.get("/artist-page/1092903")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["Content-Type"], "application/json")
        self.assertEqual(response.json()["artist_id"], 1092903)

    @patch("apple_search.views.get_artist_id_by_name")
    def test_artist_page_view_not_found(self, mock_get_id):
        """Missing artists return 404 with the standard error shape."""
        mock_get_id.return_value = None
        response = self.client.get("/artist-page/unknown-artist")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.headers["Content-Type"], "application/json")
        self.assertEqual(
            response.json(),
            {"error": "Artist not found", "code": "artist_not_found"},
        )
