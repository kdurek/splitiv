/*
  Warnings:

  - You are about to drop the column `familyName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `givenName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `nickname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `sub` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_sub_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "familyName",
DROP COLUMN "givenName",
DROP COLUMN "nickname",
DROP COLUMN "picture",
DROP COLUMN "sub";
