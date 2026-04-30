-- CreateTable
CREATE TABLE "RecentTransaction" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "customerId" INTEGER,
    "customerName" TEXT,
    "agentId" INTEGER,
    "agentName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Completed',
    "description" TEXT,
    "paymentMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecentTransaction_type_idx" ON "RecentTransaction"("type");

-- CreateIndex
CREATE INDEX "RecentTransaction_customerId_idx" ON "RecentTransaction"("customerId");

-- CreateIndex
CREATE INDEX "RecentTransaction_agentId_idx" ON "RecentTransaction"("agentId");

-- CreateIndex
CREATE INDEX "RecentTransaction_createdAt_idx" ON "RecentTransaction"("createdAt");
