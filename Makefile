start:
	docker-compose up -d

stop:
	docker-compose down

postgres-shell:
	docker-compose exec db psql -U shawjd -d madness

dadgad: 
	@echo "Starting all Dadgad processes"
	@echo "Starting docker containers..."
	docker-compose up -d
	@echo "Starting django backend..."
	$(MAKE) -C services/django_backend app-start &
	@echo "Starting dadgad frontend..."
	$(MAKE) -C services/dadgad dev
