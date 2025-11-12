-- CreateEnum
CREATE TYPE "Providers" AS ENUM ('INTERSWITCH', 'VTPASS');

-- CreateEnum
CREATE TYPE "BillCategory" AS ENUM ('DATA', 'TV', 'ELECTRICITY', 'GAMING', 'AIRTIME');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'VERIFIED', 'PROCESSING', 'SUCCESS', 'FAILED', 'PARTIAL_FAILURE', 'RETRYING', 'ESCALATED', 'RECONCILED');

-- CreateTable
CREATE TABLE "BillingProvider" (
    "id" TEXT NOT NULL,
    "name" "Providers" NOT NULL,
    "baseUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingCategory" (
    "id" TEXT NOT NULL,
    "name" "BillCategory" NOT NULL,
    "dynamic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Biller" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "billerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Biller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingItem" (
    "id" TEXT NOT NULL,
    "internalCode" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "billerId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "paymentCode" TEXT,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(65,30),
    "amountType" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "email" TEXT,
    "customerId" TEXT NOT NULL,
    "initialBillingItemId" TEXT NOT NULL,
    "resolvedBillingItemId" TEXT,
    "category" "BillCategory" NOT NULL,
    "internalCode" TEXT NOT NULL,
    "transactionHash" TEXT,
    "amount" DECIMAL(20,8) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "retries" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "nextRetryAt" TIMESTAMP(3),
    "lastError" TEXT,
    "duplicateOfId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_attempts" (
    "id" TEXT NOT NULL,
    "paymentRecordId" TEXT NOT NULL,
    "providerId" TEXT,
    "attemptReference" TEXT,
    "providerStatus" TEXT,
    "requestBody" JSONB,
    "providerResponse" JSONB,
    "confirmedTransaction" JSONB,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "retries" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "billingProviderId" TEXT,

    CONSTRAINT "payment_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BillingProvider_name_key" ON "BillingProvider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BillingCategory_name_key" ON "BillingCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Biller_billerId_key" ON "Biller"("billerId");

-- CreateIndex
CREATE INDEX "BillingItem_categoryId_idx" ON "BillingItem"("categoryId");

-- CreateIndex
CREATE INDEX "BillingItem_billerId_idx" ON "BillingItem"("billerId");

-- CreateIndex
CREATE INDEX "BillingItem_providerId_idx" ON "BillingItem"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "BillingItem_internalCode_providerId_key" ON "BillingItem"("internalCode", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_name_key" ON "Provider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_reference_key" ON "Payment"("reference");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_reference_idx" ON "Payment"("reference");

-- CreateIndex
CREATE INDEX "Payment_completedAt_idx" ON "Payment"("completedAt");

-- CreateIndex
CREATE INDEX "Payment_internalCode_idx" ON "Payment"("internalCode");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionHash_key" ON "Payment"("transactionHash");

-- CreateIndex
CREATE INDEX "payment_attempts_paymentRecordId_providerId_idx" ON "payment_attempts"("paymentRecordId", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_attempts_paymentRecordId_providerId_attemptReferenc_key" ON "payment_attempts"("paymentRecordId", "providerId", "attemptReference");

-- AddForeignKey
ALTER TABLE "BillingItem" ADD CONSTRAINT "BillingItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BillingCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingItem" ADD CONSTRAINT "BillingItem_billerId_fkey" FOREIGN KEY ("billerId") REFERENCES "Biller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingItem" ADD CONSTRAINT "BillingItem_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "BillingProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_initialBillingItemId_fkey" FOREIGN KEY ("initialBillingItemId") REFERENCES "BillingItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_resolvedBillingItemId_fkey" FOREIGN KEY ("resolvedBillingItemId") REFERENCES "BillingItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_duplicateOfId_fkey" FOREIGN KEY ("duplicateOfId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_paymentRecordId_fkey" FOREIGN KEY ("paymentRecordId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_billingProviderId_fkey" FOREIGN KEY ("billingProviderId") REFERENCES "BillingProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
