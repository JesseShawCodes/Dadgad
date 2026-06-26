from django.db import models
from django.conf import settings


class Bracket(models.Model):
    name = models.CharField(max_length=255)
    artist_id = models.CharField(max_length=255)
    artist_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="brackets"
    )
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class BracketItem(models.Model):
    bracket = models.ForeignKey(
        Bracket,
        related_name="items",
        on_delete=models.CASCADE
    )
    name = models.CharField(max_length=255)
    apple_id = models.CharField(max_length=255)
    image_url = models.URLField(max_length=1000, null=True, blank=True)
    seed = models.IntegerField()

    class Meta:
        ordering = ["seed"]

    def __str__(self):
        return f"{self.name} (Seed: {self.seed})"


class Matchup(models.Model):
    bracket = models.ForeignKey(
        Bracket, related_name="matchups", on_delete=models.CASCADE
    )
    round_number = models.IntegerField()
    matchup_num = models.IntegerField()  # index within the round

    item1 = models.ForeignKey(
        BracketItem,
        related_name="matchups_as_item1",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    item2 = models.ForeignKey(
        BracketItem,
        related_name="matchups_as_item2",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    winner = models.ForeignKey(
        BracketItem,
        related_name="matchups_won",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    next_matchup = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="previous_matchups",
    )
    next_slot = models.IntegerField(null=True, blank=True)
    is_championship = models.BooleanField(default=False)
    feeder1 = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="championship_feeder1_matchups",
    )
    feeder2 = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="championship_feeder2_matchups",
    )

    class Meta:
        ordering = ["round_number", "matchup_num"]

    def __str__(self):
        return f"B{self.bracket_id} R{self.round_number} M{self.matchup_num}"


class SessionMatchupPick(models.Model):
    """
    One row per winner a session chose in a matchup.
    Bracket progress is derived from these picks plus the shared Matchup tree.
    """
    session_key = models.CharField(max_length=40, db_index=True)
    matchup = models.ForeignKey(
        Matchup,
        on_delete=models.CASCADE,
        related_name="session_picks",
    )
    winner = models.ForeignKey(
        BracketItem,
        on_delete=models.CASCADE,
        related_name="session_matchup_wins",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["session_key", "matchup"],
                name="unique_session_matchup_pick",
            ),
        ]

    def __str__(self):
        return (
            f"{self.session_key} "
            f"Matchup {self.matchup_id} → {self.winner.name}"
        )
