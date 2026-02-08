import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;

// const prisma = new PrismaClient({
//   log: ["query", "info", "warn", "error"],
// });