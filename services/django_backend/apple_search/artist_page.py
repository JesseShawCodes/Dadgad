'''Data Collection for artist page'''
import concurrent.futures
from django.core.cache import cache
from apple_search.auth import apple_request
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

    if not artist_details or not artist_details.get('name') or not artist_details.get('artist_id') or not artist_details.get('image_url'):
        return {"error": "Artist not found"}
    output['artist_name'] = artist_details['name']
    output['artist_id'] = int(artist_details['artist_id'])
    output['artist_image'] = format_image(artist_details['image_url'])
    if not albums or "errors" in albums:
        output['top_songs_list'] = add_weight_to_songs(
          songs,
          []
        )
    else:
        output['featured_albums'] = albums
        output['top_songs_list'] = add_weight_to_songs(songs, albums.get('data', []))
    
    # Cache result for 1 hour
    cache.set(cache_key, output, timeout=3600)
    return output

def get_artist_high_level_details(artist_id):
    '''Get High Level Artist Details including name and image URL'''
    artist = apple_request(f"artists/{artist_id}")
    if not artist or not artist.get('data'):
        return {}
    if not artist['data'][0].get('attributes'):
        return {}
    artist_data = artist['data'][0]['attributes']
    if not artist_data.get('name') or not artist_data.get('artwork') or not artist_data['artwork'].get('url') or not artist['data'][0].get('id'):
        return {}
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
        if song.get('type') == 'music-videos':
            continue
        sid = song.get('id')
        if sid and sid not in seen:
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
    if playlists and "errors" not in playlists:
        for item in playlists.get('data', []):
            if item.get('id') and item.get('attributes') and item['attributes'].get('name') and check_substrings(
                item['attributes']['name'],
                ['Essentials', 'Deep Cuts', 'Set List']
              ):
                artist_playlist_ids.append(item['id'])
    # Get Multiple playlists
    if not artist_playlist_ids:
        return []
    playlists_content = apple_request(f'playlists?ids={",".join(artist_playlist_ids)}')
    if playlists_content and playlists_content.get('data'):
        for song_list in playlists_content.get('data', []):
            if song_list.get('relationships') and song_list['relationships'].get('tracks') and song_list['relationships']['tracks'].get('data'):
                for song in song_list['relationships']['tracks']['data']:
                    top_songs_list.append(song)
    # loop by intervals of 10
    for page in range(0,100,10):
        request = apple_request(f'artists/{artist_id}/view/top-songs?offset={page}')
        if not request or 'errors' in request.keys():
            break
        for song in request.get('data', []):
            top_songs_list.append(song)

    # Remove duplicates
    return dedupe_songs(top_songs_list)

def featured_album_details(artist_id):
    """Get featured album details for an artist"""
    return apple_request(f"artists/{artist_id}/view/featured-albums")

def add_weight_to_songs(songs_list, albums_list):
    """Rank songs and mark if they are in featured albums"""
    albums_name_list = {album['attributes']['name'] for album in albums_list if album and album.get('attributes') and album['attributes'].get('name')}
    for idx, song in enumerate(songs_list):
        song['rank'] = idx + 1
        if song.get('attributes') and song['attributes'].get('albumName'):
            song['featured_album'] = song['attributes']['albumName'] in albums_name_list
    return songs_list
