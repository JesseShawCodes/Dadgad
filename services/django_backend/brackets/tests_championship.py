from django.test import TestCase
from .models import Matchup
from .services import BracketService


def make_songs(count):
    return [
        {
            "id": f"s{i}",
            "attributes": {"name": f"Song {i}", "artwork": {"url": f"url{i}"}},
            "rank": i,
        }
        for i in range(1, count + 1)
    ]


def complete_group_phase(bracket, session_key):
    songs = BracketService.songs_list_from_bracket(bracket)
    group_final = BracketService._get_group_final_round(bracket)

    for round_num in range(1, group_final + 1):
        matchups = bracket.matchups.filter(
            is_championship=False,
            round_number=round_num,
        )
        for matchup in matchups:
            picks = BracketService._load_session_picks(bracket, session_key)
            item1, item2 = BracketService._resolve_participants(matchup, picks)
            if item1 and item2 and not picks.get(matchup.id):
                BracketService.record_session_pick(
                    session_key,
                    matchup,
                    item1,
                )

    return BracketService.get_session_bracket_state(
        bracket,
        session_key,
        songs,
    )


class ChampionshipMatchupTests(TestCase):
    def setUp(self):
        self.session_key = "championship-session"
        self.songs = make_songs(16)
        self.bracket = BracketService.create_bracket(
            "artist-16",
            "Sixteen Artist",
            self.songs,
        )

    def test_championship_matchups_created_for_16_song_bracket(self):
        championship = self.bracket.matchups.filter(is_championship=True)
        self.assertEqual(championship.count(), 3)
        self.assertEqual(
            championship.filter(
                round_number=BracketService.CHAMPIONSHIP_SEMIFINAL_ROUND
            ).count(),
            2,
        )
        self.assertEqual(
            championship.filter(
                round_number=BracketService.CHAMPIONSHIP_FINAL_ROUND
            ).count(),
            1,
        )

    def test_championship_not_created_for_small_bracket(self):
        small_bracket = BracketService.create_bracket(
            "artist-4",
            "Four Artist",
            make_songs(4),
        )
        self.assertEqual(
            small_bracket.matchups.filter(is_championship=True).count(),
            0,
        )

    def test_championship_appears_after_group_phase_complete(self):
        state = complete_group_phase(self.bracket, self.session_key)

        self.assertIn("round5", state["championshipBracket"])
        self.assertEqual(len(state["championshipBracket"]["round5"]["roundMatchups"]), 2)
        self.assertEqual(state["round"], BracketService.CHAMPIONSHIP_SEMIFINAL_ROUND)

    def test_championship_semifinal_and_final_picks_persist(self):
        complete_group_phase(self.bracket, self.session_key)
        songs = BracketService.songs_list_from_bracket(self.bracket)

        semis = self.bracket.matchups.filter(
            is_championship=True,
            round_number=BracketService.CHAMPIONSHIP_SEMIFINAL_ROUND,
        ).order_by("matchup_num")

        for semi in semis:
            picks = BracketService._load_session_picks(self.bracket, self.session_key)
            item1, item2 = BracketService._resolve_participants(semi, picks)
            BracketService.record_session_pick(
                self.session_key,
                semi,
                item1,
            )

        state = BracketService.get_session_bracket_state(
            self.bracket,
            self.session_key,
            songs,
        )
        self.assertIsNotNone(state["championshipBracket"]["round6"]["roundMatchups"])

        final = self.bracket.matchups.get(
            is_championship=True,
            round_number=BracketService.CHAMPIONSHIP_FINAL_ROUND,
        )
        picks = BracketService._load_session_picks(self.bracket, self.session_key)
        item1, item2 = BracketService._resolve_participants(final, picks)
        BracketService.record_session_pick(self.session_key, final, item1)

        state = BracketService.get_session_bracket_state(
            self.bracket,
            self.session_key,
            songs,
        )
        final_matchup = state["championshipBracket"]["round6"]["roundMatchups"][0]
        self.assertTrue(final_matchup["attributes"]["matchupComplete"])
        self.assertEqual(state["champion"]["id"], item1.apple_id)
        self.assertEqual(state["round"], BracketService.CHAMPIONSHIP_FINAL_ROUND)

    def test_find_matchup_includes_championship(self):
        complete_group_phase(self.bracket, self.session_key)
        semi = Matchup.objects.filter(
            bracket=self.bracket,
            is_championship=True,
            round_number=BracketService.CHAMPIONSHIP_SEMIFINAL_ROUND,
            matchup_num=0,
        ).select_related("feeder1", "feeder2").first()

        picks = BracketService._load_session_picks(self.bracket, self.session_key)
        item1, item2 = BracketService._resolve_participants(semi, picks)
        matchup_id = BracketService._matchup_id_str(item1, item2)

        found = BracketService.find_matchup_by_matchup_id(
            self.bracket,
            matchup_id,
            self.session_key,
        )
        self.assertEqual(found.id, semi.id)
