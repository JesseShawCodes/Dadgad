.PHONY: start migrate setup update-requirements

PYTHON=.venv/bin/python

setup: migrate start

app-start:
	$(MAKE) django-start &
	$(MAKE) celery

django-start:
	$(PYTHON) manage.py runserver

migrate:
	$(PYTHON) manage.py migrate

celery:
	.venv/bin/celery -A madness_backend worker -l info

update-requirements:
	$(PYTHON) -m pip install --upgrade -r requirements.txt