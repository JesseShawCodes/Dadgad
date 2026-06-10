from django.contrib import admin
from .models import Bracket, BracketItem, Matchup


@admin.register(Bracket)
class BracketAdmin(admin.ModelAdmin):
    list_display = ("name", "artist_name", "created_at", "is_completed")
    search_fields = ("name", "artist_name")


@admin.register(BracketItem)
class BracketItemAdmin(admin.ModelAdmin):
    list_display = ("name", "bracket", "seed")
    list_filter = ("bracket",)
    search_fields = ("name",)


@admin.register(Matchup)
class MatchupAdmin(admin.ModelAdmin):
    list_display = (
        "bracket",
        "round_number",
        "matchup_number",
        "item1",
        "item2",
        "winner",
    )
    list_filter = ("bracket", "round_number")
