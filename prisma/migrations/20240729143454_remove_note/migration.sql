/*
  Warnings:

  - You are about to drop the `ExpenseNote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ExpenseNote" DROP CONSTRAINT "ExpenseNote_createdById_fkey";

-- DropForeignKey
ALTER TABLE "ExpenseNote" DROP CONSTRAINT "ExpenseNote_expenseId_fkey";

-- DropTable
DROP TABLE "ExpenseNote";
