import math
from django.core.cache import cache
from .models import Bracket, BracketItem, Matchup, SessionMatchupPick


class BracketService:
    NUM_GROUPS = 4
    CHAMPIONSHIP_SEMIFINAL_ROUND = 5
    CHAMPIONSHIP_FINAL_ROUND = 6
    MIN_BRACKET_SIZE_FOR_CHAMPIONSHIP = 16

    @staticmethod
    def _songs_by_id(songs_list):
        return {str(s.get("id")): s for s in songs_list}

    @staticmethod
    def _song_object(item, songs_by_id):
        if not item:
            return None

        song_full_data = songs_by_id.get(str(item.apple_id))
        if song_full_data:
            return song_full_data

        return {
            "id": item.apple_id,
            "type": "songs",
            "attributes": {
                "name": item.name,
                "artwork": {"url": item.image_url},
            },
        }

    @classmethod
    def _format_song_slot(cls, item, songs_by_id):
        if not item:
            return None

        song_obj = cls._song_object(item, songs_by_id)
        return {
            "song": song_obj,
            "groupRank": song_obj.get("rank", item.seed),
            "winner": None,
        }

    @classmethod
    def _get_group_num(cls, matchup, matches_in_round):
        num_groups = cls.NUM_GROUPS

        if matches_in_round >= num_groups:
            matches_per_group = matches_in_round // num_groups
            group_num = (matchup.matchup_num // matches_per_group) + 1
            return min(group_num, num_groups)

        if matches_in_round == 2:
            return 1 if matchup.matchup_num == 0 else 3

        return 1

    @staticmethod
    def _load_session_picks(bracket, session_key):
        picks = SessionMatchupPick.objects.filter(
            session_key=session_key,
            matchup__bracket=bracket,
        ).select_related("winner", "matchup")

        return {pick.matchup_id: pick for pick in picks}

    @classmethod
    def _resolve_participants(cls, matchup, picks_by_matchup_id):
        if matchup.is_championship:
            participants = []
            for feeder in (matchup.feeder1, matchup.feeder2):
                if not feeder:
                    participants.append(None)
                    continue
                pick = picks_by_matchup_id.get(feeder.id)
                participants.append(pick.winner if pick else None)
            return participants[0], participants[1]

        if matchup.round_number == 1:
            return matchup.item1, matchup.item2

        feeders = list(
            Matchup.objects.filter(next_matchup=matchup)
            .order_by("next_slot")
            .only("id", "next_slot")
        )

        if len(feeders) < 2:
            return None, None

        participants = []
        for feeder in feeders:
            pick = picks_by_matchup_id.get(feeder.id)
            participants.append(pick.winner if pick else None)

        return participants[0], participants[1]

    @classmethod
    def _matchup_id_str(cls, item1, item2):
        song1_id = item1.apple_id if item1 else "TBD"
        song2_id = item2.apple_id if item2 else "TBD"
        return f"{song1_id}{song2_id}"

    @classmethod
    def _build_matchup_payload(
        cls,
        matchup,
        item1,
        item2,
        pick,
        songs_by_id,
    ):
        attributes = {
            "matchupComplete": pick is not None,
            "song1": cls._format_song_slot(item1, songs_by_id),
            "song2": cls._format_song_slot(item2, songs_by_id),
        }

        if pick:
            winner_item = pick.winner
            attributes["winner"] = cls._song_object(winner_item, songs_by_id)
            loser_item = item2 if winner_item.id == item1.id else item1
            if loser_item:
                attributes["loser"] = cls._song_object(loser_item, songs_by_id)

        return {
            "matchupId": cls._matchup_id_str(item1, item2),
            "round": matchup.round_number,
            "attributes": attributes,
        }

    @classmethod
    def _build_structured_bracket(
        cls,
        bracket,
        songs_list,
        picks_by_matchup_id,
        max_group_round=None,
    ):
        songs_by_id = cls._songs_by_id(songs_list)

        matchups = (
            bracket.matchups.filter(is_championship=False)
            .select_related("item1", "item2", "feeder1", "feeder2")
            .order_by("round_number", "matchup_num")
        )

        structured_data = {
            f"group{group_num}": {}
            for group_num in range(1, cls.NUM_GROUPS + 1)
        }

        round_match_counts = {}
        for matchup in matchups:
            round_match_counts[matchup.round_number] = (
                round_match_counts.get(matchup.round_number, 0) + 1
            )

        for matchup in matchups:
            if max_group_round and matchup.round_number > max_group_round:
                continue

            item1, item2 = cls._resolve_participants(
                matchup,
                picks_by_matchup_id,
            )

            if not item1 or not item2:
                continue

            group_key = f"group{cls._get_group_num(matchup, round_match_counts[matchup.round_number])}"
            round_key = f"round{matchup.round_number}"

            if round_key not in structured_data[group_key]:
                structured_data[group_key][round_key] = {
                    "roundMatchups": [],
                    "progress": None,
                }

            pick = picks_by_matchup_id.get(matchup.id)
            structured_data[group_key][round_key]["roundMatchups"].append(
                cls._build_matchup_payload(
                    matchup,
                    item1,
                    item2,
                    pick,
                    songs_by_id,
                )
            )

        for group_data in structured_data.values():
            for round_data in group_data.values():
                matchups_in_round = round_data["roundMatchups"]
                if not matchups_in_round:
                    continue

                completed = sum(
                    1
                    for matchup_data in matchups_in_round
                    if matchup_data["attributes"]["matchupComplete"]
                )
                round_data["progress"] = completed / len(matchups_in_round)

        return structured_data

    @classmethod
    def _get_group_final_round(cls, bracket):
        group_matchups = bracket.matchups.filter(is_championship=False)
        final_round = 0

        for round_num in group_matchups.values_list(
            "round_number",
            flat=True,
        ).distinct():
            matchups = list(group_matchups.filter(round_number=round_num))
            per_group = {}
            for matchup in matchups:
                group_num = cls._get_group_num(matchup, len(matchups))
                per_group[group_num] = per_group.get(group_num, 0) + 1

            if set(per_group.keys()) == {1, 2, 3, 4} and all(
                count == 1 for count in per_group.values()
            ):
                final_round = max(final_round, round_num)

        return final_round

    @classmethod
    def _get_group_exit_matchups(cls, bracket, group_final_round):
        matchups = bracket.matchups.filter(
            is_championship=False,
            round_number=group_final_round,
        )
        round_count = matchups.count()
        exit_by_group = {}

        for matchup in matchups:
            group_num = cls._get_group_num(matchup, round_count)
            exit_by_group[group_num] = matchup

        return exit_by_group

    @classmethod
    def _create_championship_matchups(cls, bracket, exit_by_group):
        semi1 = Matchup.objects.create(
            bracket=bracket,
            round_number=cls.CHAMPIONSHIP_SEMIFINAL_ROUND,
            matchup_num=0,
            is_championship=True,
            feeder1=exit_by_group[1],
            feeder2=exit_by_group[2],
        )
        semi2 = Matchup.objects.create(
            bracket=bracket,
            round_number=cls.CHAMPIONSHIP_SEMIFINAL_ROUND,
            matchup_num=1,
            is_championship=True,
            feeder1=exit_by_group[3],
            feeder2=exit_by_group[4],
        )
        Matchup.objects.create(
            bracket=bracket,
            round_number=cls.CHAMPIONSHIP_FINAL_ROUND,
            matchup_num=0,
            is_championship=True,
            feeder1=semi1,
            feeder2=semi2,
        )

    @classmethod
    def ensure_championship_matchups(cls, bracket):
        if bracket.matchups.filter(is_championship=True).exists():
            return

        if bracket.items.count() < cls.MIN_BRACKET_SIZE_FOR_CHAMPIONSHIP:
            return

        group_final_round = cls._get_group_final_round(bracket)
        if not group_final_round:
            return

        exit_by_group = cls._get_group_exit_matchups(bracket, group_final_round)
        if len(exit_by_group) != cls.NUM_GROUPS:
            return

        cls._create_championship_matchups(bracket, exit_by_group)

    @classmethod
    def _group_phase_complete(cls, bracket, picks_by_matchup_id, group_final_round):
        exit_by_group = cls._get_group_exit_matchups(bracket, group_final_round)
        if len(exit_by_group) != cls.NUM_GROUPS:
            return False

        return all(
            picks_by_matchup_id.get(matchup.id)
            for matchup in exit_by_group.values()
        )

    @classmethod
    def _build_round_payload(cls, matchups, picks_by_matchup_id, songs_by_id):
        round_matchups = []

        for matchup in matchups:
            item1, item2 = cls._resolve_participants(
                matchup,
                picks_by_matchup_id,
            )
            if not item1 or not item2:
                continue

            pick = picks_by_matchup_id.get(matchup.id)
            round_matchups.append(
                cls._build_matchup_payload(
                    matchup,
                    item1,
                    item2,
                    pick,
                    songs_by_id,
                )
            )

        if not round_matchups:
            return None

        completed = sum(
            1
            for matchup_data in round_matchups
            if matchup_data["attributes"]["matchupComplete"]
        )
        return {
            "roundMatchups": round_matchups,
            "progress": completed / len(round_matchups),
        }

    @classmethod
    def _build_championship_structured(
        cls,
        bracket,
        songs_list,
        picks_by_matchup_id,
        group_final_round,
    ):
        if not group_final_round:
            return {}

        if not cls._group_phase_complete(
            bracket,
            picks_by_matchup_id,
            group_final_round,
        ):
            return {}

        songs_by_id = cls._songs_by_id(songs_list)
        semis = list(
            bracket.matchups.filter(
                is_championship=True,
                round_number=cls.CHAMPIONSHIP_SEMIFINAL_ROUND,
            )
            .select_related("feeder1", "feeder2")
            .order_by("matchup_num")
        )
        final = bracket.matchups.filter(
            is_championship=True,
            round_number=cls.CHAMPIONSHIP_FINAL_ROUND,
        ).select_related("feeder1", "feeder2").first()

        if not semis:
            return {}

        round5 = cls._build_round_payload(
            semis,
            picks_by_matchup_id,
            songs_by_id,
        )
        if not round5:
            return {}

        championship_data = {
            "round5": round5,
            "round6": {
                "progress": None,
                "roundMatchups": None,
            },
        }

        if round5["progress"] < 1 or not final:
            return championship_data

        round6 = cls._build_round_payload(
            [final],
            picks_by_matchup_id,
            songs_by_id,
        )
        if round6:
            championship_data["round6"] = round6

        return championship_data

    @classmethod
    def _derive_session_round(
        cls,
        bracket,
        picks_by_matchup_id,
        group_final_round,
        championship_data,
    ):
        if championship_data:
            round6 = championship_data.get("round6") or {}
            round5 = championship_data.get("round5") or {}
            if round6.get("roundMatchups"):
                return cls.CHAMPIONSHIP_FINAL_ROUND
            if round5.get("progress") == 1:
                return cls.CHAMPIONSHIP_FINAL_ROUND
            return cls.CHAMPIONSHIP_SEMIFINAL_ROUND

        if not group_final_round:
            return 1

        return cls._first_incomplete_group_round(
            bracket,
            picks_by_matchup_id,
            group_final_round,
        )

    @classmethod
    def _first_incomplete_group_round(
        cls,
        bracket,
        picks_by_matchup_id,
        group_final_round,
    ):
        for round_num in range(1, group_final_round + 1):
            matchups = bracket.matchups.filter(
                is_championship=False,
                round_number=round_num,
            )
            visible_matchups = []
            for matchup in matchups:
                item1, item2 = cls._resolve_participants(
                    matchup,
                    picks_by_matchup_id,
                )
                if item1 and item2:
                    visible_matchups.append(matchup)

            if not visible_matchups:
                continue

            if any(
                not picks_by_matchup_id.get(matchup.id)
                for matchup in visible_matchups
            ):
                return round_num

        return group_final_round

    @classmethod
    def _derive_champion(cls, championship_data, songs_by_id):
        round6 = championship_data.get("round6") or {}
        matchups = round6.get("roundMatchups") or []
        if not matchups:
            return None

        winner = matchups[0]["attributes"].get("winner")
        return winner

    @classmethod
    def get_session_bracket_state(cls, bracket, session_key, songs_list=None):
        if songs_list is None:
            songs_list = cls.get_songs_for_bracket(bracket)

        cls.ensure_championship_matchups(bracket)
        picks_by_matchup_id = cls._load_session_picks(bracket, session_key)
        group_final_round = cls._get_group_final_round(bracket)
        bracket_data = cls._build_structured_bracket(
            bracket,
            songs_list,
            picks_by_matchup_id,
            max_group_round=group_final_round or None,
        )
        championship_data = cls._build_championship_structured(
            bracket,
            songs_list,
            picks_by_matchup_id,
            group_final_round,
        )
        round_num = cls._derive_session_round(
            bracket,
            picks_by_matchup_id,
            group_final_round,
            championship_data,
        )
        if championship_data and round_num < cls.CHAMPIONSHIP_SEMIFINAL_ROUND:
            round_num = cls.CHAMPIONSHIP_SEMIFINAL_ROUND

        songs_by_id = cls._songs_by_id(songs_list)
        champion = cls._derive_champion(championship_data, songs_by_id)

        return {
            "bracket": bracket_data,
            "championshipBracket": championship_data,
            "round": round_num,
            "champion": champion,
        }

    @staticmethod
    def songs_list_from_bracket(bracket):
        return [
            {
                "id": item.apple_id,
                "type": "songs",
                "attributes": {
                    "name": item.name,
                    "artwork": {"url": item.image_url},
                },
                "rank": item.seed,
            }
            for item in bracket.items.order_by("seed")
        ]

    @classmethod
    def get_songs_for_bracket(cls, bracket):
        """
        Prefer full Apple song metadata (including artwork colors) from the
        artist bracket cache; fall back to BracketItem fields when unavailable.
        """
        cache_key = f"bracket_create:{bracket.artist_id}"
        cached = cache.get(cache_key)
        if cached and cached.get("top_songs_list"):
            return cached["top_songs_list"]

        try:
            from apple_search.artist_page import top_songs_list_builder

            songs = top_songs_list_builder(bracket.artist_id)
            if songs:
                return songs
        except Exception:
            pass

        return cls.songs_list_from_bracket(bracket)

    @classmethod
    def reset_session_picks(cls, bracket, session_key, songs_list=None):
        SessionMatchupPick.objects.filter(
            session_key=session_key,
            matchup__bracket=bracket,
        ).delete()
        return cls.get_session_bracket_state(
            bracket,
            session_key,
            songs_list,
        )

    @classmethod
    def record_session_pick(cls, session_key, matchup, winner_item):
        picks = cls._load_session_picks(matchup.bracket, session_key)
        item1, item2 = cls._resolve_participants(matchup, picks)
        valid_items = {item.id for item in (item1, item2) if item}
        if winner_item.id not in valid_items:
            raise ValueError(
                "Winner must be one of the matchup participants"
            )

        pick, _ = SessionMatchupPick.objects.update_or_create(
            session_key=session_key,
            matchup=matchup,
            defaults={"winner": winner_item},
        )
        return pick

    @classmethod
    def find_matchup_by_matchup_id(cls, bracket, matchup_id_str, session_key):
        cls.ensure_championship_matchups(bracket)
        picks = cls._load_session_picks(bracket, session_key)
        matched = None

        for matchup in bracket.matchups.order_by(
            "-is_championship",
            "-round_number",
            "matchup_num",
        ):
            item1, item2 = cls._resolve_participants(matchup, picks)
            if item1 and item2 and cls._matchup_id_str(item1, item2) == matchup_id_str:
                return matchup

        return matched

    @classmethod
    def get_session_structured_bracket(cls, bracket, session_key, songs_list):
        return cls.get_session_bracket_state(
            bracket,
            session_key,
            songs_list,
        )

    @staticmethod
    def create_bracket(artist_id, artist_name, songs):
        """
        Creates a bracket and its initial matchups.
        Currently supports power-of-2 sized brackets (e.g., 16, 32).
        """
        # Check if bracket already exists for this artist
        existing_bracket = Bracket.objects.filter(artist_id=artist_id).first()
        if existing_bracket:
            return existing_bracket

        # Limit to 16, 32 or 64 songs for now to keep it manageable
        num_songs = len(songs)
        if num_songs >= 64:
            bracket_size = 64
        elif num_songs >= 32:
            bracket_size = 32
        elif num_songs >= 16:
            bracket_size = 16
        elif num_songs >= 8:
            bracket_size = 8
        else:
            bracket_size = 4  # Minimum size

        selected_songs = songs[:bracket_size]

        bracket = Bracket.objects.create(
            name=f"{artist_name} Madness",
            artist_id=artist_id,
            artist_name=artist_name,
        )

        if len(songs) < 2:
            return bracket

        # Create items
        bracket_items = []
        for i, song in enumerate(selected_songs):
            item = BracketItem.objects.create(
                bracket=bracket,
                name=song.get("attributes", {}).get("name", "Unknown Song"),
                apple_id=song.get("id"),
                image_url=song.get("attributes", {})
                .get("artwork", {})
                .get("url", "")
                .replace("{w}", "300")
                .replace("{h}", "300"),
                seed=i + 1,
            )
            bracket_items.append(item)

        # Create the tree structure
        # Round 1 has bracket_size / 2 matches
        # Total rounds = log2(bracket_size)
        num_rounds = int(math.log2(bracket_size))

        # Create all matchups first (to link them)
        # We'll build from the final (Round N) back to Round 1

        matchups_by_round = {}

        # Create placeholder matchups for each round
        for r in range(1, num_rounds + 1):
            num_matches_in_round = 2 ** (num_rounds - r)
            matchups_by_round[r] = []
            for m in range(num_matches_in_round):
                matchup = Matchup.objects.create(
                    bracket=bracket, round_number=r, matchup_num=m
                )
                matchups_by_round[r].append(matchup)

        # Link matchups to their next_matchup
        for r in range(1, num_rounds):
            next_round = matchups_by_round[r + 1]
            for m, matchup in enumerate(matchups_by_round[r]):
                next_idx = m // 2
                matchup.next_matchup = next_round[next_idx]
                matchup.next_slot = 1 if m % 2 == 0 else 2
                matchup.save()

        # Assign Round 1 items based on seeding
        # Standard tournament seeding (1 vs 16, 8 vs 9, etc.)
        # For a simple implementation, let's just do 1 vs 16, 2 vs 15 ...
        # Better: [1, 16], [8, 9], [5, 12], [4, 13],
        # [3, 14], [6, 11], [7, 10], [2, 15]

        def get_seeding_order(size):
            if size == 1:
                return [0]
            prev = get_seeding_order(size // 2)
            res = []
            for i in prev:
                res.append(i)
                res.append(size - 1 - i)
            return res

        seeding_indices = get_seeding_order(bracket_size)

        r1_matchups = matchups_by_round[1]
        for m_idx in range(len(r1_matchups)):
            idx1 = seeding_indices[m_idx * 2]
            idx2 = seeding_indices[m_idx * 2 + 1]

            r1_matchups[m_idx].item1 = bracket_items[idx1]
            r1_matchups[m_idx].item2 = bracket_items[idx2]
            r1_matchups[m_idx].save()

        BracketService.ensure_championship_matchups(bracket)

        return bracket

    @staticmethod
    def advance_winner(matchup_id, winner_id):
        """
        Advances the winner to the next matchup in the bracket.
        """
        matchup = Matchup.objects.get(id=matchup_id)
        winner = BracketItem.objects.get(id=winner_id)

        # Validate winner is one of the participants
        if winner != matchup.item1 and winner != matchup.item2:
            raise ValueError("Winner must be one of the matchup participants")

        matchup.winner = winner
        matchup.save()

        if matchup.next_matchup:
            next_m = matchup.next_matchup
            # Use next_slot to determine where to place the winner
            if matchup.next_slot == 1:
                next_m.item1 = winner
            else:
                next_m.item2 = winner
            next_m.save()
        else:
            # This was the final!
            bracket = matchup.bracket
            bracket.is_completed = True
            bracket.save()

        return matchup

    @staticmethod
    def get_structured_bracket(bracket, songs_list):
        """
        Formats the bracket into a structured dictionary with groups
        and rounds.
        """
        BracketService.ensure_championship_matchups(bracket)
        group_final_round = BracketService._get_group_final_round(bracket)
        return BracketService._build_structured_bracket(
            bracket,
            songs_list,
            {},
            max_group_round=group_final_round or None,
        )
