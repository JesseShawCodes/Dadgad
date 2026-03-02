.PHONY: start migrate setup update-requirements

PYTHON=.venv/bin/python

setup: migrate start

app-start:
	$(MAKE) django-start &
	$(MAKE) celery

app-stop:
	@echo "Stopping Django development server..."
	-pkill -f "python manage.py runserver" || true
	@echo "Stopping Celery worker..."
	-pkill -f "celery -A madness_backend worker" || true

django-start:
	$(PYTHON) manage.py runserver

python-start:
	$(PYTHON)

migrate:
	$(PYTHON) manage.py migrate

celery:
	.venv/bin/celery -A madness_backend worker -l info

test:
	$(PYTHON) manage.py test

update-requirements:
	$(PYTHON) -m pip install --upgrade -r requirements.txt
