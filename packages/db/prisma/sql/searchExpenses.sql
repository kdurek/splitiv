-- @param {String} $1:groupId
-- @param {String} $2:searchPattern
SELECT id, name, description, amount, "createdAt"
FROM "Expense"
WHERE "groupId" = $1
  AND (
    unaccent(lower(name)) LIKE $2
    OR unaccent(lower(COALESCE(description, ''))) LIKE $2
  )
ORDER BY "createdAt" DESC
