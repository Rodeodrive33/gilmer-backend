/*
  Warnings:

  - You are about to drop the column `userId` on the `Tenant` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "public"."Tenant" DROP CONSTRAINT "Tenant_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Tenant" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'property_manager';

-- DropEnum
DROP TYPE "public"."Role";
