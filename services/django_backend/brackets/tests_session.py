from django.test import TestCase
from rest_framework.test import APIClient
from .models import BracketItem, Matchup
from .services import BracketService


class SessionBracketViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.session_key = "session-abc123"
        self.songs = [
            {
                "id": "s1",
                "attributes": {"name": "Song 1", "artwork": {"url": "url1"}},
                "rank": 1,
            },
            {
                "id": "s2",
                "attributes": {"name": "Song 2", "artwork": {"url": "url2"}},
                "rank": 2,
            },
            {
                "id": "s3",
                "attributes": {"name": "Song 3", "artwork": {"url": "url3"}},
                "rank": 3,
            },
            {
                "id": "s4",
                "attributes": {"name": "Song 4", "artwork": {"url": "url4"}},
                "rank": 4,
            },
        ]
        self.bracket = BracketService.create_bracket(
            "12345",
            "Test Artist",
            self.songs,
        )
        self.r1_matchup = Matchup.objects.get(
            bracket=self.bracket,
            round_number=1,
            matchup_num=0,
        )
        self.winner = BracketItem.objects.get(
            bracket=self.bracket,
            apple_id="s1",
        )

    def test_session_bracket_view_requires_session_id(self):
        response = self.client.get(f"/api/brackets/{self.bracket.id}/session/")
        self.assertEqual(response.status_code, 400)

    def test_session_bracket_view_returns_saved_picks(self):
        BracketService.record_session_pick(
            self.session_key,
            self.r1_matchup,
            self.winner,
        )

        response = self.client.get(
            f"/api/brackets/{self.bracket.id}/session/",
            {"sessionId": self.session_key},
        )

        self.assertEqual(response.status_code, 200)
        r1_m1 = response.data["bracket"]["group1"]["round1"]["roundMatchups"][0]
        self.assertTrue(r1_m1["attributes"]["matchupComplete"])
        self.assertEqual(r1_m1["attributes"]["winner"]["id"], "s1")
        self.assertEqual(response.data["championshipBracket"], {})

    def test_session_bracket_reset_clears_picks(self):
        BracketService.record_session_pick(
            self.session_key,
            self.r1_matchup,
            self.winner,
        )

        response = self.client.post(
            f"/api/brackets/{self.bracket.id}/session/reset/",
            {"sessionId": self.session_key},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        r1_m1 = response.data["bracket"]["group1"]["round1"]["roundMatchups"][0]
        self.assertFalse(r1_m1["attributes"]["matchupComplete"])
        self.assertEqual(response.data["round"], 1)
        self.assertEqual(response.data["championshipBracket"], {})

        response = self.client.post(
            "/api/brackets/select-matchup-winner/",
            {
                "sessionId": self.session_key,
                "matchupId": "s1s4",
                "selectedSong": {
                    "song": {"id": "s1"},
                    "groupRank": 1,
                },
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            response.data["bracket"]["group1"]["round1"]["roundMatchups"][0][
                "attributes"
            ]["matchupComplete"]
        )
