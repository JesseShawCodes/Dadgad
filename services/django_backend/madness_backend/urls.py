"""
URL configuration for madness_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from apple_search.views import artist_search_view, artist_page_view, task_status_view, hello_ai, create_matchups_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('artist', artist_search_view),
    path('artist-page/<str:artist_name>', artist_page_view),
    path('artist/matchups', create_matchups_view),
    path("open_ai/test", hello_ai),

    # Task Status checks
    path('api/task-status', task_status_view, name='task-status')
]
