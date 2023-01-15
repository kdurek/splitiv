include .env

deploy:
	docker compose -f docker-compose.yml -f docker-compose.production.yml up -d && docker system prune -a && docker compose -f docker-compose.yml -f docker-compose.production.yml down && git pull && pnpm build && docker compose -f docker-compose.yml -f docker-compose.production.yml up -d
postgres-backup:
	docker exec --tty --interactive pgbackups /bin/sh -c "./backup.sh"
postgres-backup-fix:
	mkdir -p /usr/src/splitiv/pgbackups && chown -R 999:999 /usr/src/splitiv/pgbackups
postgres-restore:
	docker exec --tty --interactive pgbackups /bin/sh -c "zcat /backups/daily/splitiv-latest.sql.gz | psql --host=${DB_HOST} --port=${DB_PORT} --dbname=${DB_NAME} --username=${DB_USER} --password"
