from django.http import JsonResponse
import openai
import os
import math
from .models import MatchupDescription

def create_matchups(arr, matchup_round, current_round):
    matchups = []
    arr_len = len(arr)

    for i in range(math.floor(arr_len / 2)):
        song1 = f"{arr[i]['attributes']['artistName']} - {arr[i]['attributes']['name']}" 
        song2 = f"{arr[arr_len - 1 - i]['attributes']['artistName']} - {arr[arr_len - 1 - i]['attributes']['name']}" 

        matchup_id = arr[i]['id'] + arr[arr_len - 1 - i]['id']

        matchups.append({
            'song1': song1,
            'song2': song2,
            'matchupId': matchup_id,
            'matchupDescription': get_matchup_description(song1, song2, matchup_id),
            'round': current_round,
            'attributes': {
                'matchupComplete': False,
                'song1': {
                    'song': arr[i],
                    'groupRank': arr[i]['rank'],
                    'winner': None,
                },
                'song2': {
                    'song': arr[arr_len - 1 - i],
                    'groupRank': arr[arr_len - 1 - i]['rank'],
                    'winner': None,
                },
            },
        })

    groups = {}
    for i in range(1, 5):
        groups[f'group{i}'] = {
            f'round{current_round}': {
                'roundMatchups': [],
                'progress': None,
            }
        }

    for i, matchup in enumerate(matchups):
        groups[f'group{(i % 4) + 1}'][f'round{current_round}']['roundMatchups'].append(matchup)

    return groups



openai.api_key = os.getenv("OPENAI_API_KEY")

def get_matchup_description(song_a, song_b, matchup_id):
    try:
        matchup_description = MatchupDescription.objects.get(matchup_id=matchup_id)
        return matchup_description.description
    except MatchupDescription.DoesNotExist:
        print(f'No description found for matchup_id: {matchup_id}. Generating new description.')

    print(song_a)
    print(song_b)
    messages = [
        {
            "role": "system",
            "content": "You are a music journalist who writes fun, short commentaries on these matchups."
        },
        {
            "role": "user",
            "content": f"Generate a short commentary for this matchup:\nSong A: '{song_a}'\nSong B: '{song_b}'"
        }
    ]

    response = openai.chat.completions.create(
        model="gpt-4-turbo",
        messages=messages,
        max_tokens=250,
    )

    commentary = response.choices[0].message.content
    MatchupDescription.objects.create(matchup_id=matchup_id, description=commentary, song_a=song_a, song_b=song_b)
    print(commentary)
    return commentary

def get_next_round_matchups(song_list=[], round_num=1):
    next_round = []
    for i in range(0, len(song_list), 2):
        if i + 1 < len(song_list):
            song1 = song_list[i]
            song2 = song_list[i+1]
            matchup = {
                'matchupId': f"{song1.id}{song2.id}",
                'round': round_num,
                'attributes': {
                    'matchupComplete': False,
                    'song1': {
                        'song': song1,
                        'groupRank': song1.rank,
                        'winner': None,
                    },
                    'song2': {
                        'song': song2,
                        'groupRank': song2.rank,
                        'winner': None,
                    },
                },
            }
            next_round.append(matchup)
    return next_round
