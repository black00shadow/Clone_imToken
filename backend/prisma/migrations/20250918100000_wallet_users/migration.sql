-- CreateTable
CREATE TABLE "WalletUser" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "mnemonicEnc" TEXT NOT NULL,
    "accountsCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletAccount" (
    "id" TEXT NOT NULL,
    "walletUserId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "evmAddress" TEXT NOT NULL,
    "btcAddress" TEXT NOT NULL,
    "tronAddress" TEXT NOT NULL,
    "tonAddress" TEXT NOT NULL,
    "cosmosAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletBalance" (
    "id" TEXT NOT NULL,
    "walletAccountId" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "chainSymbol" TEXT NOT NULL,
    "chainName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "balance" TEXT NOT NULL DEFAULT '0',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WalletUser_deviceId_key" ON "WalletUser"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "WalletAccount_walletUserId_index_key" ON "WalletAccount"("walletUserId", "index");

-- CreateIndex
CREATE UNIQUE INDEX "WalletBalance_walletAccountId_chainId_key" ON "WalletBalance"("walletAccountId", "chainId");

-- AddForeignKey
ALTER TABLE "WalletAccount" ADD CONSTRAINT "WalletAccount_walletUserId_fkey" FOREIGN KEY ("walletUserId") REFERENCES "WalletUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletBalance" ADD CONSTRAINT "WalletBalance_walletAccountId_fkey" FOREIGN KEY ("walletAccountId") REFERENCES "WalletAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
