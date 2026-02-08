/*
  Warnings:

  - The values [MANAGER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `status` on the `Lease` table. All the data in the column will be lost.
  - You are about to drop the column `allocated` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `channel` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `propertyId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `reconciled` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `rentAmount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `serviceCharge` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `Payment` table. All the data in the column will be lost.
  - Made the column `tenantId` on table `Lease` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endDate` on table `Lease` required. This step will fail if there are existing NULL values in that column.
  - Made the column `leaseId` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `payerId` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `location` on table `Property` required. This step will fail if there are existing NULL values in that column.
  - Made the column `managerId` on table `Property` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('ADMIN', 'PROPERTY_MANAGER', 'TENANT', 'CLIENT');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Lease" DROP CONSTRAINT "Lease_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_leaseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_payerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Property" DROP CONSTRAINT "Property_managerId_fkey";

-- AlterTable
ALTER TABLE "public"."Lease" DROP COLUMN "status",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "tenantId" SET NOT NULL,
ALTER COLUMN "endDate" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "allocated",
DROP COLUMN "channel",
DROP COLUMN "method",
DROP COLUMN "propertyId",
DROP COLUMN "reconciled",
DROP COLUMN "rentAmount",
DROP COLUMN "serviceCharge",
DROP COLUMN "status",
DROP COLUMN "transactionId",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "leaseId" SET NOT NULL,
ALTER COLUMN "payerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Property" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "location" SET NOT NULL,
ALTER COLUMN "managerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "password" TEXT,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "role" DROP DEFAULT,
ALTER COLUMN "name" SET NOT NULL;

-- DropEnum
DROP TYPE "public"."PaymentMethod";

-- DropEnum
DROP TYPE "public"."PaymentStatus";

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lease" ADD CONSTRAINT "Lease_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "public"."Lease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
