import prisma from "../prismaClient.js";

export async function logAction(userId, action, entity, entityId=null) {
  return prisma.auditLog.create({
    data: { userId, action, entity, entityId }
  });
}
