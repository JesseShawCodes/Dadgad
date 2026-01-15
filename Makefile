start:
	docker-compose up -d

stop:
	docker-compose down

stop-dadgad:
	@echo "Stopping all Dadgad processes"
	-@kill -9 $$(lsof -ti :3000) 2>/dev/null || true
	-@kill -9 $$(lsof -ti :5432) 2>/dev/null || true
	-@kill -9 $$(lsof -ti :6379) 2>/dev/null || true
	-@kill -9 $$(lsof -ti :8000) 2>/dev/null || true
	-@kill -9 $$(lsof -ti :8888) 2>/dev/null || true
	
	@echo "Stopping django backend (celery & django)"
	$(MAKE) -C services/django_backend app-stop &

	@echo "Stopping frontend (Next.js)"
	$(MAKE) -C services/dadgad stop &

	@echo "Stopping docker containers (redis, database, php - admin)"
	docker-compose down

postgres-shell:
	docker-compose exec db psql -U shawjd -d madness

dadgad: 
	@echo "Starting all Dadgad processes"
	@echo "Forcibly freeing up ports..."
	-@kill -9 $$(lsof -ti :3000) 2>/dev/null || true
	-@kill -9 $$(lsof -ti :5432) 2>/dev/null || true
	-@kill -9 $$(lsof -ti :6379) 2>/dev/null || true
	-@kill -9 $$(lsof -ti :8000) 2>/dev/null || true
	-@kill -9 $$(lsof -ti :8888) 2>/dev/null || true
	@echo "Starting docker containers..."
	docker-compose up -d
	@echo "Starting django backend..."
	$(MAKE) -C services/django_backend app-start &
	@echo "Starting dadgad frontend..."
	$(MAKE) -C services/dadgad dev
