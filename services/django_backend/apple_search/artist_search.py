'''Search functions to perform the initial artist search from the application search page.'''
import os
import requests
import json
from django.http import JsonResponse
from apple_search.auth import get_auth_token, get_newest_auth

def artist_search(artist_name):
    '''Search for Artist Function'''
    headers = {'Authorization': f"Bearer  {get_newest_auth()}"}
    r = requests.get(
          f"{os.environ['apple_search_url']}{artist_name}&types=artists&limit=20",
          headers=headers,
          timeout=5
        )
    if r.status_code != 200:
        headers = {'Authorization': f"Bearer  {get_auth_token()}"}
        r = requests.get(f"{os.environ['apple_search_url']}{artist_name}&types=artists&limit=20",
                        headers=headers,
                        timeout=5
                      )
    
    result1 = r.json()
    if result1.get('results') and result1['results'].get('artists') and result1['results']['artists'].get('data'):
      for result in result1['results']['artists']['data']:
          if "artwork" in result['attributes']:
            formatted_url = result['attributes']['artwork']['url']
            result['attributes']['artwork']['url'] = format_image(formatted_url)
    return result1

def format_image(url):
    formatted_url = url.replace('{w}', "400")
    formatted_url = formatted_url.replace('{h}', "400")
    return formatted_url
    
    
