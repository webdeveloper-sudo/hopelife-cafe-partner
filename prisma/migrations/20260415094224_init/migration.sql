-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "partnerCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "commissionSlab" DOUBLE PRECISION NOT NULL DEFAULT 7.5,
    "guestDiscountSlab" DOUBLE PRECISION NOT NULL DEFAULT 7.5,
    "bankAccount" TEXT,
    "ifsc" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "referralGoal" INTEGER NOT NULL DEFAULT 10,
    "currentTier" TEXT NOT NULL DEFAULT 'BRONZE',
    "businessType" TEXT,
    "walletBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicQR" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "secretKey" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DynamicQR_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanLog" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "billAmount" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL,
    "guestDiscountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "partnerCommissionAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'SETTLED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "method" TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
    "logsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Partner_partnerCode_key" ON "Partner"("partnerCode");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_mobile_key" ON "Partner"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_email_key" ON "Partner"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Guest_mobileNumber_key" ON "Guest"("mobileNumber");

-- CreateIndex
CREATE UNIQUE INDEX "DynamicQR_guestId_key" ON "DynamicQR"("guestId");

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicQR" ADD CONSTRAINT "DynamicQR_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanLog" ADD CONSTRAINT "ScanLog_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
