"""Shared fixtures/helpers for bracket tests."""


def make_songs(count, prefix="s"):
    """Build a power-of-two song list shaped like Apple Music catalog entries."""
    songs = []
    for i in range(1, count + 1):
        songs.append(
            {
                "id": f"{prefix}{i}",
                "type": "songs",
                "rank": i,
                "attributes": {
                    "name": f"Song {i}",
                    "artwork": {"url": f"https://example.com/{prefix}{i}.jpg"},
                },
            }
        )
    return songs


def play_bracket_to_completion(bracket, prefer_item1=True):
    """
    Advance every ready matchup until the bracket is completed.
    Returns the number of picks made.
    """
    from .services import BracketService

    picks = 0
    while True:
        open_matchup = (
            bracket.matchups.filter(
                winner__isnull=True,
                item1__isnull=False,
                item2__isnull=False,
            )
            .order_by("round_number", "matchup_num")
            .first()
        )
        if not open_matchup:
            break
        winner_id = (
            open_matchup.item1_id if prefer_item1 else open_matchup.item2_id
        )
        BracketService.advance_winner(open_matchup.id, winner_id)
        picks += 1
        bracket.refresh_from_db()
    return picks
