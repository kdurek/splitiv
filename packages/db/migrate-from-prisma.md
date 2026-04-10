```
docker compose down && rm -rf .docker/db && docker compose up -d
docker compose exec -T db pg_restore -U postgres -d splitiv -v < .docker/backup.dmp
docker compose exec -T db psql -U postgres -d splitiv < packages/db/migrate-from-prisma.sql
```

The SQL script handles the full Prisma → Drizzle snake_case migration in one transaction:
renames tables, columns, indexes, drops Prisma artifacts, fixes column types, and recreates FK constraints.
After running it, `pnpm db push` should report no changes.
