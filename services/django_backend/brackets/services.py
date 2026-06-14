import math
from .models import Bracket, BracketItem, Matchup


class BracketService:
    @staticmethod
    def create_bracket(artist_id, artist_name, songs):
        """
        Creates a bracket and its initial matchups.
        Currently supports power-of-2 sized brackets (e.g., 16, 32).
        """
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
                    bracket=bracket, round_number=r, matchup_number=m
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
