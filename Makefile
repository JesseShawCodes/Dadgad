.PHONY: setup docker-start docker-stop colima-start colima-stop colima-stop-force \
	django-start django-stop django-migrate django-test django-pytest \
	django-ruff-check django-ruff-check-fix \
	dadgad-start dadgad-stop dadgad-test dadgad-lint postgres-shell

# First-time local setup: env template + infra + backend install/migrate
setup:
	@test -f .env || cp .env.example .env
	@echo "Edit .env with Apple Music credentials, DJANGO_SECRET_KEY, and PGADMIN_* values."
	$(MAKE) docker-start
	$(MAKE) -C services/django_backend install
	$(MAKE) django-migrate
	@echo "Setup complete. Run: make django-start  and  make dadgad-start"

docker-start:
	docker compose up -d

docker-stop:
	docker compose down

colima-start:
	colima start --memory 16

colima-stop:
	colima stop

colima-stop-force:
	colima stop --force

django-start:
	$(MAKE) -C services/django_backend app-start

django-stop:
	$(MAKE) -C services/django_backend app-stop

django-migrate:
	$(MAKE) -C services/django_backend migrate

django-test:
	$(MAKE) -C services/django_backend test

django-pytest:
	$(MAKE) -C services/django_backend pytest

django-ruff-check:
	$(MAKE) -C services/django_backend ruff-check

django-ruff-check-fix:
	$(MAKE) -C services/django_backend ruff-check-fix

dadgad-start:
	$(MAKE) -C services/dadgad dev

dadgad-stop:
	$(MAKE) -C services/dadgad stop

dadgad-test:
	$(MAKE) -C services/dadgad test

dadgad-lint:
	$(MAKE) -C services/dadgad lint

postgres-shell:
	docker compose exec db psql -U postgres -d maddness
