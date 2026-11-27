"""
T040 — End-to-end bracket progression coverage.

Verifies create → round structure → advance through all rounds → champion
for power-of-two bracket sizes, especially the 64-song case.
"""

from django.test import TestCase

from .services import BracketService
from .test_factories import make_songs, play_bracket_to_completion


class BracketProgression64Tests(TestCase):
    """64 songs → 32 R1 matchups → championship → champion."""

    def setUp(self):
        self.songs = make_songs(64)
        self.bracket = BracketService.create_bracket(
            "artist-64", "Sixty Four", self.songs
        )

    def test_initial_round_has_32_matchups(self):
        r1 = self.bracket.matchups.filter(
            round_number=1, is_championship=False
        )
        self.assertEqual(r1.count(), 32)
        self.assertEqual(
            r1.filter(item1__isnull=False, item2__isnull=False).count(), 32
        )

    def test_group_and_championship_structure(self):
        # Group phase: log2(64)-2 = 4 rounds → 32+16+8+4 matchups
        self.assertEqual(
            self.bracket.matchups.filter(
                round_number=2, is_championship=False
            ).count(),
            16,
        )
        self.assertEqual(
            self.bracket.matchups.filter(
                round_number=3, is_championship=False
            ).count(),
            8,
        )
        self.assertEqual(
            self.bracket.matchups.filter(
                round_number=4, is_championship=False
            ).count(),
            4,
        )
        # Championship: 2 semis (round 5) + 1 final (round 6)
        self.assertEqual(
            self.bracket.matchups.filter(
                round_number=BracketService.CHAMPIONSHIP_SEMIFINAL_ROUND,
                is_championship=True,
            ).count(),
            2,
        )
        self.assertEqual(
            self.bracket.matchups.filter(
                round_number=BracketService.CHAMPIONSHIP_FINAL_ROUND,
                is_championship=True,
            ).count(),
            1,
        )
        # Single-elim: 63 deciding matchups total
        self.assertEqual(self.bracket.matchups.count(), 63)

    def test_play_through_produces_champion(self):
        picks = play_bracket_to_completion(self.bracket)
        self.assertEqual(picks, 63)

        self.bracket.refresh_from_db()
        self.assertTrue(self.bracket.is_completed)

        champion = BracketService.get_champion(self.bracket)
        self.assertIsNotNone(champion)
        self.assertIn("id", champion)
        self.assertTrue(
            any(song["id"] == champion["id"] for song in self.songs)
        )

        championship = BracketService.get_championship_rounds(self.bracket)
        self.assertTrue(len(championship) >= 1)

        final = self.bracket.matchups.get(
            round_number=BracketService.CHAMPIONSHIP_FINAL_ROUND,
            is_championship=True,
        )
        self.assertIsNotNone(final.winner_id)
        self.assertEqual(final.winner.apple_id, champion["id"])

    def test_round_two_ready_after_all_round_one_picks(self):
        r1 = list(
            self.bracket.matchups.filter(round_number=1).order_by("matchup_num")
        )
        for matchup in r1:
            BracketService.advance_winner(matchup.id, matchup.item1_id)

        r2_ready = self.bracket.matchups.filter(
            round_number=2,
            item1__isnull=False,
            item2__isnull=False,
            winner__isnull=True,
        )
        self.assertEqual(r2_ready.count(), 16)
        self.assertFalse(self.bracket.is_completed)


class BracketProgressionSizeMatrixTests(TestCase):
    """Spot-check create + complete for other power-of-two sizes."""

    def test_16_song_bracket_has_championship(self):
        songs = make_songs(16)
        bracket = BracketService.create_bracket("a16", "Sixteen", songs)

        self.assertEqual(
            bracket.matchups.filter(round_number=1, is_championship=False).count(),
            8,
        )
        self.assertEqual(
            bracket.matchups.filter(is_championship=True).count(),
            3,  # 2 semis + final
        )

        picks = play_bracket_to_completion(bracket)
        self.assertEqual(picks, 15)
        bracket.refresh_from_db()
        self.assertTrue(bracket.is_completed)
        self.assertIsNotNone(BracketService.get_champion(bracket))

    def test_32_song_bracket_completes(self):
        songs = make_songs(32)
        bracket = BracketService.create_bracket("a32", "Thirty Two", songs)

        self.assertEqual(
            bracket.matchups.filter(round_number=1, is_championship=False).count(),
            16,
        )
        picks = play_bracket_to_completion(bracket)
        self.assertEqual(picks, 31)
        bracket.refresh_from_db()
        self.assertTrue(bracket.is_completed)

    def test_8_song_bracket_no_championship_overlay(self):
        songs = make_songs(8)
        bracket = BracketService.create_bracket("a8", "Eight", songs)

        # Below MIN_SIZE_FOR_CHAMPIONSHIP: full tree without round 5/6 overlay
        self.assertEqual(bracket.matchups.filter(round_number=1).count(), 4)
        self.assertEqual(
            bracket.matchups.filter(
                round_number=BracketService.CHAMPIONSHIP_FINAL_ROUND
            ).count(),
            0,
        )
        picks = play_bracket_to_completion(bracket)
        self.assertEqual(picks, 7)
        bracket.refresh_from_db()
        self.assertTrue(bracket.is_completed)
        self.assertIsNotNone(BracketService.get_champion(bracket))

    def test_advancing_populates_next_slot(self):
        songs = make_songs(4)
        bracket = BracketService.create_bracket("a4", "Four", songs)
        m0 = bracket.matchups.get(round_number=1, matchup_num=0)
        m1 = bracket.matchups.get(round_number=1, matchup_num=1)
        final = bracket.matchups.get(round_number=2, matchup_num=0)

        BracketService.advance_winner(m0.id, m0.item1_id)
        final.refresh_from_db()
        self.assertEqual(final.item1_id, m0.item1_id)
        self.assertIsNone(final.item2_id)

        BracketService.advance_winner(m1.id, m1.item2_id)
        final.refresh_from_db()
        self.assertEqual(final.item2_id, m1.item2_id)

        # Final not yet ready until both sides filled — now playable
        BracketService.advance_winner(final.id, final.item1_id)
        bracket.refresh_from_db()
        self.assertTrue(bracket.is_completed)
