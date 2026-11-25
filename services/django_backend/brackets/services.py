import math

from django.db import transaction
from django.db.models import Q

from .exceptions import (
    ArtistNotFound,
    InvalidWinner,
    MatchupAlreadyComplete,
    MatchupNotReady,
)
from .models import Bracket, BracketItem, Matchup


class BracketService:
    # Frontend championship UX historically uses round5 / round6 keys
    CHAMPIONSHIP_SEMIFINAL_ROUND = 5
    CHAMPIONSHIP_FINAL_ROUND = 6
    MIN_SIZE_FOR_CHAMPIONSHIP = 16

    @staticmethod
    def create_bracket(artist_id, artist_name, songs, owner=None):
        """
        Always creates a new bracket and its initial matchups.
        Supports power-of-2 sized brackets (4, 8, 16, 32, 64).
        For 16+ songs, also creates championship semis/final with feeders.
        """
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
            owner=owner,
        )

        if len(songs) < 2:
            return bracket

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

        # Group-phase rounds only when championship overlay is used;
        # otherwise build the full single-elimination tree.
        use_championship = bracket_size >= BracketService.MIN_SIZE_FOR_CHAMPIONSHIP
        group_rounds = int(math.log2(bracket_size)) - 2 if use_championship else int(
            math.log2(bracket_size)
        )
        if group_rounds < 1:
            group_rounds = int(math.log2(bracket_size))
            use_championship = False

        matchups_by_round = {}

        for r in range(1, group_rounds + 1):
            num_matches_in_round = 2 ** (
                int(math.log2(bracket_size)) - r
            )
            matchups_by_round[r] = []
            for m in range(num_matches_in_round):
                matchup = Matchup.objects.create(
                    bracket=bracket,
                    round_number=r,
                    matchup_num=m,
                    is_championship=False,
                )
                matchups_by_round[r].append(matchup)

        for r in range(1, group_rounds):
            next_round = matchups_by_round[r + 1]
            for m, matchup in enumerate(matchups_by_round[r]):
                next_idx = m // 2
                next_m = next_round[next_idx]
                matchup.next_matchup = next_m
                matchup.next_slot = 1 if m % 2 == 0 else 2
                matchup.save(update_fields=["next_matchup", "next_slot"])

        if use_championship:
            BracketService._create_championship_matchups(
                bracket, matchups_by_round[group_rounds]
            )
        else:
            # Mark the terminal round as championship for structured output
            final_round = matchups_by_round[group_rounds]
            for matchup in final_round:
                if matchup.next_matchup_id is None:
                    matchup.is_championship = True
                    matchup.save(update_fields=["is_championship"])

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
            r1_matchups[m_idx].save(update_fields=["item1", "item2"])

        return bracket

    @staticmethod
    def _create_championship_matchups(bracket, group_finals):
        """
        Create Final Four (round 5) and Final (round 6) with feeder links
        from the four group-final matchups.
        """
        if len(group_finals) < 4:
            return

        semi_a = Matchup.objects.create(
            bracket=bracket,
            round_number=BracketService.CHAMPIONSHIP_SEMIFINAL_ROUND,
            matchup_num=0,
            is_championship=True,
            feeder1=group_finals[0],
            feeder2=group_finals[1],
        )
        semi_b = Matchup.objects.create(
            bracket=bracket,
            round_number=BracketService.CHAMPIONSHIP_SEMIFINAL_ROUND,
            matchup_num=1,
            is_championship=True,
            feeder1=group_finals[2],
            feeder2=group_finals[3],
        )
        final = Matchup.objects.create(
            bracket=bracket,
            round_number=BracketService.CHAMPIONSHIP_FINAL_ROUND,
            matchup_num=0,
            is_championship=True,
            feeder1=semi_a,
            feeder2=semi_b,
        )
        semi_a.next_matchup = final
        semi_a.next_slot = 1
        semi_a.save(update_fields=["next_matchup", "next_slot"])
        semi_b.next_matchup = final
        semi_b.next_slot = 2
        semi_b.save(update_fields=["next_matchup", "next_slot"])

        for idx, group_final in enumerate(group_finals[:4]):
            target = semi_a if idx < 2 else semi_b
            group_final.next_matchup = target
            group_final.next_slot = 1 if idx % 2 == 0 else 2
            group_final.save(update_fields=["next_matchup", "next_slot"])

    @staticmethod
    def get_latest_bracket(artist_id, incomplete_only=True):
        """Return the most recent bracket for an artist, if any."""
        qs = Bracket.objects.filter(artist_id=artist_id).order_by("-created_at")
        if incomplete_only:
            qs = qs.filter(is_completed=False)
        return qs.first()

    @staticmethod
    def get_or_create_bracket(artist_id, artist_name, songs, force_new=False, owner=None):
        """
        Resume the latest incomplete bracket for an artist, or create a new one.
        Pass force_new=True to always start a fresh tournament.
        """
        if not force_new:
            existing = BracketService.get_latest_bracket(artist_id, incomplete_only=True)
            if existing:
                return existing, False
        return (
            BracketService.create_bracket(artist_id, artist_name, songs, owner=owner),
            True,
        )

    @staticmethod
    def build_artist_bracket_payload(artist_name, force_new=False, owner=None):
        """
        Resolve artist catalog data and return a full artist-page payload.
        Business logic lives here so views stay thin.
        """
        from apple_search.artist_page import (
            add_weight_to_songs,
            featured_album_details,
            get_artist_id_by_name,
            top_songs_list_builder,
        )

        artist_id = get_artist_id_by_name(artist_name)
        if isinstance(artist_id, str) and not artist_id.isdigit():
            raise ArtistNotFound(artist_id)
        if not artist_id:
            raise ArtistNotFound("Artist not found")

        songs = top_songs_list_builder(artist_id)
        albums = featured_album_details(artist_id)
        songs = add_weight_to_songs(
            songs,
            albums.get("data", []) if albums and "data" in albums else [],
        )

        display_name = artist_name.replace("-", " ").title()
        bracket, _created = BracketService.get_or_create_bracket(
            artist_id,
            display_name,
            songs,
            force_new=force_new,
            owner=owner,
        )

        structured = BracketService.get_structured_bracket(bracket, songs)
        champion = BracketService.get_champion(bracket)

        return {
            "artist_name": display_name,
            "artist_id": artist_id,
            "featured_albums": albums,
            "top_songs_list": songs,
            "matchups": list(bracket.matchups.all()),
            "bracket_id": bracket.id,
            "bracket": structured,
            "is_completed": bracket.is_completed,
            "champion": champion,
            "championship": BracketService.get_championship_rounds(bracket, songs),
        }

    @staticmethod
    @transaction.atomic
    def advance_winner(matchup_id, winner_id):
        """
        Advances the winner to the next matchup in the bracket.
        Uses select_for_update to prevent concurrent picks.
        """
        try:
            # of=("self",) avoids Postgres FOR UPDATE on nullable outer joins
            matchup = Matchup.objects.select_for_update(of=("self",)).get(
                id=matchup_id
            )
        except Matchup.DoesNotExist as exc:
            raise MatchupNotReady("Matchup not found") from exc

        try:
            winner = BracketItem.objects.select_for_update(of=("self",)).get(
                id=winner_id
            )
        except BracketItem.DoesNotExist as exc:
            raise InvalidWinner("Winning song not found") from exc

        if matchup.item1_id is None or matchup.item2_id is None:
            raise MatchupNotReady("Matchup is not ready for a winner")

        if matchup.winner_id is not None:
            raise MatchupAlreadyComplete("Matchup already has a winner")

        if winner.id not in (matchup.item1_id, matchup.item2_id):
            raise InvalidWinner("Winner must be one of the matchup participants")

        if winner.bracket_id != matchup.bracket_id:
            raise InvalidWinner("Winner must belong to the same bracket")

        matchup.winner = winner
        matchup.save(update_fields=["winner"])

        if matchup.next_matchup_id:
            next_m = Matchup.objects.select_for_update(of=("self",)).get(
                id=matchup.next_matchup_id
            )
            slot = matchup.next_slot
            if slot is None:
                slot = 1 if matchup.matchup_num % 2 == 0 else 2
            if slot == 2:
                next_m.item2 = winner
                next_m.save(update_fields=["item2"])
            else:
                next_m.item1 = winner
                next_m.save(update_fields=["item1"])
        else:
            Bracket.objects.filter(pk=matchup.bracket_id).update(
                is_completed=True
            )

        return matchup

    @staticmethod
    def find_matchup_by_matchup_id(bracket, matchup_id_str):
        """
        Locate a matchup whose frontend matchupId (concatenated apple ids)
        matches the provided string.
        """
        matchups = bracket.matchups.select_related("item1", "item2").all()
        for matchup in matchups:
            song1_id = matchup.item1.apple_id if matchup.item1 else "TBD"
            song2_id = matchup.item2.apple_id if matchup.item2 else "TBD"
            if f"{song1_id}{song2_id}" == str(matchup_id_str):
                return matchup
        return None

    @staticmethod
    def resolve_matchup_for_pick(bracket, matchup_id_str, winner_item):
        """Find the matchup for a UI pick, with open-matchup fallback."""
        matchup = BracketService.find_matchup_by_matchup_id(bracket, matchup_id_str)
        if matchup:
            return matchup
        return (
            Matchup.objects.filter(bracket=bracket, winner__isnull=True)
            .filter(Q(item1=winner_item) | Q(item2=winner_item))
            .first()
        )

    @staticmethod
    def get_songs_for_bracket(bracket):
        """
        Build a minimal songs list from bracket items for structured output.
        """
        songs = []
        for item in bracket.items.all():
            songs.append(
                {
                    "id": item.apple_id,
                    "type": "songs",
                    "rank": item.seed,
                    "attributes": {
                        "name": item.name,
                        "artwork": {"url": item.image_url or ""},
                    },
                }
            )
        return songs

    @staticmethod
    def get_champion(bracket):
        """Return the final winner item as a song dict, or None."""
        if not bracket.is_completed:
            return None
        final = (
            bracket.matchups.filter(next_matchup__isnull=True, winner__isnull=False)
            .select_related("winner")
            .first()
        )
        if not final or not final.winner:
            return None
        winner = final.winner
        return {
            "id": winner.apple_id,
            "type": "songs",
            "rank": winner.seed,
            "attributes": {
                "name": winner.name,
                "artwork": {"url": winner.image_url or ""},
            },
        }

    @staticmethod
    def _format_matchup_dict(matchup, songs_by_id):
        def format_song_info(item):
            if not item:
                return None

            song_full_data = songs_by_id.get(str(item.apple_id))
            if song_full_data:
                song_obj = song_full_data
            else:
                song_obj = {
                    "id": item.apple_id,
                    "type": "songs",
                    "attributes": {
                        "name": item.name,
                        "artwork": {"url": item.image_url},
                    },
                }

            is_winner = (
                matchup.winner_id is not None and item.id == matchup.winner_id
            )
            return {
                "song": song_obj,
                "groupRank": song_obj.get("rank", item.seed),
                "winner": True if is_winner else (False if matchup.winner_id else None),
            }

        song1_id = matchup.item1.apple_id if matchup.item1 else "TBD"
        song2_id = matchup.item2.apple_id if matchup.item2 else "TBD"
        matchup_id_str = f"{song1_id}{song2_id}"

        winner_payload = None
        if matchup.winner:
            winner_info = format_song_info(matchup.winner)
            winner_payload = winner_info["song"] if winner_info else None

        return {
            "matchupId": matchup_id_str,
            "round": matchup.round_number,
            "attributes": {
                "matchupComplete": matchup.winner_id is not None,
                "song1": format_song_info(matchup.item1),
                "song2": format_song_info(matchup.item2),
                "winner": winner_payload,
            },
        }

    @staticmethod
    def get_championship_rounds(bracket, songs_list=None):
        """
        Championship payload from is_championship matchups (server source of truth).
        Falls back to late group rounds for small brackets.
        """
        if songs_list is None:
            songs_list = BracketService.get_songs_for_bracket(bracket)

        songs_by_id = {str(s.get("id")): s for s in songs_list}
        championship = {}

        champ_matchups = (
            bracket.matchups.filter(is_championship=True)
            .select_related("item1", "item2", "winner")
            .order_by("round_number", "matchup_num")
        )
        if champ_matchups.exists():
            for matchup in champ_matchups:
                round_key = f"round{matchup.round_number}"
                if round_key not in championship:
                    championship[round_key] = {
                        "roundMatchups": [],
                        "progress": None,
                    }
                championship[round_key]["roundMatchups"].append(
                    BracketService._format_matchup_dict(matchup, songs_by_id)
                )
            for round_data in championship.values():
                total = len(round_data["roundMatchups"])
                done = sum(
                    1
                    for m in round_data["roundMatchups"]
                    if m["attributes"]["matchupComplete"]
                )
                round_data["progress"] = (done / total) if total else None
            return championship

        # Small brackets: expose the terminal round as championship
        terminal = (
            bracket.matchups.filter(next_matchup__isnull=True)
            .select_related("item1", "item2", "winner")
            .order_by("matchup_num")
        )
        if terminal.exists():
            round_key = f"round{terminal.first().round_number}"
            championship[round_key] = {
                "roundMatchups": [
                    BracketService._format_matchup_dict(m, songs_by_id)
                    for m in terminal
                ],
                "progress": None,
            }
        return championship

    @staticmethod
    def get_structured_bracket(bracket, songs_list):
        """
        Formats group-phase matchups into group1..group4.
        Championship matchups are omitted here — use get_championship_rounds.
        """
        songs_by_id = {str(s.get("id")): s for s in songs_list}

        matchups = (
            bracket.matchups.filter(is_championship=False)
            .select_related("item1", "item2", "winner")
            .order_by("round_number", "matchup_num")
        )

        num_groups = 4
        structured_data = {}
        for g in range(1, num_groups + 1):
            structured_data[f"group{g}"] = {}

        # Precompute matches per round to avoid N+1 count queries
        matches_per_round = {}
        for matchup in matchups:
            matches_per_round[matchup.round_number] = (
                matches_per_round.get(matchup.round_number, 0) + 1
            )

        for matchup in matchups:
            matches_in_this_round = matches_per_round[matchup.round_number]

            if matches_in_this_round >= num_groups:
                matches_per_group_this_round = (
                    matches_in_this_round // num_groups
                )
                group_num = (
                    matchup.matchup_num // matches_per_group_this_round
                ) + 1
                if group_num > num_groups:
                    group_num = num_groups
            else:
                if matches_in_this_round == 2:
                    group_num = 1 if matchup.matchup_num == 0 else 3
                else:
                    group_num = 1

            group_key = f"group{group_num}"
            round_key = f"round{matchup.round_number}"

            if round_key not in structured_data[group_key]:
                structured_data[group_key][round_key] = {
                    "roundMatchups": [],
                    "progress": None,
                }

            structured_data[group_key][round_key]["roundMatchups"].append(
                BracketService._format_matchup_dict(matchup, songs_by_id)
            )

        return structured_data
