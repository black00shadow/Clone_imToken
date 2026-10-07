-- CreateTable
CREATE TABLE "TokenBalanceSnapshot" (
    "id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "chainId" TEXT NOT NULL,
    "chainSymbol" TEXT NOT NULL,
    "chainName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "balance" TEXT NOT NULL DEFAULT '0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenBalanceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TokenBalanceSnapshot_day_chainId_address_key" ON "TokenBalanceSnapshot"("day", "chainId", "address");

-- CreateIndex
CREATE INDEX "TokenBalanceSnapshot_day_idx" ON "TokenBalanceSnapshot"("day");
