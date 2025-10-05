# madness_backend/celery.py
import os
from celery import Celery

# CRITICAL: This line must match your project's structure
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'madness_backend.settings')

app = Celery('madness_backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
