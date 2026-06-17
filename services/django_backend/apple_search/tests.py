from django.test import TestCase, Client
from unittest.mock import patch, MagicMock
from django.core.cache import cache
from django.urls import reverse
import requests
from apple_search.artist_page import (
    artist_content,
    get_artist_high_level_details,
    dedupe_songs,
    check_substrings,
    top_songs_list_builder,
    featured_album_details,
    add_weight_to_songs,
)
from apple_search.artist_search import artist_search, format_image


class ArtistSearchTests(TestCase):
    @patch("apple_search.artist_search.get_newest_auth")
    @patch("apple_search.artist_search.requests.get")
    @patch("apple_search.artist_search.os.environ")
    def test_artist_search_success(
        self, mock_environ, mock_get, mock_get_newest_auth
    ):
        mock_get_newest_auth.return_value = "token123"
        mock_environ.__getitem__.side_effect = lambda key: (
            "http://api.apple.com/" if key == "apple_search_url" else key
        )

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "results": {
                "artists": {
                    "data": [
                        {
                            "attributes": {
                                "artwork": {
                                    "url": "http://example.com/{w}x{h}.jpg"
                                }
                            }
                        }
                    ]
                }
            }
        }
        mock_get.return_value = mock_response

        result = artist_search("Deftones")

        self.assertEqual(
            result["results"]["artists"]["data"][0]["attributes"]["artwork"][
                "url"
            ],
            "http://example.com/400x400.jpg",
        )
        mock_get.assert_called_once()

    @patch("apple_search.artist_search.get_auth_token")
    @patch("apple_search.artist_search.get_newest_auth")
    @patch("apple_search.artist_search.requests.get")
    @patch("apple_search.artist_search.os.environ")
    def test_artist_search_retry_on_error(
        self, mock_environ, mock_get, mock_get_newest_auth, mock_get_auth_token
    ):
        mock_get_newest_auth.return_value = "expired_token"
        mock_get_auth_token.return_value = "new_token"
        mock_environ.__getitem__.side_effect = lambda key: (
            "http://api.apple.com/" if key == "apple_search_url" else key
        )

        mock_response_fail = MagicMock()
        mock_response_fail.status_code = 401

        mock_response_success = MagicMock()
        mock_response_success.status_code = 200
        mock_response_success.json.return_value = {
            "results": {"artists": {"data": []}}
        }

        mock_get.side_effect = [mock_response_fail, mock_response_success]

        result = artist_search("Deftones")

        self.assertEqual(mock_get.call_count, 2)
        self.assertEqual(result, {"results": {"artists": {"data": []}}})

    @patch("apple_search.artist_search.get_auth_token")
    @patch("apple_search.artist_search.get_newest_auth")
    @patch("apple_search.artist_search.requests.get")
    @patch("apple_search.artist_search.os.environ")
    def test_artist_search_retry_fails_no_token(
        self, mock_environ, mock_get, mock_get_newest_auth, mock_get_auth_token
    ):
        mock_get_newest_auth.return_value = "expired_token"
        mock_get_auth_token.return_value = None
        mock_environ.__getitem__.side_effect = lambda key: (
            "http://api.apple.com/" if key == "apple_search_url" else key
        )

        mock_response_fail = MagicMock()
        mock_response_fail.status_code = 401
        mock_get.return_value = mock_response_fail

        result = artist_search("Deftones")

        self.assertEqual(result, {})
        self.assertEqual(mock_get.call_count, 1)

    @patch("apple_search.artist_search.get_newest_auth")
    @patch("apple_search.artist_search.requests.get")
    @patch("apple_search.artist_search.os.environ")
    def test_artist_search_json_decode_error(
        self, mock_environ, mock_get, mock_get_newest_auth
    ):
        mock_get_newest_auth.return_value = "token123"
        mock_environ.__getitem__.side_effect = lambda key: (
            "http://api.apple.com/" if key == "apple_search_url" else key
        )

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.side_effect = requests.exceptions.JSONDecodeError(
            "msg", "doc", 0
        )
        mock_get.return_value = mock_response

        result = artist_search("Deftones")
        self.assertEqual(result, {})

    def test_format_image(self):
        url = "http://example.com/{w}x{h}.jpg"
        self.assertEqual(format_image(url), "http://example.com/400x400.jpg")

    @patch("apple_search.artist_search.get_newest_auth")
    @patch("apple_search.artist_search.requests.get")
    @patch("apple_search.artist_search.os.environ")
    def test_artist_search_missing_fields(
        self, mock_environ, mock_get, mock_get_newest_auth
    ):
        mock_get_newest_auth.return_value = "token123"
        mock_environ.__getitem__.side_effect = lambda key: (
            "http://api.apple.com/" if key == "apple_search_url" else key
        )

        # Missing results
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {}
        mock_get.return_value = mock_response
        self.assertEqual(artist_search("Deftones"), {})

        # Missing artists
        mock_response.json.return_value = {"results": {}}
        self.assertEqual(artist_search("Deftones"), {"results": {}})

        # Missing data
        mock_response.json.return_value = {"results": {"artists": {}}}
        self.assertEqual(
            artist_search("Deftones"), {"results": {"artists": {}}}
        )

        # Missing artwork
        mock_response.json.return_value = {
            "results": {"artists": {"data": [{"attributes": {}}]}}
        }
        result = artist_search("Deftones")
        self.assertEqual(
            result["results"]["artists"]["data"][0]["attributes"], {}
        )


class ArtistPageTests(TestCase):
    def setUp(self):
        # Clear cache before each test
        cache.clear()

    @patch("apple_search.artist_page.apple_request")
    def test_get_artist_high_level_details_success(self, mock_apple_request):
        mock_apple_request.return_value = {
            "data": [
                {
                    "id": "12345",
                    "attributes": {
                        "name": "Test Artist",
                        "artwork": {"url": "http://example.com/image.jpg"},
                    },
                }
            ]
        }
        result = get_artist_high_level_details("12345")
        self.assertEqual(
            result,
            {
                "name": "Test Artist",
                "image_url": "http://example.com/image.jpg",
                "artist_id": "12345",
            },
        )
        mock_apple_request.assert_called_once_with("artists/12345")

    @patch("apple_search.artist_page.apple_request")
    def test_get_artist_high_level_details_no_data(self, mock_apple_request):
        mock_apple_request.return_value = None
        result = get_artist_high_level_details("12345")
        self.assertEqual(result, {})

        mock_apple_request.return_value = {"data": []}
        result = get_artist_high_level_details("12345")
        self.assertEqual(result, {})

    @patch("apple_search.artist_page.apple_request")
    def test_get_artist_high_level_details_missing_keys(
        self, mock_apple_request
    ):
        # Missing attributes
        mock_apple_request.return_value = {"data": [{"id": "12345"}]}
        result = get_artist_high_level_details("12345")
        self.assertEqual(result, {})

        # Missing name
        mock_apple_request.return_value = {
            "data": [
                {
                    "id": "12345",
                    "attributes": {
                        "artwork": {"url": "http://example.com/image.jpg"}
                    },
                }
            ]
        }
        result = get_artist_high_level_details("12345")
        self.assertEqual(result, {})

        # Missing artwork
        mock_apple_request.return_value = {
            "data": [{"id": "12345", "attributes": {"name": "Test Artist"}}]
        }
        result = get_artist_high_level_details("12345")
        self.assertEqual(result, {})

        # Missing artwork url
        mock_apple_request.return_value = {
            "data": [
                {
                    "id": "12345",
                    "attributes": {"name": "Test Artist", "artwork": {}},
                }
            ]
        }
        result = get_artist_high_level_details("12345")
        self.assertEqual(result, {})

        # Missing id
        mock_apple_request.return_value = {
            "data": [
                {
                    "attributes": {
                        "name": "Test Artist",
                        "artwork": {"url": "http://example.com/image.jpg"},
                    }
                }
            ]
        }
        result = get_artist_high_level_details("12345")
        self.assertEqual(result, {})

    def test_dedupe_songs(self):
        songs = [
            {"id": "1", "type": "songs"},
            {"id": "2", "type": "songs"},
            {"id": "1", "type": "songs"},  # Duplicate
            {"id": "3", "type": "music-videos"},  # Should be filtered out
            {"id": "4", "type": "songs"},
            {"id": "5"},  # Missing type, should be kept if not a duplicate
        ]
        expected = [
            {"id": "1", "type": "songs"},
            {"id": "2", "type": "songs"},
            {"id": "4", "type": "songs"},
            {"id": "5"},
        ]
        result = dedupe_songs(songs)
        self.assertEqual(result, expected)

        # Test with empty list
        self.assertEqual(dedupe_songs([]), [])

        # Test with songs having no id
        # (these are filtered out by the current logic)
        songs_no_id = [
            {"type": "songs", "title": "Song A"},
            {"type": "songs", "title": "Song B"},
        ]
        self.assertEqual(
            dedupe_songs(songs_no_id), []
        )  # Corrected expectation

    def test_check_substrings(self):
        self.assertTrue(
            check_substrings("Artist Essentials Playlist", ["Essentials"])
        )
        self.assertTrue(
            check_substrings(
                "Deep Cuts Collection", ["Essentials", "Deep Cuts"]
            )
        )
        self.assertFalse(
            check_substrings("Top Hits", ["Essentials", "Deep Cuts"])
        )
        self.assertFalse(check_substrings("Any String", []))
        self.assertFalse(check_substrings("", ["Essentials"]))

    @patch("apple_search.artist_page.apple_request")
    @patch("apple_search.artist_page.dedupe_songs", side_effect=dedupe_songs)
    def test_top_songs_list_builder_success(
        self, mock_dedupe_songs, mock_apple_request
    ):
        mock_apple_request.side_effect = [
            # First call for playlists
            {
                "data": [
                    {
                        "id": "playlist1",
                        "attributes": {"name": "Artist Essentials"},
                    },
                    {
                        "id": "playlist2",
                        "attributes": {"name": "Other Playlist"},
                    },
                    {"id": "playlist3", "attributes": {"name": "Deep Cuts"}},
                ]
            },
            # Second call for playlists content
            {
                "data": [
                    {
                        "relationships": {
                            "tracks": {
                                "data": [
                                    {"id": "s1", "type": "songs"},
                                    {"id": "s2", "type": "songs"},
                                ]
                            }
                        }
                    },
                    {
                        "relationships": {
                            "tracks": {"data": [{"id": "s3", "type": "songs"}]}
                        }
                    },
                ]
            },
            # Calls for top-songs offset=0
            {
                "data": [
                    {"id": "ts1", "type": "songs"},
                    {"id": "ts2", "type": "songs"},
                ]
            },
            # Calls for top-songs offset=10
            {"data": [{"id": "ts3", "type": "songs"}]},
            # Subsequent calls should return empty data to stop the loop
            # (8 more for a total of 12)
            {"data": []},
            {"data": []},
            {"data": []},
            {"data": []},
            {"data": []},
            {"data": []},
            {"data": []},
            {"data": []},
        ]
        result = top_songs_list_builder("artist1")
        expected_songs = [
            {"id": "s1", "type": "songs"},
            {"id": "s2", "type": "songs"},
            {"id": "s3", "type": "songs"},
            {"id": "ts1", "type": "songs"},
            {"id": "ts2", "type": "songs"},
            {"id": "ts3", "type": "songs"},
        ]
        self.assertEqual(len(result), len(expected_songs))
        self.assertIn({"id": "s1", "type": "songs"}, result)
        self.assertIn({"id": "ts3", "type": "songs"}, result)
        self.assertEqual(mock_dedupe_songs.call_count, 1)

    @patch("apple_search.artist_page.apple_request")
    def test_top_songs_list_builder_no_playlists_or_songs(
        self, mock_apple_request
    ):
        mock_apple_request.side_effect = [
            {"data": []},  # No playlists
            {"data": []},  # Call for playlists?ids= (even if empty)
            {"data": []},
            {"data": []},
            {"data": []},
            {"data": []},
            {"data": []},  # Top songs calls
            {"data": []},
            {"data": []},
            {"data": []},
            {"data": []},
            {"data": []},  # More top songs calls (total 10 for loop)
        ]
        result = top_songs_list_builder("artist1")
        self.assertEqual(result, [])

    @patch("apple_search.artist_page.apple_request")
    def test_top_songs_list_builder_playlist_errors(self, mock_apple_request):
        mock_apple_request.side_effect = [
            {"errors": ["error"]},  # Playlists error
            {"data": []},  # Call for playlists?ids= (even if error)
            {"data": []},
            {"data": []},
            {"data": []},
            {"data": []},
            {"data": []},  # Top songs calls
            {"data": []},
            {"data": []},
            {"data": []},
            {"data": []},
            {"data": []},  # More top songs calls (total 10 for loop)
        ]
        result = top_songs_list_builder("artist1")
        self.assertEqual(result, [])

    @patch("apple_search.artist_page.apple_request")
    def test_top_songs_list_builder_no_tracks_in_playlist(
        self, mock_apple_request
    ):
        mock_apple_request.side_effect = [
            {
                "data": [
                    {
                        "id": "playlist1",
                        "attributes": {"name": "Artist Essentials"},
                    }
                ]
            },
            {
                "data": [{"relationships": {"tracks": {"data": []}}}]
            },  # Empty tracks
            {"data": []},
            {"data": []},
            {"data": []},
            {"data": []},
            {"data": []},  # Top songs calls
            {"data": []},
            {"data": []},
            {"data": []},
            {"data": []},
            {"data": []},  # More top songs calls (total 10 for loop)
        ]
        result = top_songs_list_builder("artist1")
        self.assertEqual(result, [])

    @patch("apple_search.artist_page.apple_request")
    def test_featured_album_details_success(self, mock_apple_request):
        mock_apple_request.return_value = {
            "data": [{"type": "albums", "id": "a1"}]
        }
        result = featured_album_details("artist1")
        self.assertEqual(result, {"data": [{"type": "albums", "id": "a1"}]})
        mock_apple_request.assert_called_once_with(
            "artists/artist1/view/featured-albums"
        )

    @patch("apple_search.artist_page.apple_request")
    def test_featured_album_details_no_data(self, mock_apple_request):
        mock_apple_request.return_value = None
        result = featured_album_details("artist1")
        self.assertIsNone(result)

        mock_apple_request.return_value = {"data": []}
        result = featured_album_details("artist1")
        self.assertEqual(result, {"data": []})

    def test_add_weight_to_songs(self):
        songs = [
            {"attributes": {"albumName": "Album A"}},
            {"attributes": {"albumName": "Album B"}},
            {"attributes": {"albumName": "Album C"}},
            {},  # No attributes
        ]
        albums = [
            {"attributes": {"name": "Album A"}},
            {"attributes": {"name": "Album C"}},
            {},  # No attributes or name
        ]
        result = add_weight_to_songs(songs, albums)
        expected = [
            {
                "attributes": {"albumName": "Album A"},
                "rank": 1,
                "featured_album": True,
            },
            {
                "attributes": {"albumName": "Album B"},
                "rank": 2,
                "featured_album": False,
            },
            {
                "attributes": {"albumName": "Album C"},
                "rank": 3,
                "featured_album": True,
            },
            {"rank": 4},
        ]
        self.assertEqual(result, expected)

        # Test with no albums
        songs_no_albums = [
            {"attributes": {"albumName": "Album A"}},
            {"attributes": {"albumName": "Album B"}},
        ]
        result_no_albums = add_weight_to_songs(songs_no_albums, [])
        expected_no_albums = [
            {
                "attributes": {"albumName": "Album A"},
                "rank": 1,
                "featured_album": False,
            },
            {
                "attributes": {"albumName": "Album B"},
                "rank": 2,
                "featured_album": False,
            },
        ]
        self.assertEqual(result_no_albums, expected_no_albums)

        # Test with no songs
        self.assertEqual(add_weight_to_songs([], albums), [])

    @patch("apple_search.artist_page.cache")
    @patch("apple_search.artist_page.add_weight_to_songs")
    @patch("apple_search.artist_page.featured_album_details")
    @patch("apple_search.artist_page.top_songs_list_builder")
    @patch("apple_search.artist_page.get_artist_high_level_details")
    @patch(
        "apple_search.artist_page.format_image",
        return_value="formatted_image_url",
    )
    def test_artist_content_cache_hit(
        self,
        mock_format_image,
        mock_get_artist_high_level_details,
        mock_top_songs_list_builder,
        mock_featured_album_details,
        mock_add_weight_to_songs,
        mock_cache,
    ):
        mock_cache.get.return_value = {"cached_data": "some value"}
        result = artist_content("123")
        self.assertEqual(result, {"cached_data": "some value"})
        mock_cache.get.assert_called_once_with("artist_page:123")
        mock_cache.set.assert_not_called()
        mock_get_artist_high_level_details.assert_not_called()

    @patch("apple_search.artist_page.cache")
    @patch(
        "apple_search.artist_page.add_weight_to_songs",
        return_value="weighted_songs",
    )
    @patch("apple_search.artist_page.featured_album_details")
    @patch(
        "apple_search.artist_page.top_songs_list_builder",
        return_value="top_songs",
    )
    @patch("apple_search.artist_page.get_artist_high_level_details")
    @patch(
        "apple_search.artist_page.format_image",
        return_value="formatted_image_url",
    )
    def test_artist_content_success_with_albums(
        self,
        mock_format_image,
        mock_get_artist_high_level_details,
        mock_top_songs_list_builder,
        mock_featured_album_details,
        mock_add_weight_to_songs,
        mock_cache,
    ):
        mock_cache.get.return_value = None
        mock_get_artist_high_level_details.return_value = {
            "name": "Artist Name",
            "artist_id": "123",
            "image_url": "http://example.com/raw.jpg",
        }
        mock_featured_album_details.return_value = {
            "data": [{"name": "Album1"}]
        }

        result = artist_content("123")
        expected_output = {
            "artist_name": "Artist Name",
            "artist_id": 123,
            "artist_image": "formatted_image_url",
            "featured_albums": {"data": [{"name": "Album1"}]},
            "top_songs_list": "weighted_songs",
        }
        self.assertEqual(result, expected_output)
        mock_get_artist_high_level_details.assert_called_once_with("123")
        mock_top_songs_list_builder.assert_called_once_with("123")
        mock_featured_album_details.assert_called_once_with("123")
        mock_format_image.assert_called_once_with("http://example.com/raw.jpg")
        mock_add_weight_to_songs.assert_called_once_with(
            "top_songs", [{"name": "Album1"}]
        )
        mock_cache.set.assert_called_once_with(
            "artist_page:123", expected_output, timeout=3600
        )

    @patch("apple_search.artist_page.cache")
    @patch(
        "apple_search.artist_page.add_weight_to_songs",
        return_value="weighted_songs",
    )
    @patch("apple_search.artist_page.featured_album_details")
    @patch(
        "apple_search.artist_page.top_songs_list_builder",
        return_value="top_songs",
    )
    @patch("apple_search.artist_page.get_artist_high_level_details")
    @patch(
        "apple_search.artist_page.format_image",
        return_value="formatted_image_url",
    )
    def test_artist_content_success_no_albums(
        self,
        mock_format_image,
        mock_get_artist_high_level_details,
        mock_top_songs_list_builder,
        mock_featured_album_details,
        mock_add_weight_to_songs,
        mock_cache,
    ):
        mock_cache.get.return_value = None
        mock_get_artist_high_level_details.return_value = {
            "name": "Artist Name",
            "artist_id": "123",
            "image_url": "http://example.com/raw.jpg",
        }
        mock_featured_album_details.return_value = {
            "errors": ["no albums"]
        }  # No albums found

        result = artist_content("123")
        expected_output = {
            "artist_name": "Artist Name",
            "artist_id": 123,
            "artist_image": "formatted_image_url",
            "top_songs_list": "weighted_songs",
        }
        self.assertEqual(result, expected_output)
        mock_add_weight_to_songs.assert_called_once_with("top_songs", [])
        mock_cache.set.assert_called_once_with(
            "artist_page:123", expected_output, timeout=3600
        )

    @patch("apple_search.artist_page.cache")
    @patch("apple_search.artist_page.get_artist_high_level_details")
    @patch("apple_search.artist_page.format_image")
    def test_artist_content_artist_not_found_error(
        self, mock_format_image, mock_get_artist_high_level_details, mock_cache
    ):
        mock_cache.get.return_value = None
        # Artist not found or missing critical data
        mock_get_artist_high_level_details.return_value = {}

        result = artist_content("123")
        self.assertEqual(result, {"error": "Artist not found"})
        mock_format_image.assert_not_called()
        mock_cache.set.assert_not_called()

    @patch("apple_search.artist_page.cache")
    @patch(
        "apple_search.artist_page.add_weight_to_songs",
        return_value="weighted_songs",
    )
    @patch("apple_search.artist_page.featured_album_details")
    @patch(
        "apple_search.artist_page.top_songs_list_builder",
        return_value="top_songs",
    )
    @patch("apple_search.artist_page.get_artist_high_level_details")
    @patch(
        "apple_search.artist_page.format_image",
        return_value="formatted_image_url",
    )
    def test_artist_content_artist_id_conversion(
        self,
        mock_format_image,
        mock_get_artist_high_level_details,
        mock_top_songs_list_builder,
        mock_featured_album_details,
        mock_add_weight_to_songs,
        mock_cache,
    ):
        mock_cache.get.return_value = None
        mock_get_artist_high_level_details.return_value = {
            "name": "Artist Name",
            "artist_id": "123",
            "image_url": "http://example.com/raw.jpg",
        }
        mock_featured_album_details.return_value = {
            "data": [{"name": "Album1"}]
        }

        result = artist_content("123")
        self.assertIsInstance(result["artist_id"], int)
        self.assertEqual(result["artist_id"], 123)

    @classmethod
    def tearDownClass(cls):
        from django.db import connections

        for connection in connections.all():
            connection.close()
        super().tearDownClass()


class AppleSearchViewTests(TestCase):
    def setUp(self):
        self.client = Client()

    @patch("apple_search.views.fetch_artist_data.delay")
    def test_artist_search_view(self, mock_delay):
        mock_task = MagicMock()
        mock_task.id = "test-task-id"
        mock_delay.return_value = mock_task

        response = self.client.get("/artist", {"q": "Deftones"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(), {"task_id": "test-task-id", "status": "queued"}
        )
        mock_delay.assert_called_once_with("Deftones")

    @patch("apple_search.views.artist_content")
    @patch("apple_search.artist_page.artist_search")
    def test_artist_page_view_success(
        self, mock_artist_search, mock_artist_content
    ):
        mock_artist_search.return_value = {
            "results": {
                "artists": {
                    "data": [{"attributes": {"name": "Deftones"}, "id": "123"}]
                }
            }
        }
        mock_artist_content.return_value = {"name": "Deftones", "id": "123"}

        response = self.client.get("/artist-page/Deftones")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"name": "Deftones", "id": "123"})
        mock_artist_search.assert_called_once_with("Deftones")
        mock_artist_content.assert_called_once_with("123")

    @patch("apple_search.views.artist_content")
    @patch("apple_search.artist_page.artist_search")
    def test_artist_page_view_hyphen(
        self, mock_artist_search, mock_artist_content
    ):
        mock_artist_search.return_value = {
            "results": {
                "artists": {
                    "data": [
                        {"attributes": {"name": "The Deftones"}, "id": "123"}
                    ]
                }
            }
        }
        mock_artist_content.return_value = {
            "name": "The Deftones",
            "id": "123",
        }

        response = self.client.get("/artist-page/The-Deftones")

        self.assertEqual(response.status_code, 200)
        mock_artist_search.assert_called_once_with("The Deftones")

    @patch("apple_search.artist_page.artist_search")
    def test_artist_page_view_not_found(self, mock_artist_search):
        mock_artist_search.return_value = {
            "results": {"artists": {"data": []}}
        }

        response = self.client.get("/artist-page/Unknown")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"error": "Artist not found"})

    @patch("apple_search.artist_page.artist_search")
    def test_artist_page_view_name_mismatch(self, mock_artist_search):
        mock_artist_search.return_value = {
            "results": {
                "artists": {
                    "data": [
                        {"attributes": {"name": "Other Artist"}, "id": "123"}
                    ]
                }
            }
        }

        response = self.client.get("/artist-page/Deftones")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"error": "Artist not found"})

    @patch("apple_search.views.AsyncResult")
    def test_task_status_view_pending(self, mock_async_result):
        mock_result = MagicMock()
        mock_result.status = "PENDING"
        mock_result.ready.return_value = False
        mock_async_result.return_value = mock_result

        response = self.client.get(reverse("task-status"), {"q": "test-id"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(), {"status": "PENDING", "request_id": "test-id"}
        )

    @patch("apple_search.views.AsyncResult")
    def test_task_status_view_success(self, mock_async_result):
        mock_result = MagicMock()
        mock_result.status = "SUCCESS"
        mock_result.ready.return_value = True
        mock_result.successful.return_value = True
        mock_result.result = {"data": "ok"}
        mock_async_result.return_value = mock_result

        response = self.client.get(reverse("task-status"), {"q": "test-id"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "status": "SUCCESS",
                "request_id": "test-id",
                "result": {"data": "ok"},
            },
        )

    @patch("apple_search.views.AsyncResult")
    def test_task_status_view_failure(self, mock_async_result):
        mock_result = MagicMock()
        mock_result.status = "FAILURE"
        mock_result.ready.return_value = True
        mock_result.successful.return_value = False
        mock_result.result = "Error message"
        mock_async_result.return_value = mock_result

        response = self.client.get(reverse("task-status"), {"q": "test-id"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "status": "FAILURE",
                "request_id": "test-id",
                "error": "Error message",
            },
        )


class ArtistIDLookupTests(TestCase):
    @patch("apple_search.artist_page.artist_search")
    def test_get_artist_id_by_name_success(self, mock_artist_search):
        from apple_search.artist_page import get_artist_id_by_name
        mock_artist_search.return_value = {
            "results": {
                "artists": {
                    "data": [{"attributes": {"name": "Deftones"}, "id": "123"}]
                }
            }
        }
        self.assertEqual(get_artist_id_by_name("Deftones"), "123")
        mock_artist_search.assert_called_once_with("Deftones")

    @patch("apple_search.artist_page.artist_search")
    def test_get_artist_id_by_name_hyphen(self, mock_artist_search):
        from apple_search.artist_page import get_artist_id_by_name
        mock_artist_search.return_value = {
            "results": {
                "artists": {
                    "data": [
                        {"attributes": {"name": "The Deftones"}, "id": "123"}
                    ]
                }
            }
        }
        self.assertEqual(get_artist_id_by_name("The-Deftones"), "123")
        mock_artist_search.assert_called_once_with("The Deftones")

    @patch("apple_search.artist_page.artist_search")
    def test_get_artist_id_by_name_not_found(self, mock_artist_search):
        from apple_search.artist_page import get_artist_id_by_name
        mock_artist_search.return_value = {
            "results": {"artists": {"data": []}}
        }
        self.assertIsNone(get_artist_id_by_name("Unknown"))
