import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const testSub = "example";

  await prisma.user.upsert({
    where: { sub: testSub },
    update: {},
    create: {
      id: "f5301636-38cf-4426-b1b4-1b0b2d0f608e",
      createdAt: new Date("2023-01-27 12:23:56.847"),
      updatedAt: new Date("2023-01-27 12:23:56.847"),
      email: "alva_davis@gmail.com",
      sub: testSub,
      givenName: "Alva",
      familyName: "Davis",
      name: "Alva Davis",
      nickname: "adavis",
      picture:
        "https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/117.jpg",
    },
  });
  await prisma.user.upsert({
    where: {
      sub: "google-oauth2|102980808310702347202",
    },
    update: {},
    create: {
      id: "cf23451c-81f1-4bbe-b3d5-7452887f65a5",
      createdAt: new Date("2023-01-27 12:25:12.578"),
      updatedAt: new Date("2023-01-27 12:25:12.578"),
      email: "jerrold_klein@gmail.com",
      sub: "google-oauth2|102980808310702347202",
      givenName: "Jerrold",
      familyName: "Klein",
      name: "Jerrold Klein",
      nickname: "jklein",
      picture:
        "https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/761.jpg",
    },
  });

  await prisma.group.upsert({
    where: {
      id: "fb8b691d-6d17-4802-945e-be78ab816821",
    },
    update: {},
    create: {
      id: "fb8b691d-6d17-4802-945e-be78ab816821",
      createdAt: new Date("2023-01-27 12:24:28.899"),
      updatedAt: new Date("2023-01-27 12:24:28.899"),
      name: "Household",
      adminId: "f5301636-38cf-4426-b1b4-1b0b2d0f608e",
      members: {
        createMany: {
          data: [
            { userId: "f5301636-38cf-4426-b1b4-1b0b2d0f608e" },
            { userId: "cf23451c-81f1-4bbe-b3d5-7452887f65a5" },
          ],
        },
      },
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
