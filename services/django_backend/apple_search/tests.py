from django.test import TestCase
from .bracket_generation import create_matchups

class BracketGenerationTest(TestCase):
    def test_create_matchups(self):
        # Create a mock array of 64 songs
        mock_songs = []
        for i in range(64):
            mock_songs.append({
                'id': str(i),
                'rank': i + 1
            })

        # Call the function with the mock data
        result = create_matchups(mock_songs, 1, 1)

        # Assert that the result has the correct structure
        self.assertIn('group1', result)
        self.assertIn('group2', result)
        self.assertIn('group3', result)
        self.assertIn('group4', result)

        self.assertIn('round1', result['group1'])
        self.assertIn('roundMatchups', result['group1']['round1'])
        self.assertEqual(len(result['group1']['round1']['roundMatchups']), 8)

        matchup = result['group1']['round1']['roundMatchups'][0]
        self.assertIn('matchupId', matchup)
        self.assertIn('round', matchup)
        self.assertIn('attributes', matchup)
        self.assertNotIn('matchupDescription', matchup)

        attributes = matchup['attributes']
        self.assertIn('matchupComplete', attributes)
        self.assertIn('song1', attributes)
        self.assertIn('song2', attributes)

        song1 = attributes['song1']
        self.assertIn('song', song1)
        self.assertIn('groupRank', song1)
        self.assertEqual(song1['groupRank'], 1)

        song2 = attributes['song2']
        self.assertIn('song', song2)
        self.assertIn('groupRank', song2)
        self.assertEqual(song2['groupRank'], 64)