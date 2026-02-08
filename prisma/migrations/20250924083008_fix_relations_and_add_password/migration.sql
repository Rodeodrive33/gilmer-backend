/*
  Warnings:

  - The values [BANK] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Property` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."PaymentMethod_new" AS ENUM ('MPESA', 'KCB', 'EQUITY', 'COOPERATIVE');
ALTER TABLE "public"."Payment" ALTER COLUMN "method" TYPE "public"."PaymentMethod_new" USING ("method"::text::"public"."PaymentMethod_new");
ALTER TYPE "public"."PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "public"."PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."Role" ADD VALUE 'CLIENT';
ALTER TYPE "public"."Role" ADD VALUE 'LANDLORD';
ALTER TYPE "public"."Role" ADD VALUE 'PROPERTY_MANAGER';

-- AlterTable
ALTER TABLE "public"."Lease" ADD COLUMN     "serviceCharge" DOUBLE PRECISION DEFAULT 0,
ALTER COLUMN "endDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "mpesaReceipt" TEXT,
ADD COLUMN     "transactionId" TEXT,
ALTER COLUMN "rentAmount" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "password" TEXT,
ALTER COLUMN "role" SET DEFAULT 'TENANT';

-- CreateIndex
CREATE UNIQUE INDEX "Property_name_key" ON "public"."Property"("name");
