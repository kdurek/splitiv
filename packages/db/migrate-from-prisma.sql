BEGIN;

-- ============================================================
-- PHASE 1: Prisma → Drizzle (PascalCase tables, camelCase columns)
-- Equivalent to what `pnpm db push` did with the camelCase schema
-- ============================================================

-- Drop Prisma migration history table
DROP TABLE "_prisma_migrations";

-- Fix column types: timestamp(3) → timestamp, numeric(65,30) → numeric
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DATA TYPE timestamp USING "createdAt"::timestamp;
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT now();
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp USING "updatedAt"::timestamp;
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DEFAULT now();

ALTER TABLE "Group" ALTER COLUMN "createdAt" SET DATA TYPE timestamp USING "createdAt"::timestamp;
ALTER TABLE "Group" ALTER COLUMN "createdAt" SET DEFAULT now();
ALTER TABLE "Group" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp USING "updatedAt"::timestamp;
ALTER TABLE "Group" ALTER COLUMN "updatedAt" SET DEFAULT now();

ALTER TABLE "Expense" ALTER COLUMN "amount" SET DATA TYPE numeric USING "amount"::numeric;
ALTER TABLE "Expense" ALTER COLUMN "createdAt" SET DATA TYPE timestamp USING "createdAt"::timestamp;
ALTER TABLE "Expense" ALTER COLUMN "createdAt" SET DEFAULT now();
ALTER TABLE "Expense" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp USING "updatedAt"::timestamp;
ALTER TABLE "Expense" ALTER COLUMN "updatedAt" SET DEFAULT now();

ALTER TABLE "ExpenseDebt" ALTER COLUMN "amount" SET DATA TYPE numeric USING "amount"::numeric;
ALTER TABLE "ExpenseDebt" ALTER COLUMN "settled" SET DATA TYPE numeric USING "settled"::numeric;
ALTER TABLE "ExpenseDebt" ALTER COLUMN "createdAt" SET DATA TYPE timestamp USING "createdAt"::timestamp;
ALTER TABLE "ExpenseDebt" ALTER COLUMN "createdAt" SET DEFAULT now();
ALTER TABLE "ExpenseDebt" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp USING "updatedAt"::timestamp;
ALTER TABLE "ExpenseDebt" ALTER COLUMN "updatedAt" SET DEFAULT now();

ALTER TABLE "ExpenseLog" ALTER COLUMN "amount" SET DATA TYPE numeric USING "amount"::numeric;
ALTER TABLE "ExpenseLog" ALTER COLUMN "createdAt" SET DATA TYPE timestamp USING "createdAt"::timestamp;
ALTER TABLE "ExpenseLog" ALTER COLUMN "createdAt" SET DEFAULT now();
ALTER TABLE "ExpenseLog" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp USING "updatedAt"::timestamp;
ALTER TABLE "ExpenseLog" ALTER COLUMN "updatedAt" SET DEFAULT now();

ALTER TABLE "Session" ALTER COLUMN "expiresAt" SET DATA TYPE timestamp USING "expiresAt"::timestamp;
ALTER TABLE "Session" ALTER COLUMN "createdAt" SET DATA TYPE timestamp USING "createdAt"::timestamp;
ALTER TABLE "Session" ALTER COLUMN "createdAt" SET DEFAULT now();
ALTER TABLE "Session" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp USING "updatedAt"::timestamp;

ALTER TABLE "Account" ALTER COLUMN "accessTokenExpiresAt" SET DATA TYPE timestamp USING "accessTokenExpiresAt"::timestamp;
ALTER TABLE "Account" ALTER COLUMN "refreshTokenExpiresAt" SET DATA TYPE timestamp USING "refreshTokenExpiresAt"::timestamp;
ALTER TABLE "Account" ALTER COLUMN "createdAt" SET DATA TYPE timestamp USING "createdAt"::timestamp;
ALTER TABLE "Account" ALTER COLUMN "createdAt" SET DEFAULT now();
ALTER TABLE "Account" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp USING "updatedAt"::timestamp;

ALTER TABLE "Verification" ALTER COLUMN "expiresAt" SET DATA TYPE timestamp USING "expiresAt"::timestamp;
ALTER TABLE "Verification" ALTER COLUMN "createdAt" SET DATA TYPE timestamp USING "createdAt"::timestamp;
ALTER TABLE "Verification" ALTER COLUMN "createdAt" SET DEFAULT now();
ALTER TABLE "Verification" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp USING "updatedAt"::timestamp;
ALTER TABLE "Verification" ALTER COLUMN "updatedAt" SET DEFAULT now();

-- Replace Prisma unique indexes with proper named constraints
DROP INDEX "Session_token_key";
DROP INDEX "User_email_key";
ALTER TABLE "Session" ADD CONSTRAINT "Session_token_key" UNIQUE("token");
ALTER TABLE "User" ADD CONSTRAINT "User_email_key" UNIQUE("email");

-- Replace Prisma FK constraints with Drizzle-named ones and correct ON DELETE behavior
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_User_id_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_User_id_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "Expense" DROP CONSTRAINT "Expense_groupId_fkey";
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_groupId_Group_id_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE;
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_payerId_fkey";
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_payerId_User_id_fkey" FOREIGN KEY ("payerId") REFERENCES "User"("id") ON DELETE RESTRICT;

ALTER TABLE "ExpenseDebt" DROP CONSTRAINT "ExpenseDebt_expenseId_fkey";
ALTER TABLE "ExpenseDebt" ADD CONSTRAINT "ExpenseDebt_expenseId_Expense_id_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE CASCADE;
ALTER TABLE "ExpenseDebt" DROP CONSTRAINT "ExpenseDebt_debtorId_fkey";
ALTER TABLE "ExpenseDebt" ADD CONSTRAINT "ExpenseDebt_debtorId_User_id_fkey" FOREIGN KEY ("debtorId") REFERENCES "User"("id") ON DELETE RESTRICT;

ALTER TABLE "ExpenseLog" DROP CONSTRAINT "ExpenseLog_debtId_fkey";
ALTER TABLE "ExpenseLog" ADD CONSTRAINT "ExpenseLog_debtId_ExpenseDebt_id_fkey" FOREIGN KEY ("debtId") REFERENCES "ExpenseDebt"("id") ON DELETE CASCADE;

ALTER TABLE "PushSubscription" DROP CONSTRAINT "PushSubscription_userId_fkey";
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_User_id_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "UserGroup" DROP CONSTRAINT "UserGroup_userId_fkey";
ALTER TABLE "UserGroup" ADD CONSTRAINT "UserGroup_userId_User_id_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT;
ALTER TABLE "UserGroup" DROP CONSTRAINT "UserGroup_groupId_fkey";
ALTER TABLE "UserGroup" ADD CONSTRAINT "UserGroup_groupId_Group_id_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE;

-- Create indexes missing from the Prisma schema
CREATE INDEX "Expense_groupId_idx" ON "Expense" ("groupId");
CREATE INDEX "Expense_payerId_idx" ON "Expense" ("payerId");
CREATE INDEX "ExpenseDebt_expenseId_idx" ON "ExpenseDebt" ("expenseId");
CREATE INDEX "ExpenseDebt_debtorId_idx" ON "ExpenseDebt" ("debtorId");
CREATE INDEX "ExpenseLog_debtId_idx" ON "ExpenseLog" ("debtId");
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription" ("userId");


-- ============================================================
-- PHASE 2: PascalCase → snake_case (rename tables and columns)
-- Equivalent to what `pnpm db push` would do with the snake_case schema
-- ============================================================

-- Drop FK constraints before renaming (required by Postgres)
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_User_id_fkey";
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_User_id_fkey";
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_groupId_Group_id_fkey";
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_payerId_User_id_fkey";
ALTER TABLE "ExpenseDebt" DROP CONSTRAINT "ExpenseDebt_expenseId_Expense_id_fkey";
ALTER TABLE "ExpenseDebt" DROP CONSTRAINT "ExpenseDebt_debtorId_User_id_fkey";
ALTER TABLE "ExpenseLog" DROP CONSTRAINT "ExpenseLog_debtId_ExpenseDebt_id_fkey";
ALTER TABLE "PushSubscription" DROP CONSTRAINT "PushSubscription_userId_User_id_fkey";
ALTER TABLE "UserGroup" DROP CONSTRAINT "UserGroup_userId_User_id_fkey";
ALTER TABLE "UserGroup" DROP CONSTRAINT "UserGroup_groupId_Group_id_fkey";

-- Drop unique constraints (will recreate with snake_case names)
ALTER TABLE "Session" DROP CONSTRAINT "Session_token_key";
ALTER TABLE "User" DROP CONSTRAINT "User_email_key";

-- Drop all indexes (will recreate with snake_case names)
DROP INDEX IF EXISTS "Account_userId_idx";
DROP INDEX IF EXISTS "Session_userId_idx";
DROP INDEX IF EXISTS "Verification_identifier_idx";
DROP INDEX "Expense_groupId_idx";
DROP INDEX "Expense_payerId_idx";
DROP INDEX "ExpenseDebt_expenseId_idx";
DROP INDEX "ExpenseDebt_debtorId_idx";
DROP INDEX "ExpenseLog_debtId_idx";
DROP INDEX "PushSubscription_userId_idx";

-- Rename tables
ALTER TABLE "User" RENAME TO "user";
ALTER TABLE "Session" RENAME TO "session";
ALTER TABLE "Account" RENAME TO "account";
ALTER TABLE "Verification" RENAME TO "verification";
ALTER TABLE "Group" RENAME TO "group";
ALTER TABLE "Expense" RENAME TO "expense";
ALTER TABLE "ExpenseDebt" RENAME TO "expense_debt";
ALTER TABLE "ExpenseLog" RENAME TO "expense_log";
ALTER TABLE "PushSubscription" RENAME TO "push_subscription";
ALTER TABLE "UserGroup" RENAME TO "user_group";

-- Rename primary key
ALTER INDEX "UserGroup_pkey" RENAME TO "user_group_pkey";

-- Rename columns: user
ALTER TABLE "user" RENAME COLUMN "emailVerified" TO "email_verified";
ALTER TABLE "user" RENAME COLUMN "firstName" TO "first_name";
ALTER TABLE "user" RENAME COLUMN "lastName" TO "last_name";
ALTER TABLE "user" RENAME COLUMN "activeGroupId" TO "active_group_id";
ALTER TABLE "user" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "user" RENAME COLUMN "updatedAt" TO "updated_at";

-- Rename columns: session
ALTER TABLE "session" RENAME COLUMN "expiresAt" TO "expires_at";
ALTER TABLE "session" RENAME COLUMN "ipAddress" TO "ip_address";
ALTER TABLE "session" RENAME COLUMN "userAgent" TO "user_agent";
ALTER TABLE "session" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "session" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "session" RENAME COLUMN "updatedAt" TO "updated_at";

-- Rename columns: account
ALTER TABLE "account" RENAME COLUMN "accountId" TO "account_id";
ALTER TABLE "account" RENAME COLUMN "providerId" TO "provider_id";
ALTER TABLE "account" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "account" RENAME COLUMN "accessToken" TO "access_token";
ALTER TABLE "account" RENAME COLUMN "refreshToken" TO "refresh_token";
ALTER TABLE "account" RENAME COLUMN "idToken" TO "id_token";
ALTER TABLE "account" RENAME COLUMN "accessTokenExpiresAt" TO "access_token_expires_at";
ALTER TABLE "account" RENAME COLUMN "refreshTokenExpiresAt" TO "refresh_token_expires_at";
ALTER TABLE "account" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "account" RENAME COLUMN "updatedAt" TO "updated_at";

-- Rename columns: verification
ALTER TABLE "verification" RENAME COLUMN "expiresAt" TO "expires_at";
ALTER TABLE "verification" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "verification" RENAME COLUMN "updatedAt" TO "updated_at";

-- Rename columns: group
ALTER TABLE "group" RENAME COLUMN "adminId" TO "admin_id";
ALTER TABLE "group" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "group" RENAME COLUMN "updatedAt" TO "updated_at";

-- Rename columns: expense
ALTER TABLE "expense" RENAME COLUMN "groupId" TO "group_id";
ALTER TABLE "expense" RENAME COLUMN "payerId" TO "payer_id";
ALTER TABLE "expense" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "expense" RENAME COLUMN "updatedAt" TO "updated_at";

-- Rename columns: expense_debt
ALTER TABLE "expense_debt" RENAME COLUMN "expenseId" TO "expense_id";
ALTER TABLE "expense_debt" RENAME COLUMN "debtorId" TO "debtor_id";
ALTER TABLE "expense_debt" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "expense_debt" RENAME COLUMN "updatedAt" TO "updated_at";

-- Rename columns: expense_log
ALTER TABLE "expense_log" RENAME COLUMN "debtId" TO "debt_id";
ALTER TABLE "expense_log" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "expense_log" RENAME COLUMN "updatedAt" TO "updated_at";

-- Rename columns: push_subscription
ALTER TABLE "push_subscription" RENAME COLUMN "userId" TO "user_id";

-- Rename columns: user_group
ALTER TABLE "user_group" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "user_group" RENAME COLUMN "groupId" TO "group_id";

-- Add unique constraints with snake_case names
ALTER TABLE "user" ADD CONSTRAINT "user_email_unique" UNIQUE("email");
ALTER TABLE "session" ADD CONSTRAINT "session_token_unique" UNIQUE("token");

-- Recreate FK constraints with snake_case names
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
ALTER TABLE "expense" ADD CONSTRAINT "expense_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE;
ALTER TABLE "expense" ADD CONSTRAINT "expense_payer_id_user_id_fk" FOREIGN KEY ("payer_id") REFERENCES "user"("id") ON DELETE RESTRICT;
ALTER TABLE "expense_debt" ADD CONSTRAINT "expense_debt_expense_id_expense_id_fk" FOREIGN KEY ("expense_id") REFERENCES "expense"("id") ON DELETE CASCADE;
ALTER TABLE "expense_debt" ADD CONSTRAINT "expense_debt_debtor_id_user_id_fk" FOREIGN KEY ("debtor_id") REFERENCES "user"("id") ON DELETE RESTRICT;
ALTER TABLE "expense_log" ADD CONSTRAINT "expense_log_debt_id_expense_debt_id_fk" FOREIGN KEY ("debt_id") REFERENCES "expense_debt"("id") ON DELETE CASCADE;
ALTER TABLE "push_subscription" ADD CONSTRAINT "push_subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
ALTER TABLE "user_group" ADD CONSTRAINT "user_group_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT;
ALTER TABLE "user_group" ADD CONSTRAINT "user_group_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE;

-- Recreate indexes with snake_case names
CREATE INDEX "account_userId_idx" ON "account" ("user_id");
CREATE INDEX "session_userId_idx" ON "session" ("user_id");
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");
CREATE INDEX "expense_group_id_idx" ON "expense" ("group_id");
CREATE INDEX "expense_payer_id_idx" ON "expense" ("payer_id");
CREATE INDEX "expense_debt_expense_id_idx" ON "expense_debt" ("expense_id");
CREATE INDEX "expense_debt_debtor_id_idx" ON "expense_debt" ("debtor_id");
CREATE INDEX "expense_log_debt_id_idx" ON "expense_log" ("debt_id");
CREATE INDEX "push_subscription_user_id_idx" ON "push_subscription" ("user_id");

COMMIT;
