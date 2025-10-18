from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import logging
from apple_search.artist_page import artist_content
from apple_search.tasks import fetch_artist_data
from apple_search.artist_search import artist_search
from apple_search.bracket_generation import create_matchups

from celery.result import AsyncResult

import openai
import os

# Get an instance of a logger
logger = logging.getLogger(__name__)

openai.api_key = os.getenv("OPENAI_API_KEY")

def hello_ai(request):
  response = openai.chat.completions.create(
    model="gpt-5-nano",
    messages=[
      {"role": "system", "content": "You are a helpful announcer."},
      {"role": "user", "content": "Say Hello World in a fun sports commentator style."}
    ],
    max_completion_tokens=3000
  )

  message = response.choices[0].message.content.strip()

  return JsonResponse({"ai_reply": message})

def artist_search_view(request):
    data = request.GET.get('q', '')
    # Potential task functions / returns
    task = fetch_artist_data.delay(data)
    return JsonResponse({"task_id": task.id, "status": "queued"})

def artist_page_view(request, artist_name):
    artist_name = artist_name.replace('-', ' ')
    search_results = artist_search(artist_name)
    artist_id = None
    if search_results.get('results') and search_results['results'].get('artists') and search_results['results']['artists'].get('data'):
        for artist in search_results['results']['artists']['data']:
            if artist['attributes']['name'] == artist_name:
                artist_id = artist['id']
                break
    
    if artist_id:
        data = artist_content(artist_id)
    else:
        data = {"error": "Artist not found"}

    return JsonResponse(data)

def task_status_view(request):
  task_id = request.GET.get('q')
  result = AsyncResult(task_id)

  response_data = {
      "status": result.status,
      "request_id": task_id
  }

  if result.ready():
     if result.successful():
         response_data['result'] = result.result
     else:
         response_data['error'] = str(result.result)
  
  return JsonResponse(response_data)

@csrf_exempt
def create_matchups_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            arr = data.get('songs')
            matchup_round = data.get('matchupRound')
            current_round = data.get('currentRound')

            if arr is None or matchup_round is None or current_round is None:
                logger.error(f"Missing parameters. arr: {arr}, matchup_round: {matchup_round}, current_round: {current_round}")
                return JsonResponse({'error': 'Missing required parameters'}, status=400)

            matchups = create_matchups(arr, matchup_round, current_round)
            return JsonResponse(matchups)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON: {e}")
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)

@csrf_exempt
def create_nextround_matchups(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            bracket = data.get('bracket')
            current_round = data.get('currentRound')
            next_round = data.get('nextRound')

            if bracket is None or next_round is None or current_round is None:
                logger.error(f"Missing parameters. bracket: {bracket}, next_round: {next_round}, current_round: {current_round}")
                return JsonResponse({'error': 'Missing required parameters'}, status=400)
            
            return JsonResponse({"matchups": "TEST 1, 2, 3"})
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON: {e}")
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)