One remaining step you need to run manually in your database:

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

These can't be expressed cleanly in Drizzle schema (operator classes on functional expressions), so they live outside Drizzle's tracking. Run them once against your database via psql or your DB client.
