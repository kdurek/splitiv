/*
  Warnings:

  - You are about to drop the column `type` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the `ExpenseUsers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserGroups` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `payerId` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ExpenseUsers" DROP CONSTRAINT "ExpenseUsers_expenseId_fkey";

-- DropForeignKey
ALTER TABLE "ExpenseUsers" DROP CONSTRAINT "ExpenseUsers_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserGroups" DROP CONSTRAINT "UserGroups_groupId_fkey";

-- DropForeignKey
ALTER TABLE "UserGroups" DROP CONSTRAINT "UserGroups_userId_fkey";

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "type",
ADD COLUMN     "payerId" TEXT NOT NULL;

-- DropTable
DROP TABLE "ExpenseUsers";

-- DropTable
DROP TABLE "UserGroups";

-- CreateTable
CREATE TABLE "UserGroup" (
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "UserGroup_pkey" PRIMARY KEY ("userId","groupId")
);

-- CreateTable
CREATE TABLE "ExpenseDebt" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" TEXT NOT NULL,
    "settled" BOOLEAN NOT NULL DEFAULT false,
    "expenseId" TEXT NOT NULL,
    "debtorId" TEXT NOT NULL,

    CONSTRAINT "ExpenseDebt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserGroup" ADD CONSTRAINT "UserGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGroup" ADD CONSTRAINT "UserGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseDebt" ADD CONSTRAINT "ExpenseDebt_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseDebt" ADD CONSTRAINT "ExpenseDebt_debtorId_fkey" FOREIGN KEY ("debtorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
