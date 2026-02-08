/*
  Warnings:

  - The values [COMPLETED,RECONCILED] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PROPERTY_MANAGER,CLIENT] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `channel` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `mpesaReceipt` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `reconciled` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the `ClientAssignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PropertyManager` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `method` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Made the column `leaseId` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('MPESA', 'BANK');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."PaymentStatus_new" AS ENUM ('PENDING', 'PAID', 'FAILED');
ALTER TABLE "public"."Payment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Payment" ALTER COLUMN "status" TYPE "public"."PaymentStatus_new" USING ("status"::text::"public"."PaymentStatus_new");
ALTER TYPE "public"."PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "public"."PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "public"."PaymentStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('ADMIN', 'MANAGER', 'TENANT');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."ClientAssignment" DROP CONSTRAINT "ClientAssignment_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ClientAssignment" DROP CONSTRAINT "ClientAssignment_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_leaseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PropertyManager" DROP CONSTRAINT "PropertyManager_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "channel",
DROP COLUMN "mpesaReceipt",
DROP COLUMN "reconciled",
DROP COLUMN "transactionId",
ADD COLUMN     "method" "public"."PaymentMethod" NOT NULL,
ALTER COLUMN "leaseId" SET NOT NULL,
ALTER COLUMN "serviceCharge" DROP NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;

-- DropTable
DROP TABLE "public"."ClientAssignment";

-- DropTable
DROP TABLE "public"."PropertyManager";

-- DropEnum
DROP TYPE "public"."PaymentChannel";

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "public"."Lease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
