from django.urls import path
from .views import SessionHandshakeView

urlpatterns = [
    path('handshake', SessionHandshakeView.as_view(), name='session-handshake'),
]
