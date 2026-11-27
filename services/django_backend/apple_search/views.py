from django.http import JsonResponse
from apple_search.artist_page import artist_content, get_artist_id_by_name
from apple_search.tasks import fetch_artist_data

from celery.result import AsyncResult


def _error(message, status=400, code=None):
    body = {"error": message}
    if code:
        body["code"] = code
    return JsonResponse(body, status=status)


def artist_search_view(request):
    data = request.GET.get("q", "")
    if not data.strip():
        return _error("q is required", status=400, code="validation_error")
    task = fetch_artist_data.delay(data)
    return JsonResponse({"task_id": task.id, "status": "queued"})


def artist_page_view(request, artist_name):
    artist_id = get_artist_id_by_name(artist_name)

    if not artist_id:
        return _error("Artist not found", status=404, code="artist_not_found")

    data = artist_content(artist_id)
    if isinstance(data, dict) and data.get("error"):
        return _error(
            data["error"],
            status=404,
            code="artist_not_found",
        )
    return JsonResponse(data)


def task_status_view(request):
    task_id = request.GET.get("q")
    if not task_id:
        return _error("q (task id) is required", status=400, code="validation_error")

    result = AsyncResult(task_id)
    response_data = {"status": result.status, "request_id": task_id}

    if result.ready():
        if result.successful():
            response_data["result"] = result.result
        else:
            err = result.result
            response_data["error"] = str(err)
            response_data["code"] = "task_failed"

    return JsonResponse(response_data)
