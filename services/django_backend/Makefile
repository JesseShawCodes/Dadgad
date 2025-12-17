.PHONY: start migrate setup

PYTHON=.venv/bin/python

setup: migrate start

django-start:
	$(PYTHON) manage.py runserver

migrate:
	$(PYTHON) manage.py migrate

celery:
	celery -A madness_backend worker -l info