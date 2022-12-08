postgres-backup:
	docker exec --tty --interactive pgbackups /bin/sh -c "./backup.sh"
postgres-backup-fix:
	mkdir -p /usr/src/splitiv/pgbackups && chown -R 999:999 /usr/src/splitiv/pgbackups
postgres-restore:
	docker exec --tty --interactive pgbackups /bin/sh -c "zcat /backups/daily/splitiv-latest.sql.gz | psql --host=postgres --port=5432 --dbname=splitiv --username=splitiv --password"
