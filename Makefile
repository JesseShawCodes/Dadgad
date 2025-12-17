start:
	docker-compose up -d

postgres-shell:
	docker-compose exec db psql -U shawjd -d madness
