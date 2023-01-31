/*
  Warnings:

  - The `settled` column on the `ExpenseDebt` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `amount` on the `Expense` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `amount` on the `ExpenseDebt` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "amount",
ADD COLUMN     "amount" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "ExpenseDebt" DROP COLUMN "amount",
ADD COLUMN     "amount" DECIMAL(65,30) NOT NULL,
DROP COLUMN "settled",
ADD COLUMN     "settled" DECIMAL(65,30) NOT NULL DEFAULT 0;
