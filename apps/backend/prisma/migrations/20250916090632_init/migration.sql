-- CreateEnum
CREATE TYPE "public"."TransactionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FAILED', 'SUCCESS');

-- CreateEnum
CREATE TYPE "public"."TransactionCategory" AS ENUM ('AIRTIME', 'DSTV', 'ELECTRICITY', 'DATA');

-- CreateTable
CREATE TABLE "public"."Transaction" (
    "id" SERIAL NOT NULL,
    "paymentReference" TEXT NOT NULL,
    "category" "public"."TransactionCategory" NOT NULL,
    "number" TEXT NOT NULL,
    "status" "public"."TransactionStatus",
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_paymentReference_key" ON "public"."Transaction"("paymentReference");
