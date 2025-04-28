from django.contrib import admin
from django_celery_results.models import TaskResult

# Register your models here.

from . import models

class AppleAdmin(admin.ModelAdmin):
    list_display = ('auth',)

class ArtistAdmin(admin.ModelAdmin):
    list_display = ('artist_name','artist_id')

class TaskResultAdmin(admin.ModelAdmin):
    list_display = ('task_id', 'status', 'task_name', 'date_done', 'result')
    readonly_fields = ('task_id', 'status', 'task_name', 'date_done', 'result', 'traceback')
    ordering = ('-date_done',)

admin.site.register(models.AppleAuth, AppleAdmin)
admin.site.register(models.ArtistDetails, ArtistAdmin)