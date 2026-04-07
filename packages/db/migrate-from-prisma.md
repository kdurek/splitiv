The DB has both "User" (Prisma) and "user" (Drizzle) — likely the initial drizzle-kit setup ran before the restore. Let's check what tables actually exist:

docker compose exec db psql -U postgres -d splitiv -c "\dt"

This will tell us exactly what's there. Then we can do a proper clean restore:

docker compose exec db psql -U postgres -c "DROP DATABASE splitiv WITH (FORCE);"
docker compose exec db psql -U postgres -c "CREATE DATABASE splitiv;"
docker compose exec -T db pg_restore -U postgres -d splitiv -v < backup.dmp

Then verify only Prisma tables exist before running the rename:

docker compose exec db psql -U postgres -d splitiv -c "\dt"

You should see only User, Session, Account, etc. (PascalCase). Then run the rename:

docker compose exec -T db psql -U postgres -d splitiv < packages/db/migrate-from-prisma.sql
