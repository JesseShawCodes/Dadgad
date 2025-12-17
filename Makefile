start:
	docker-compose up -d

stop:
	docker-compose down

postgres-shell:
	docker-compose exec db psql -U shawjd -d madness
