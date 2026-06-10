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

dadgad-start:
	$(MAKE) -C services/dadgad dev

dadgad-stop:
	$(MAKE) -C services/dadgad stop

postgres-shell:
	docker compose exec db psql -U postgres -d maddness
