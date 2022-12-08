postgres-backup:
	docker exec --tty --interactive pgbackups /bin/sh -c "./backup.sh"

postgres-restore:
	docker exec --tty --interactive pgbackups /bin/sh -c "zcat /backups/daily/splitiv-latest.sql.gz | psql --host=postgres --port=5432 --dbname=splitiv --username=splitiv --password"
