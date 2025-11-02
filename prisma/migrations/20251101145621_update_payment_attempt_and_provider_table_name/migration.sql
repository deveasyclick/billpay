/*
  Warnings:

  - You are about to drop the `Provider` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment_attempts` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('PENDING', 'PENIDING_CONFIRMATION', 'SUCCESS', 'FAILED', 'TIMEOUT', 'CANCELLED', 'RECONCILED');

-- DropForeignKey
ALTER TABLE "public"."payment_attempts" DROP CONSTRAINT "payment_attempts_billingProviderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."payment_attempts" DROP CONSTRAINT "payment_attempts_paymentRecordId_fkey";

-- DropForeignKey
ALTER TABLE "public"."payment_attempts" DROP CONSTRAINT "payment_attempts_providerId_fkey";

-- DropTable
DROP TABLE "public"."Provider";

-- DropTable
DROP TABLE "public"."payment_attempts";

-- CreateTable
CREATE TABLE "PaymentAttempt" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "externalReference" TEXT,
    "status" "AttemptStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "responsePayload" JSONB,
    "requestPayload" JSONB,
    "isFallback" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAttempt_paymentId_providerId_attemptNumber_key" ON "PaymentAttempt"("paymentId", "providerId", "attemptNumber");

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "BillingProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
