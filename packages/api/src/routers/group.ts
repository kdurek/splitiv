import { protectedProcedure } from "@splitiv/api";
import prisma from "@splitiv/db";
import { z } from "zod";

// const checkGroupMembership = os
//   .$context<{ user: User }>()
//   .middleware(async ({ context, next }) => {
//     if (!context.user?.activeGroupId) {
//       throw new ORPCError("INTERNAL_SERVER_ERROR", {
//         message: "Aktywna grupa nie została ustawiona",
//       });
//     }

//     const group = await prisma.group.findUnique({
//       where: { id: context.user?.activeGroupId },
//       include: {
//         members: {
//           where: {
//             userId: context.user?.id,
//           },
//         },
//       },
//     });

//     if (!group) {
//       throw new ORPCError("FORBIDDEN", {
//         message: "Nie masz uprawnień do wykonania tej operacji",
//       });
//     }

//     return next();
//   });

export const groupRouter = {
  list: protectedProcedure.handler(async ({ context }) => {
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: context.user.id,
          },
        },
      },
    });

    return groups;
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .handler(
      async ({ input, context }) =>
        await prisma.group.create({
          data: {
            name: input.name,
            adminId: context.user.id,
            members: {
              create: [
                {
                  userId: context.user.id,
                },
              ],
            },
          },
        })
    ),

  changeCurrent: protectedProcedure
    .input(z.object({ groupId: z.cuid() }))
    .handler(async ({ input, context }) => {
      const user = await prisma.user.update({
        where: { id: context.user.id },
        data: {
          activeGroupId: input.groupId,
        },
      });

      return user;
    }),

  addUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .handler(async ({ input, context }) => {
      const group = await prisma.userGroup.create({
        data: {
          groupId: context.user.activeGroupId,
          userId: input.userId,
        },
      });

      return group;
    }),
};
