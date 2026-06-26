from django.test import TestCase
from .models import BracketItem, Matchup
from .services import BracketService


class StructuredBracketTests(TestCase):
    def setUp(self):
        self.artist_id = "12345"
        self.artist_name = "Bruce Springsteen"
        self.songs = [
            {"id": "s1", "attributes": {"name": "Song 1", "artwork": {
                "url": "url1"}}, "rank": 1},
            {"id": "s2", "attributes": {"name": "Song 2", "artwork": {
                "url": "url2"}}, "rank": 2},
            {"id": "s3", "attributes": {"name": "Song 3", "artwork": {
                "url": "url3"}}, "rank": 3},
            {"id": "s4", "attributes": {"name": "Song 4", "artwork": {
                "url": "url4"}}, "rank": 4},
        ]
        # For a 4-song bracket, we have 2 matches in R1, 1 match in R2.
        self.bracket = BracketService.create_bracket(
            self.artist_id, self.artist_name, self.songs
        )

    def test_get_structured_bracket(self):
        structured = BracketService.get_structured_bracket(
            self.bracket, self.songs
        )

        # Check that we have the 4 groups
        for i in range(1, 5):
            self.assertIn(f"group{i}", structured)

        # For a 4-song bracket, R1 matches (2 total) are distributed.
        # Matchup 0 goes to group 1, Matchup 1 goes to group 3
        # (according to my implementation for < 4 matches)
        # Wait, let's see how I implemented it for matches < 4.
        # if matches_in_this_round == 2:
        # group_num = 1 if matchup.matchup_num == 0 else 3

        self.assertIn("round1", structured["group1"])
        self.assertIn("round1", structured["group3"])

        r1_m1 = structured["group1"]["round1"]["roundMatchups"][0]
        self.assertEqual(r1_m1["round"], 1)
        self.assertIn("song1", r1_m1["attributes"])
        self.assertIn("song2", r1_m1["attributes"])

        # Check song data
        self.assertEqual(r1_m1["attributes"]["song1"]["song"]["id"], "s1")
        self.assertEqual(r1_m1["attributes"]["song1"]["groupRank"], 1)
        # Check matchupId (concatenated IDs)
        # Standard seeding for 4 songs: [0, 3, 1, 2]
        # Match 0: Song 1 (s1) vs Song 4 (s4)
        self.assertEqual(r1_m1["matchupId"], "s1s4")

    def test_get_session_structured_bracket_applies_pick(self):
        session_key = "test-session-key"
        r1_matchup = Matchup.objects.get(
            bracket=self.bracket,
            round_number=1,
            matchup_num=0,
        )
        winner = BracketItem.objects.get(
            bracket=self.bracket,
            apple_id="s1",
        )

        BracketService.record_session_pick(session_key, r1_matchup, winner)
        structured = BracketService.get_session_structured_bracket(
            self.bracket,
            session_key,
            self.songs,
        )

        r1_m1 = structured["bracket"]["group1"]["round1"]["roundMatchups"][0]
        self.assertTrue(r1_m1["attributes"]["matchupComplete"])
        self.assertEqual(r1_m1["attributes"]["winner"]["id"], "s1")
        self.assertEqual(r1_m1["attributes"]["loser"]["id"], "s4")
        self.assertEqual(structured["bracket"]["group1"]["round1"]["progress"], 1)

    def test_get_session_structured_bracket_builds_next_round(self):
        session_key = "test-session-key"
        r1_matchups = Matchup.objects.filter(
            bracket=self.bracket,
            round_number=1,
        ).order_by("matchup_num")

        BracketService.record_session_pick(
            session_key,
            r1_matchups[0],
            r1_matchups[0].item1,
        )
        BracketService.record_session_pick(
            session_key,
            r1_matchups[1],
            r1_matchups[1].item1,
        )

        structured = BracketService.get_session_structured_bracket(
            self.bracket,
            session_key,
            self.songs,
        )

        self.assertIn("round2", structured["bracket"]["group1"])
        r2 = structured["bracket"]["group1"]["round2"]["roundMatchups"][0]
        self.assertFalse(r2["attributes"]["matchupComplete"])
        self.assertEqual(
            r2["matchupId"],
            (
                f"{r1_matchups[0].item1.apple_id}"
                f"{r1_matchups[1].item1.apple_id}"
            ),
        )
