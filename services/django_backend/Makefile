.PHONY: start migrate setup update-requirements install

PYTHON=.venv/bin/python

setup: install migrate start

install:
	python3 -m venv .venv
	$(PYTHON) -m pip install --upgrade pip
	$(PYTHON) -m pip install -r requirements.txt

start: app-start

app-start:
	# Start Django and Celeryw
	$(MAKE) django-start &
	$(MAKE) celery

app-stop:
	@echo "Stopping Django development server..."
	-pkill -f "python manage.py runserver" || true
	@echo "Stopping Celery worker..."
	-pkill -f "celery -A madness_backend worker" || true

django-start:
	$(PYTHON) manage.py runserver

django-shell:
	$(PYTHON) manage.py shell -i ipython

python-start:
	$(PYTHON)

migrate:
	$(PYTHON) manage.py migrate

# django Shell
django-shell:
	$(PYTHON) manage.py shell

celery:
	.venv/bin/celery -A madness_backend worker -l info

test:
	$(PYTHON) manage.py test

test-coverage:
	coverage run manage.py test --keepdb
	coverage report

update-requirements:
	$(PYTHON) -m pip install --upgrade -r requirements.txt

# Ruff Lint
ruff-check:
	$(PYTHON) -m ruff check .

ruff-check-fix:
	$(PYTHON) -m ruff check --fix .

# venv
venv-create:
	python3 -m venv .venv

venv-activate:
	source .venv/bin/activate

venv-deactivate:
	deactivate
