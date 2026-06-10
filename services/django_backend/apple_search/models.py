"""Apple API Related Models"""

from django.db import models


class AppleAuthManager(models.Manager):
    """Apple Music Auth Manage"""

    def add_auth(self, auth_code):
        """Add Spotify Auth"""
        auth = self.create(auth=auth_code)
        return auth


class AppleAuth(models.Model):
    """AppleAuth Class."""

    auth = models.CharField(max_length=2000)
    created = models.DateTimeField(auto_now_add=True)

    objects = AppleAuthManager()


class ArtistDetails(models.Model):
    """Artist Details"""

    artist_name = models.CharField(max_length=2000)
    created = models.DateTimeField(auto_created=True)
    artist_id = models.IntegerField()
    updated = models.DateTimeField(auto_now_add=True)
