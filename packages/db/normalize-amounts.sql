-- Normalize money columns to grosz precision.
--
-- Rows migrated from Prisma (numeric(65,30)) carry sub-grosz dust, e.g. an
-- expense_debt with amount 93.150000000000010 against settled 93.150000000000000.
-- Such a debt is 0.00 zł in the UI but still matches `amount - settled > 0`,
-- so settling it sends amount "0.00" and the server rejects it as an
-- "Invalid settlement amount". The same dust also makes the rounded remaining
-- exceed the true remaining (85.709999999999990 -> "85.71").
--
-- Run once against each environment:
--   psql "$DATABASE_URL" -f packages/db/normalize-amounts.sql

BEGIN;

UPDATE expense SET amount = round(amount, 2) WHERE amount <> round(amount, 2);

UPDATE expense_log SET amount = round(amount, 2) WHERE amount <> round(amount, 2);

UPDATE expense_debt
SET amount = round(amount, 2), settled = round(settled, 2)
WHERE amount <> round(amount, 2) OR settled <> round(settled, 2);

-- Clamp over- and under-settled leftovers to a clean zero balance.
UPDATE expense_debt SET settled = amount WHERE settled <> amount AND abs(amount - settled) < 0.005;

COMMIT;
