from django.http import JsonResponse
from apple_search.artist_page import artist_content
from apple_search.tasks import fetch_artist_data

from celery.result import AsyncResult

def artist_search_view(request):
    data = request.GET.get('q', '')
    # Potential task functions / returns
    task = fetch_artist_data.delay(data)
    return JsonResponse({"task_id": task.id, "status": "queued"})

def artist_page_view(request, artist_id):
    data = {
        "artist_id": artist_id
    }
    data = artist_content(artist_id)
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
