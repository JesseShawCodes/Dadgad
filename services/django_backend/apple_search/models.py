'''Apple API Related Models'''
from django.db import models

class AppleAuthManager(models.Manager):
    '''Apple Music Auth Manage'''
    def add_auth(self, auth_code):
        '''Add Apple Auth'''
        auth = self.create(auth=auth_code)
        return auth

class AppleAuth(models.Model):
    '''AppleAuth Class.'''
    auth = models.CharField(max_length=2000)
    created = models.DateTimeField(auto_now_add=True)

    objects = AppleAuthManager()

class ArtistDetail(models.Model):
    '''Artist Details'''
    artist_name = models.CharField(max_length=2000)
    created = models.DateTimeField(auto_created=True)
    artist_id = models.IntegerField()
    updated = models.DateTimeField(auto_now_add=True)

class MatchupDescription(models.Model):
    '''Matchup Description'''
    matchup_id = models.CharField(max_length=200, primary_key=True)
    description = models.TextField()
    song_a = models.CharField(max_length=2000)
    song_b = models.CharField(max_length=2000)
    created = models.DateTimeField(auto_now_add=True)
