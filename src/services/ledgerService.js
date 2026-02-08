import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createLedgerEntry = async ({
  type,
  amount,
  description,
  propertyId,
  clientId
}) => {

  return await prisma.ledgerEntry.create({
    data:{
      type,
      amount,
      description,
      propertyId,
      clientId
    }
  });

};

export const listLedgerEntries = async (clientId) => {
  return await prisma.ledgerEntry.findMany({
    where:{ clientId }
  });
};