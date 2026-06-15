import os
import time
from unittest.mock import patch, MagicMock
from django.test import TestCase
from apple_search.auth import get_auth_token, get_newest_auth, apple_request, log_error
from apple_search.models import AppleAuth
import requests

class AppleAuthTests(TestCase):
    def setUp(self):
        # Clear any existing auth
        AppleAuth.objects.all().delete()
        if os.path.exists("error.log"):
            os.remove("error.log")

    @patch("apple_search.auth.os.environ.get")
    def test_get_auth_token_missing_credentials(self, mock_env_get):
        # Test case for lines 24-28
        mock_env_get.return_value = ""
        result = get_auth_token()
        self.assertIsNone(result)

    @patch("apple_search.auth.pyjwt.encode")
    @patch("apple_search.auth.os.environ.get")
    def test_get_auth_token_success(self, mock_env_get, mock_jwt_encode):
        mock_env_get.side_effect = lambda key, default="": {
            "apple_auth_key": "private_key",
            "apple_key_id": "key_id",
            "apple_team_id": "team_id"
        }.get(key, default)
        mock_jwt_encode.return_value = "fake_token"
        
        token = get_auth_token()
        self.assertEqual(token, "fake_token")
        self.assertEqual(AppleAuth.objects.count(), 1)
        self.assertEqual(AppleAuth.objects.first().auth, "fake_token")

    @patch("apple_search.auth.pyjwt.encode")
    @patch("apple_search.auth.os.environ.get")
    def test_get_auth_token_encoding_failure(self, mock_env_get, mock_jwt_encode):
        # Test case for lines 44-46
        mock_env_get.side_effect = lambda key, default="": {
            "apple_auth_key": "private_key",
            "apple_key_id": "key_id",
            "apple_team_id": "team_id"
        }.get(key, default)
        mock_jwt_encode.side_effect = Exception("JWT Error")
        
        token = get_auth_token()
        self.assertIsNone(token)
        self.assertTrue(os.path.exists("error.log"))

    def test_get_newest_auth(self):
        self.assertEqual(get_newest_auth(), "")
        AppleAuth.objects.create(auth="token1")
        # Ensure we have different timestamps if needed, though order_by("-created") usually works fine in tests
        AppleAuth.objects.create(auth="token2")
        self.assertEqual(get_newest_auth(), "token2")

    @patch("apple_search.auth.requests.get")
    @patch("apple_search.auth.get_newest_auth")
    def test_apple_request_success(self, mock_get_newest, mock_get):
        # Test case for line 76
        mock_get_newest.return_value = "token123"
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"data": "ok"}
        mock_get.return_value = mock_resp
        
        result = apple_request("endpoint")
        self.assertEqual(result, {"data": "ok"})

    @patch("apple_search.auth.get_auth_token")
    @patch("apple_search.auth.requests.get")
    @patch("apple_search.auth.get_newest_auth")
    def test_apple_request_expired_token(self, mock_get_newest, mock_get, mock_get_token):
        # Test case for lines 69-70
        mock_get_newest.return_value = "expired"
        mock_get_token.return_value = "new_token"
        
        mock_resp_401 = MagicMock()
        mock_resp_401.status_code = 401
        
        mock_resp_200 = MagicMock()
        mock_resp_200.status_code = 200
        mock_resp_200.json.return_value = {"data": "ok"}
        
        mock_get.side_effect = [mock_resp_401, mock_resp_200]
        
        result = apple_request("endpoint")
        self.assertEqual(result, {"data": "ok"})
        self.assertEqual(mock_get.call_count, 2)

    @patch("apple_search.auth.requests.get")
    def test_apple_request_404(self, mock_get):
        mock_resp = MagicMock()
        mock_resp.status_code = 404
        mock_get.return_value = mock_resp
        
        result = apple_request("endpoint")
        self.assertEqual(result, {})

    @patch("apple_search.auth.requests.get")
    def test_apple_request_exception(self, mock_get):
        # Test case for line 78 (log_error) and 79
        mock_get.side_effect = Exception("Network Error")
        
        result = apple_request("endpoint", default={"fallback": True})
        self.assertEqual(result, {"fallback": True})
        self.assertTrue(os.path.exists("error.log"))

    def test_log_error(self):
        log_error("Test message")
        self.assertTrue(os.path.exists("error.log"))
        with open("error.log", "r") as f:
            content = f.read()
            self.assertIn("Test message", content)
