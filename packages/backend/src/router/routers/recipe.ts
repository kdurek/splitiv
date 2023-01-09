import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { generateSlug } from "../../utils/generateSlug";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const recipeRouter = router({
  getRecipes: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.recipe.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  getRecipeBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.recipe.findUnique({
        where: { slug: input.slug },
        include: { ingredients: true, steps: true, author: true },
      });
    }),

  createRecipe: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3, { message: "Minimalna długość to 3 znaki" }),
        ingredients: z.array(
          z.object({
            name: z
              .string()
              .min(3, { message: "Minimalna długość to 3 znaki" }),
            amount: z.number(),
            unit: z.string(),
          })
        ),
        steps: z.array(
          z.object({
            name: z
              .string()
              .min(3, { message: "Minimalna długość to 3 znaki" }),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const recipeSlug = generateSlug(input.name);
      const foundRecipe = await ctx.prisma.recipe.findUnique({
        where: { slug: recipeSlug },
      });

      if (["dodaj"].includes(recipeSlug)) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Nie możesz użyć tej nazwy",
        });
      }

      if (foundRecipe) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Przepis o takiej nazwie już istnieje",
        });
      }

      return ctx.prisma.recipe.create({
        data: {
          name: input.name,
          slug: recipeSlug,
          authorId: ctx.user.id,
          ingredients: {
            createMany: {
              data: input.ingredients,
            },
          },
          steps: {
            createMany: {
              data: input.steps,
            },
          },
        },
      });
    }),

  updateRecipe: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3, { message: "Minimalna długość to 3 znaki" }),
        ingredients: z.array(
          z.object({
            name: z
              .string()
              .min(3, { message: "Minimalna długość to 3 znaki" }),
            amount: z.number(),
            unit: z.string(),
          })
        ),
        steps: z.array(
          z.object({
            name: z
              .string()
              .min(3, { message: "Minimalna długość to 3 znaki" }),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const recipeSlug = generateSlug(input.name);
      const foundRecipe = await ctx.prisma.recipe.findUnique({
        where: { slug: recipeSlug },
      });

      if (["dodaj"].includes(recipeSlug)) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Nie możesz użyć tej nazwy",
        });
      }

      if (foundRecipe && foundRecipe.id !== input.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Przepis o takiej nazwie już istnieje",
        });
      }

      return ctx.prisma.recipe.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          slug: recipeSlug,
          ingredients: {
            deleteMany: {
              recipeId: input.id,
            },
            createMany: {
              data: input.ingredients,
            },
          },
          steps: {
            deleteMany: {
              recipeId: input.id,
            },
            createMany: {
              data: input.steps,
            },
          },
        },
      });
    }),

  deleteRecipeBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.recipe.delete({
        where: {
          slug: input.slug,
        },
      });
    }),
});
