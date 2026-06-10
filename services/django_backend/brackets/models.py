from django.db import models
from django.conf import settings


class Bracket(models.Model):
    name = models.CharField(max_length=255)
    artist_id = models.CharField(max_length=255)
    artist_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True
    )
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class BracketItem(models.Model):
    bracket = models.ForeignKey(Bracket, related_name="items", on_delete=models.CASCADE)
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
    matchup_number = models.IntegerField()  # index within the round

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

    class Meta:
        ordering = ["round_number", "matchup_number"]

    def __str__(self):
        return f"Bracket {self.bracket_id} - Round {self.round_number} Match {self.matchup_number}"
