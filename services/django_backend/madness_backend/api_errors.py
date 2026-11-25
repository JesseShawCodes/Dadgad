"""Consistent API error response helpers."""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


def error_body(message, code=None):
    """Build a standard error payload: {error, code?}."""
    body = {"error": message}
    if code:
        body["code"] = code
    return body


def error_response(message, http_status=status.HTTP_400_BAD_REQUEST, code=None):
    """Return a DRF Response with the standard error shape."""
    return Response(error_body(message, code=code), status=http_status)


def exception_handler(exc, context):
    """Wrap DRF's handler so unhandled API exceptions use {error, code}."""
    response = drf_exception_handler(exc, context)
    if response is None:
        return None

    message = None
    if isinstance(response.data, dict):
        detail = response.data.get("detail")
        if detail is not None:
            message = str(detail)
        elif "error" in response.data and isinstance(response.data["error"], str):
            return response
        else:
            message = str(response.data)
    else:
        message = str(response.data)

    code = getattr(exc, "default_code", None) or "api_error"
    response.data = error_body(message, code=code)
    return response
