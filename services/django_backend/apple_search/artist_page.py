'''Data Collection for artist page'''
import os
import requests
import concurrent.futures
from django.core.cache import cache
from apple_search.auth import get_auth_token, get_newest_auth, apple_request
from apple_search.artist_search import format_image

def artist_content(artist_id):
    '''Final render of output to the page'''
    cache_key = f"artist_page:{artist_id}"
    cached = cache.get(cache_key)
    if cached:
        return cached
    output = {}
    with concurrent.futures.ThreadPoolExecutor() as executer:
        future_artist = executer.submit(get_artist_high_level_details, artist_id)
        future_albums = executer.submit(featured_album_details, artist_id)
        future_songs = executer.submit(top_songs_list_builder, artist_id)
        
        artist_details = future_artist.result()
        albums = future_albums.result()
        songs = future_songs.result()

    output['artist_name'] = artist_details['name']
    output['artist_id'] = int(artist_details['artist_id'])
    output['artist_image'] = format_image(artist_details['image_url'])
    if "errors" in albums:
        output['top_songs_list'] = add_weight_to_songs(
          songs,
          []
        )
    else:
        output['featured_albums'] = albums
        output['top_songs_list'] = add_weight_to_songs(songs, albums['data'])
    
    # Cache result for 1 hour
    cache.set(cache_key, output, timeout=3600)
    return output

def get_artist_high_level_details(artist_id):
    '''Get High Level Artist Details including name and image URL'''
    artist = apple_request(f"artists/{artist_id}")
    artist_data = artist['data'][0]['attributes']
    '''Both name and image_url should be strings'''
    return {
        'name': artist_data['name'],
        'image_url': artist_data['artwork']['url'],
        'artist_id': artist['data'][0]['id']
    }

def dedupe_songs(songs):
    """Remove duplicates efficiently using a set"""
    seen = set()
    final = []
    for song in songs:
        if song['type'] == 'music-videos':
            continue
        sid = song['id']
        if sid not in seen:
            seen.add(sid)
            final.append(song)
    return final

def check_substrings(string, substrings):
    '''Substring check. Used to filter out playlists that do not have useful data.'''
    return any(sub in string for sub in substrings)

def top_songs_list_builder(artist_id):
    '''Create top songs list'''
    top_songs_list = []
    playlists = apple_request(f"artists/{artist_id}/view/featured-playlists")
    artist_playlist_ids = []
    if "errors" not in playlists:
        for item in playlists['data']:
            if check_substrings(
                item['attributes']['name'],
                ['Essentials', 'Deep Cuts', 'Set List']
              ):
                artist_playlist_ids.append(item['id'])
    # Get Multiple playlists
    playlists_content = apple_request(f'playlists?ids={",".join(artist_playlist_ids)}')
    for song_list in playlists_content['data']:
        for song in song_list['relationships']['tracks']['data']:
            top_songs_list.append(song)
    # loop by intervals of 10
    for page in range(0,100,10):
        request = apple_request(f'artists/{artist_id}/view/top-songs?offset={page}')
        if 'errors' in request.keys():
            break
        for song in request['data']:
            top_songs_list.append(song)

    # Remove duplicates
    return dedupe_songs(top_songs_list)

def featured_album_details(artist_id):
    """Get featured album details for an artist"""
    return apple_request(f"artists/{artist_id}/view/featured-albums")

def add_weight_to_songs(songs_list, albums_list):
    """Rank songs and mark if they are in featured albums"""
    albums_name_list = {album['attributes']['name'] for album in albums_list}
    for idx, song in enumerate(songs_list):
        song['rank'] = idx + 1
        song['featured_album'] = song['attributes']['albumName'] in albums_name_list
    return songs_list
