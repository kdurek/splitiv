/*
  Warnings:

  - You are about to drop the `Recipe` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RecipeIngredient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RecipeStep` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Recipe" DROP CONSTRAINT "Recipe_authorId_fkey";

-- DropForeignKey
ALTER TABLE "RecipeIngredient" DROP CONSTRAINT "RecipeIngredient_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "RecipeStep" DROP CONSTRAINT "RecipeStep_recipeId_fkey";

-- DropTable
DROP TABLE "Recipe";

-- DropTable
DROP TABLE "RecipeIngredient";

-- DropTable
DROP TABLE "RecipeStep";
