from celery import shared_task
from apple_search.artist_search import artist_search


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=60,
    retry_jitter=True,
    retry_kwargs={"max_retries": 3},
    soft_time_limit=30,
    time_limit=45,
)
def fetch_artist_data(self, artist_name):
    """Fetch artist search results with bounded retries on failure."""
    return artist_search(artist_name)
