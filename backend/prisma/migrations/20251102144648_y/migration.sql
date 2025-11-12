/*
  Warnings:

  - The values [PENIDING_CONFIRMATION] on the enum `AttemptStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `transactionHash` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AttemptStatus_new" AS ENUM ('PENDING', 'PENDING_CONFIRMATION', 'SUCCESS', 'FAILED', 'TIMEOUT', 'CANCELLED', 'RECONCILED');
ALTER TABLE "public"."PaymentAttempt" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "PaymentAttempt" ALTER COLUMN "status" TYPE "AttemptStatus_new" USING ("status"::text::"AttemptStatus_new");
ALTER TYPE "AttemptStatus" RENAME TO "AttemptStatus_old";
ALTER TYPE "AttemptStatus_new" RENAME TO "AttemptStatus";
DROP TYPE "public"."AttemptStatus_old";
ALTER TABLE "PaymentAttempt" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropIndex
DROP INDEX "public"."Payment_transactionHash_key";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "transactionHash",
ADD COLUMN     "plan" TEXT;
