"""Serializer Methods for Apple App"""

from rest_framework import serializers

from apple_search.models import AppleAuth


class AppleSerializer(serializers.ModelSerializer):
    """Apple Serializer"""

    class Meta:
        """Meta Serializer"""

        model = AppleAuth
        fields = "__all__"
