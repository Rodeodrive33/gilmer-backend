import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      {
        id: "admin-firebase-uid",
        email: "admin@gilmer.com",
        role: "ADMIN",
      },
      {
        id: "client-firebase-uid",
        email: "client@gilmer.com",
        role: "CLIENT",
      },
      {
        id: "manager-firebase-uid",
        email: "manager@gilmer.com",
        role: "MANAGER",
      },
      {
        id: "tenant-firebase-uid",
        email: "tenant@gilmer.com",
        role: "TENANT",
      },
    ],
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
