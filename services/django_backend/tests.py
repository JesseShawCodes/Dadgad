'''Django Backend Tests'''
from django.test import TestCase, Client
from apple_search.auth import get_auth_token, get_newest_auth

class AuthTest(TestCase):
    '''Authorization Tests'''
    def setUp(self):
        get_auth_token()

    def test_add_auth(self):
        """Auth Token can be retrieved from API"""
        self.assertIsInstance(get_auth_token(), str)

    def test_newest_auth(self):
        """Newest Auth is obtained"""
        self.assertIsInstance(get_newest_auth(), str)
    
    @classmethod
    def tearDownClass(cls):
        from django.db import connections
        for connection in connections.all():
            connection.close()
        super().tearDownClass()

class ArtistSearch(TestCase):
    '''Artist Search Tests'''
    def setUp(self):
        get_auth_token()
        self.client = Client()

    def test_artist_search_view(self):
        '''Artist Search Page Test. Should return JSON'''
        response = self.client.get('/artist?q=deftones')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["Content-Type"], "application/json")

    def test_artist_page_view(self):
        '''Artist Page Test. Should return JSON'''
        response = self.client.get('/artist-page/1092903')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["Content-Type"], "application/json")

    @classmethod
    def tearDownClass(cls):
        from django.db import connections
        for connection in connections.all():
            connection.close()
        super().tearDownClass()
