import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as walletService from '@/services/wallet';
import type { WalletAccount } from '@/services/wallet';

type WalletContextType = {
  isReady: boolean;
  hasWallet: boolean;
  isUnlocked: boolean;
  address: string | null;
  accounts: WalletAccount[];
  activeAccount: WalletAccount | null;
  biometricEnabled: boolean;
  refresh: () => Promise<void>;
  unlock: (pin: string) => Promise<boolean>;
  unlockWithBiometric: () => Promise<boolean>;
  lock: () => void;
  switchAccount: (index: number) => Promise<void>;
  addAccount: () => Promise<void>;
  setBiometric: (enabled: boolean) => Promise<void>;
  logout: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType>({
  isReady: false,
  hasWallet: false,
  isUnlocked: false,
  address: null,
  accounts: [],
  activeAccount: null,
  biometricEnabled: false,
  refresh: async () => {},
  unlock: async () => false,
  unlockWithBiometric: async () => false,
  lock: () => {},
  switchAccount: async () => {},
  addAccount: async () => {},
  setBiometric: async () => {},
  logout: async () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<WalletAccount | null>(null);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);

  const refresh = useCallback(async () => {
    const exists = await walletService.hasWallet();
    setHasWallet(exists);
    const bio = await walletService.isBiometricEnabled();
    setBiometricEnabledState(bio);
    if (exists) {
      const all = await walletService.getAllAccounts();
      const active = await walletService.getAccount();
      setAccounts(all);
      setActiveAccount(active);
    } else {
      setAccounts([]);
      setActiveAccount(null);
      setIsUnlocked(false);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setIsReady(true));
  }, [refresh]);

  const unlock = async (pin: string) => {
    const ok = await walletService.verifyPin(pin);
    if (ok) setIsUnlocked(true);
    return ok;
  };

  const unlockWithBiometric = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!compatible || !enrolled) return false;
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Wallet',
      fallbackLabel: 'Use PIN',
    });
    if (result.success) {
      setIsUnlocked(true);
      return true;
    }
    return false;
  };

  const lock = () => setIsUnlocked(false);

  const switchAccount = async (index: number) => {
    await walletService.setActiveAccountIndex(index);
    await refresh();
  };

  const addAccount = async () => {
    await walletService.addAccount();
    await refresh();
  };

  const setBiometric = async (enabled: boolean) => {
    await walletService.setBiometricEnabled(enabled);
    setBiometricEnabledState(enabled);
  };

  const logout = async () => {
    await walletService.clearWallet();
    setIsUnlocked(false);
    await refresh();
  };

  return (
    <WalletContext.Provider
      value={{
        isReady,
        hasWallet,
        isUnlocked,
        address: activeAccount?.address ?? null,
        accounts,
        activeAccount,
        biometricEnabled,
        refresh,
        unlock,
        unlockWithBiometric,
        lock,
        switchAccount,
        addAccount,
        setBiometric,
        logout,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
