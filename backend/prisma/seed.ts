import * as bcrypt from 'bcrypt';
import { UNIQUE_EVM_CHAINS, NON_EVM_CHAINS } from './chains-data';
import { createPrismaClient } from './client';

const prisma = createPrismaClient();

async function seedEvmChain(
  data: (typeof UNIQUE_EVM_CHAINS)[0],
  sortOrder: number,
) {
  const chain = await prisma.chain.upsert({
    where: { chainId: data.chainId },
    update: {
      name: data.name,
      rpcUrl: data.rpcUrl,
      explorerUrl: data.explorerUrl,
      family: 'evm',
      coinType: 60,
      sortOrder,
      isEnabled: true,
    },
    create: {
      name: data.name,
      symbol: data.symbol,
      chainId: data.chainId,
      rpcUrl: data.rpcUrl,
      explorerUrl: data.explorerUrl,
      family: 'evm',
      coinType: 60,
      isEvm: true,
      isEnabled: true,
      sortOrder,
    },
  });

  await prisma.token.upsert({
    where: { chainId_symbol: { chainId: chain.id, symbol: data.symbol } },
    update: {},
    create: {
      chainId: chain.id,
      name: data.name,
      symbol: data.symbol,
      decimals: 18,
      isNative: true,
      isEnabled: true,
      sortOrder: 1,
    },
  });
}

const COIN_TYPES: Record<string, number> = {
  BTC: 0, LTC: 2, DOGE: 3, ETH: 60, ATOM: 118, TRX: 195, OSMO: 118,
  DOT: 354, KSM: 434, TON: 607, SOL: 501, NEAR: 397, APT: 637, SUI: 784,
  XTZ: 1729, XLM: 148, XRP: 144, CKB: 309, FIL: 461, BCH: 145,
};

async function seedNonEvm(
  data: (typeof NON_EVM_CHAINS)[0],
  sortOrder: number,
) {
  const coinType = COIN_TYPES[data.symbol] ?? null;
  const bech32Prefix = 'prefix' in data ? (data as { prefix?: string }).prefix ?? null : null;
  const existing = await prisma.chain.findFirst({
    where: { symbol: data.symbol, name: data.name },
  });
  if (existing) {
    await prisma.chain.update({
      where: { id: existing.id },
      data: {
        rpcUrl: data.rpcUrl,
        explorerUrl: data.explorerUrl,
        family: data.family,
        coinType,
        bech32Prefix,
        sortOrder,
        isEnabled: true,
      },
    });
    return;
  }
  const chain = await prisma.chain.create({
    data: {
      name: data.name,
      symbol: data.symbol,
      rpcUrl: data.rpcUrl,
      explorerUrl: data.explorerUrl,
      family: data.family,
      coinType,
      bech32Prefix,
      isEvm: false,
      isEnabled: true,
      sortOrder,
      chainId: null,
    },
  });
  await prisma.token.create({
    data: {
      chainId: chain.id,
      name: data.name,
      symbol: data.symbol,
      decimals: data.symbol === 'BTC' || data.symbol === 'LTC' || data.symbol === 'DOGE' ? 8 : 6,
      isNative: true,
      isEnabled: true,
      sortOrder: 1,
    },
  });
}

async function main() {
  const password = await bcrypt.hash('admin123456', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@wallet.local' },
    update: {},
    create: { email: 'admin@wallet.local', password, name: 'Super Admin', role: 'SUPER_ADMIN' },
  });

  let order = 1;
  for (const chain of UNIQUE_EVM_CHAINS) {
    await seedEvmChain(chain, order++);
  }
  for (const chain of NON_EVM_CHAINS) {
    await seedNonEvm(chain, order++);
  }

  const dapps = [
    { id: 'd-uniswap', name: 'Uniswap', url: 'https://app.uniswap.org', category: 'DeFi' },
    { id: 'd-opensea', name: 'OpenSea', url: 'https://opensea.io', category: 'NFT' },
    { id: 'd-aave', name: 'Aave', url: 'https://app.aave.com', category: 'DeFi' },
    { id: 'd-compound', name: 'Compound', url: 'https://app.compound.finance', category: 'DeFi' },
    { id: 'd-ens', name: 'ENS', url: 'https://app.ens.domains', category: 'Tools' },
    { id: 'd-snapshot', name: 'Snapshot', url: 'https://snapshot.org', category: 'Governance' },
    { id: 'd-1inch', name: '1inch', url: 'https://app.1inch.io', category: 'DeFi' },
    { id: 'd-tokenlon', name: 'Tokenlon', url: 'https://tokenlon.im', category: 'DeFi' },
    { id: 'd-stargate', name: 'Stargate', url: 'https://stargate.finance', category: 'Bridge' },
    { id: 'd-lido', name: 'Lido', url: 'https://lido.fi', category: 'Staking' },
  ];
  for (const [i, d] of dapps.entries()) {
    await prisma.dapp.upsert({
      where: { id: d.id },
      update: {},
      create: { ...d, description: d.name, chains: ['Ethereum'], isFeatured: i < 6, isEnabled: true, sortOrder: i + 1 },
    });
  }

  await prisma.remoteConfig.upsert({
    where: { key: 'swap_enabled' },
    update: { value: 'true' },
    create: { key: 'swap_enabled', value: 'true', type: 'boolean', description: 'Tokenlon swap' },
  });
  await prisma.remoteConfig.upsert({
    where: { key: 'swap_provider' },
    update: { value: 'tokenlon' },
    create: { key: 'swap_provider', value: 'tokenlon', type: 'string', description: 'Swap provider branding' },
  });

  const total = await prisma.chain.count();
  console.log(`Seed completed. ${total} chains.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
