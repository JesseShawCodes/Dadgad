"""API Views. Serialize various data"""

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.generics import ListAPIView
from rest_framework.filters import SearchFilter
from rest_framework.pagination import LimitOffsetPagination
from rest_framework import serializers
from apple_search.serializer import AppleSerializer

from apple_search.models import AppleAuth


class AppleAuthPagination(LimitOffsetPagination):
    """Apple Auth Pagination"""

    default_limit = 10
    max_limit = 100


class AppleAuthListView(ListAPIView):
    """Apple Auth List View"""

    queryset = AppleAuth.objects.all()
    serializer_class = AppleSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["id"]
    search_fields = ["auth"]
    pagination_class = AppleAuthPagination


class ArtistListView(serializers.Serializer):
    """Artist List View"""

    field_1 = serializers.CharField()
    field_2 = serializers.IntegerField()
