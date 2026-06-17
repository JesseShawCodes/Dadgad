import math
from .models import Bracket, BracketItem, Matchup


class BracketService:
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
            # If matchup_num is even, winner becomes item1 in next_matchup
            # If matchup_num is odd, winner becomes item2 in next_matchup
            if matchup.matchup_num % 2 == 0:
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
        # Index songs by ID for quick lookup
        songs_by_id = {str(s.get('id')): s for s in songs_list}

        matchups = (
            bracket.matchups.all()
            .select_related('item1', 'item2', 'winner')
            .order_by('round_number', 'matchup_num')
        )

        # Determine number of groups (usually 4)
        num_groups = 4

        structured_data = {}
        for g in range(1, num_groups + 1):
            structured_data[f"group{g}"] = {}

        for matchup in matchups:
            # Determine group
            # In round 1, it's straightforward:
            # matchup_num // matches_per_group_r1
            # In later rounds, we follow the same logic based on the
            # tree structure
            matches_in_this_round = matchups.filter(
                round_number=matchup.round_number
            ).count()

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
                # For rounds with fewer than 4 matches (e.g. semi-finals,
                # finals), they might technically span multiple groups or none.
                # Usually, semi-finals are one for
                # groups 1&2 and one for groups 3&4.
                # Let's put them in group1 for simplicity, or based on
                # matchup_num.
                if matches_in_this_round == 2:
                    # Semi-finals
                    group_num = 1 if matchup.matchup_num == 0 else 3
                else:
                    # Final
                    group_num = 1

            group_key = f"group{group_num}"
            round_key = f"round{matchup.round_number}"

            if round_key not in structured_data[group_key]:
                structured_data[group_key][round_key] = {
                    "roundMatchups": [],
                    "progress": None
                }

            # Build song info
            def format_song_info(item):
                if not item:
                    return None

                song_full_data = songs_by_id.get(str(item.apple_id))
                if song_full_data:
                    song_obj = song_full_data
                else:
                    # Fallback if song data isn't in the provided list
                    song_obj = {
                        "id": item.apple_id,
                        "type": "songs",
                        "attributes": {
                            "name": item.name,
                            "artwork": {"url": item.image_url}
                        }
                    }

                return {
                    "song": song_obj,
                    "groupRank": song_obj.get("rank", item.seed),
                    # Set to true/false/id if needed, but example shows null
                    "winner": None
                }

            # matchupId is concatenated song IDs for R1, or just matchup ID
            song1_id = matchup.item1.apple_id if matchup.item1 else "TBD"
            song2_id = matchup.item2.apple_id if matchup.item2 else "TBD"

            matchup_id_str = f"{song1_id}{song2_id}"

            matchup_dict = {
                "matchupId": matchup_id_str,
                "round": matchup.round_number,
                "attributes": {
                    "matchupComplete": matchup.winner is not None,
                    "song1": format_song_info(matchup.item1),
                    "song2": format_song_info(matchup.item2),
                }
            }

            structured_data[group_key][round_key]["roundMatchups"].append(
                matchup_dict
            )

        return structured_data

    @staticmethod
    def create_matchups(songs, round_number, round_name):
        """
        Creates the matchups for a bracket.
        """

        return {"Test": "Hello"}
