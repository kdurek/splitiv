-- Rename Prisma PascalCase tables and camelCase columns to Drizzle snake_case
-- Run this against the restored Prisma DB before running drizzle-kit migrate

BEGIN;

-- ============================================================
-- User -> user
-- ============================================================
ALTER TABLE "User" RENAME COLUMN "emailVerified" TO "email_verified";
ALTER TABLE "User" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "User" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "User" RENAME COLUMN "firstName" TO "first_name";
ALTER TABLE "User" RENAME COLUMN "lastName" TO "last_name";
ALTER TABLE "User" RENAME COLUMN "activeGroupId" TO "active_group_id";
ALTER TABLE "User" RENAME TO "user";

-- ============================================================
-- Session -> session
-- ============================================================
ALTER TABLE "Session" RENAME COLUMN "expiresAt" TO "expires_at";
ALTER TABLE "Session" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "Session" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "Session" RENAME COLUMN "ipAddress" TO "ip_address";
ALTER TABLE "Session" RENAME COLUMN "userAgent" TO "user_agent";
ALTER TABLE "Session" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "Session" RENAME TO "session";

-- ============================================================
-- Account -> account
-- ============================================================
ALTER TABLE "Account" RENAME COLUMN "accountId" TO "account_id";
ALTER TABLE "Account" RENAME COLUMN "providerId" TO "provider_id";
ALTER TABLE "Account" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "Account" RENAME COLUMN "accessToken" TO "access_token";
ALTER TABLE "Account" RENAME COLUMN "refreshToken" TO "refresh_token";
ALTER TABLE "Account" RENAME COLUMN "idToken" TO "id_token";
ALTER TABLE "Account" RENAME COLUMN "accessTokenExpiresAt" TO "access_token_expires_at";
ALTER TABLE "Account" RENAME COLUMN "refreshTokenExpiresAt" TO "refresh_token_expires_at";
ALTER TABLE "Account" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "Account" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "Account" RENAME TO "account";

-- ============================================================
-- Verification -> verification
-- ============================================================
ALTER TABLE "Verification" RENAME COLUMN "expiresAt" TO "expires_at";
ALTER TABLE "Verification" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "Verification" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "Verification" RENAME TO "verification";

-- ============================================================
-- Group -> group
-- ============================================================
ALTER TABLE "Group" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "Group" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "Group" RENAME COLUMN "adminId" TO "admin_id";
ALTER TABLE "Group" RENAME TO "group";

-- ============================================================
-- UserGroup -> user_group
-- ============================================================
ALTER TABLE "UserGroup" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "UserGroup" RENAME COLUMN "groupId" TO "group_id";
ALTER TABLE "UserGroup" RENAME TO "user_group";

-- ============================================================
-- Expense -> expense
-- ============================================================
ALTER TABLE "Expense" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "Expense" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "Expense" RENAME COLUMN "payerId" TO "payer_id";
ALTER TABLE "Expense" RENAME COLUMN "groupId" TO "group_id";
ALTER TABLE "Expense" RENAME TO "expense";

-- ============================================================
-- ExpenseDebt -> expense_debt
-- ============================================================
ALTER TABLE "ExpenseDebt" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "ExpenseDebt" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "ExpenseDebt" RENAME COLUMN "expenseId" TO "expense_id";
ALTER TABLE "ExpenseDebt" RENAME COLUMN "debtorId" TO "debtor_id";
ALTER TABLE "ExpenseDebt" RENAME TO "expense_debt";

-- ============================================================
-- ExpenseLog -> expense_log
-- ============================================================
ALTER TABLE "ExpenseLog" RENAME COLUMN "debtId" TO "debt_id";
ALTER TABLE "ExpenseLog" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "ExpenseLog" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "ExpenseLog" RENAME TO "expense_log";

-- ============================================================
-- PushSubscription -> push_subscription
-- ============================================================
ALTER TABLE "PushSubscription" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "PushSubscription" RENAME TO "push_subscription";

COMMIT;

-- After running this script, use `drizzle-kit push` (not migrate) to sync
-- any remaining differences (constraint names, index names, etc.)
-- without needing to worry about migration history tracking.
