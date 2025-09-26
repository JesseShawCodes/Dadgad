from celery import shared_task
from apple_search.artist_search import artist_search
import time

@shared_task
def fetch_artist_data(artist_name):
  res = artist_search(artist_name)
  time.sleep(2)
  return res
