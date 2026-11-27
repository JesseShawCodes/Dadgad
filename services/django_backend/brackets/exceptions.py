"""Domain exceptions for bracket operations."""


class BracketError(Exception):
    """Base bracket domain error."""

    code = "bracket_error"

    def __init__(self, message, code=None):
        super().__init__(message)
        if code:
            self.code = code


class MatchupNotReady(BracketError):
    code = "matchup_not_ready"


class MatchupAlreadyComplete(BracketError):
    code = "matchup_already_complete"


class InvalidWinner(BracketError):
    code = "invalid_winner"


class ArtistNotFound(BracketError):
    code = "artist_not_found"
