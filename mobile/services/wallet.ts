import '@/polyfills';
import * as bip39 from 'bip39';
import { ethers } from 'ethers';
import { secureStorage } from './storage';

const MNEMONIC_KEY = 'wallet_mnemonic';
const PIN_KEY = 'wallet_pin';
const BIOMETRIC_KEY = 'wallet_biometric';
const ACTIVE_ACCOUNT_KEY = 'wallet_active_account';
const ACCOUNTS_COUNT_KEY = 'wallet_accounts_count';

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address,uint256) returns (bool)',
  'function allowance(address,address) view returns (uint256)',
  'function approve(address,uint256) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

import { deriveBtcAddress } from './chains/btc';
import { deriveTronAccount } from './chains/tron';
import { deriveTonAddress } from './chains/ton';
import { deriveCosmosAddress } from './chains/cosmos';

export type WalletAccount = {
  address: string;
  privateKey: string;
  btcAddress: string;
  tronAddress: string;
  tronPrivateKey: string;
  tonAddress: string;
  cosmosAddress: string;
  index: number;
  name: string;
};

export async function hasWallet(): Promise<boolean> {
  return !!(await secureStorage.getItem(MNEMONIC_KEY));
}

export async function getMnemonic(): Promise<string | null> {
  return secureStorage.getItem(MNEMONIC_KEY);
}

export async function createWallet(): Promise<{ mnemonic: string; account: WalletAccount }> {
  const mnemonic = bip39.generateMnemonic(128);
  await secureStorage.setItem(MNEMONIC_KEY, mnemonic);
  await secureStorage.setItem(ACTIVE_ACCOUNT_KEY, '0');
  await secureStorage.setItem(ACCOUNTS_COUNT_KEY, '1');
  const account = deriveAccount(mnemonic, 0);
  return { mnemonic, account };
}

export async function importWallet(mnemonic: string): Promise<WalletAccount> {
  const normalized = mnemonic.trim().toLowerCase();
  if (!bip39.validateMnemonic(normalized)) throw new Error('Invalid mnemonic');
  await secureStorage.setItem(MNEMONIC_KEY, normalized);
  await secureStorage.setItem(ACTIVE_ACCOUNT_KEY, '0');
  await secureStorage.setItem(ACCOUNTS_COUNT_KEY, '1');
  return deriveAccount(normalized, 0);
}

export function deriveAccount(mnemonic: string, index: number): WalletAccount {
  const hd = ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, `m/44'/60'/0'/0/${index}`);
  const btcAddress = deriveBtcAddress(mnemonic, index);
  const tron = deriveTronAccount(mnemonic, index);
  const ton = deriveTonAddress(mnemonic, index);
  const cosmosAddress = deriveCosmosAddress(mnemonic, index);
  return {
    address: hd.address,
    privateKey: hd.privateKey,
    btcAddress,
    tronAddress: tron.address,
    tronPrivateKey: tron.privateKey,
    tonAddress: ton.address,
    cosmosAddress,
    index,
    name: `Account ${index + 1}`,
  };
}

export async function getAccountsCount(): Promise<number> {
  const count = await secureStorage.getItem(ACCOUNTS_COUNT_KEY);
  return count ? parseInt(count, 10) : 1;
}

export async function getActiveAccountIndex(): Promise<number> {
  const idx = await secureStorage.getItem(ACTIVE_ACCOUNT_KEY);
  return idx ? parseInt(idx, 10) : 0;
}

export async function setActiveAccountIndex(index: number) {
  await secureStorage.setItem(ACTIVE_ACCOUNT_KEY, String(index));
}

export async function getAllAccounts(): Promise<WalletAccount[]> {
  const mnemonic = await secureStorage.getItem(MNEMONIC_KEY);
  if (!mnemonic) return [];
  const count = await getAccountsCount();
  return Array.from({ length: count }, (_, i) => deriveAccount(mnemonic, i));
}

export async function getAccount(): Promise<WalletAccount | null> {
  const mnemonic = await secureStorage.getItem(MNEMONIC_KEY);
  if (!mnemonic) return null;
  const index = await getActiveAccountIndex();
  return deriveAccount(mnemonic, index);
}

export async function addAccount(): Promise<WalletAccount> {
  const mnemonic = await secureStorage.getItem(MNEMONIC_KEY);
  if (!mnemonic) throw new Error('No wallet');
  const count = await getAccountsCount();
  if (count >= 100) throw new Error('Max 100 accounts');
  const newIndex = count;
  await secureStorage.setItem(ACCOUNTS_COUNT_KEY, String(count + 1));
  await setActiveAccountIndex(newIndex);
  return deriveAccount(mnemonic, newIndex);
}

export async function setPin(pin: string) {
  await secureStorage.setItem(PIN_KEY, pin);
}

export async function verifyPin(pin: string): Promise<boolean> {
  return (await secureStorage.getItem(PIN_KEY)) === pin;
}

export async function hasPin(): Promise<boolean> {
  return !!(await secureStorage.getItem(PIN_KEY));
}

export async function setBiometricEnabled(enabled: boolean) {
  await secureStorage.setItem(BIOMETRIC_KEY, enabled ? '1' : '0');
}

export async function isBiometricEnabled(): Promise<boolean> {
  return (await secureStorage.getItem(BIOMETRIC_KEY)) === '1';
}

export async function clearWallet() {
  await secureStorage.removeItem(MNEMONIC_KEY);
  await secureStorage.removeItem(PIN_KEY);
  await secureStorage.removeItem(BIOMETRIC_KEY);
  await secureStorage.removeItem(ACTIVE_ACCOUNT_KEY);
  await secureStorage.removeItem(ACCOUNTS_COUNT_KEY);
}

export function getProvider(rpcUrl: string) {
  return new ethers.JsonRpcProvider(rpcUrl);
}

export async function getBalance(rpcUrl: string, address: string): Promise<string> {
  const provider = getProvider(rpcUrl);
  return ethers.formatEther(await provider.getBalance(address));
}

export async function getTokenBalance(
  rpcUrl: string,
  contractAddress: string,
  address: string,
  decimals: number,
): Promise<string> {
  const provider = getProvider(rpcUrl);
  const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
  const balance = await contract.balanceOf(address);
  return ethers.formatUnits(balance, decimals);
}

export async function sendNative(
  rpcUrl: string,
  privateKey: string,
  to: string,
  amount: string,
): Promise<string> {
  const provider = getProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const tx = await wallet.sendTransaction({ to, value: ethers.parseEther(amount) });
  await tx.wait();
  return tx.hash;
}

export async function sendToken(
  rpcUrl: string,
  privateKey: string,
  contractAddress: string,
  to: string,
  amount: string,
  decimals: number,
): Promise<string> {
  const provider = getProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, ERC20_ABI, wallet);
  const tx = await contract.transfer(to, ethers.parseUnits(amount, decimals));
  await tx.wait();
  return tx.hash;
}

export async function getAllowance(
  rpcUrl: string,
  tokenAddress: string,
  owner: string,
  spender: string,
  decimals = 18,
): Promise<string> {
  const provider = getProvider(rpcUrl);
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const allowance = await contract.allowance(owner, spender);
  return ethers.formatUnits(allowance, decimals);
}

export async function approveToken(
  rpcUrl: string,
  privateKey: string,
  tokenAddress: string,
  spender: string,
  amount: string,
  decimals = 18,
): Promise<string> {
  const provider = getProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
  const tx = await contract.approve(spender, ethers.parseUnits(amount, decimals));
  await tx.wait();
  return tx.hash;
}

export async function signMessage(privateKey: string, message: string): Promise<string> {
  const wallet = new ethers.Wallet(privateKey);
  return wallet.signMessage(message);
}

export async function getTransactionHistory(rpcUrl: string, address: string, limit = 20) {
  const provider = getProvider(rpcUrl);
  const currentBlock = await provider.getBlockNumber();
  const history: { hash: string; from: string; to: string; value: string; block: number }[] = [];
  for (let i = 0; i < 500 && history.length < limit; i++) {
    const block = await provider.getBlock(currentBlock - i, true);
    if (!block?.prefetchedTransactions) continue;
    for (const tx of block.prefetchedTransactions) {
      if (tx.from?.toLowerCase() === address.toLowerCase() || tx.to?.toLowerCase() === address.toLowerCase()) {
        history.push({
          hash: tx.hash,
          from: tx.from ?? '',
          to: tx.to ?? '',
          value: ethers.formatEther(tx.value),
          block: block.number,
        });
        if (history.length >= limit) break;
      }
    }
  }
  return history;
}
