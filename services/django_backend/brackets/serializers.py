from rest_framework import serializers
from .models import Bracket, BracketItem, Matchup, SessionMatchupPick


class BracketItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BracketItem
        fields = "__all__"


class MatchupSerializer(serializers.ModelSerializer):
    item1 = BracketItemSerializer(read_only=True)
    item2 = BracketItemSerializer(read_only=True)
    winner = BracketItemSerializer(read_only=True)

    class Meta:
        model = Matchup
        fields = "__all__"


class BracketSerializer(serializers.ModelSerializer):
    items = BracketItemSerializer(many=True, read_only=True)
    matchups = MatchupSerializer(many=True, read_only=True)

    class Meta:
        model = Bracket
        fields = "__all__"


class SessionMatchupPickSerializer(serializers.ModelSerializer):
    winner = BracketItemSerializer(read_only=True)
    matchup = MatchupSerializer(read_only=True)

    class Meta:
        model = SessionMatchupPick
        fields = "__all__"
