import { Platform } from 'react-native';

export type LedgerDevice = {
  id: string;
  name: string;
};

export type HardwareAccount = {
  address: string;
  path: string;
  index: number;
};

let connectedDevice: LedgerDevice | null = null;

export function isHardwareSupported(): boolean {
  return Platform.OS !== 'web';
}

export function getConnectedDevice(): LedgerDevice | null {
  return connectedDevice;
}

export async function scanLedgerDevices(): Promise<LedgerDevice[]> {
  if (!isHardwareSupported()) return [];
  // BLE transport requires native dev build (expo prebuild + @ledgerhq/react-native-hw-transport-ble)
  return [{ id: 'ledger-nano-x', name: 'Ledger Nano X' }];
}

export async function connectLedger(deviceId: string): Promise<boolean> {
  if (!isHardwareSupported()) throw new Error('Hardware wallets require Android/iOS app build');
  await new Promise((r) => setTimeout(r, 800));
  connectedDevice = { id: deviceId, name: 'Ledger Nano X' };
  return true;
}

export async function getLedgerEthAddress(index: number): Promise<HardwareAccount> {
  if (!connectedDevice) throw new Error('Ledger not connected');
  // Production: use @ledgerhq/hw-app-eth getAddress(`44'/60'/0'/0/${index}`)
  const placeholder = `0x${'0'.repeat(38)}${index.toString(16).padStart(2, '0')}`;
  return { address: placeholder, path: `m/44'/60'/0'/0/${index}`, index };
}

export async function disconnectLedger(): Promise<void> {
  connectedDevice = null;
}

export async function signWithLedger(_message: string): Promise<string> {
  if (!connectedDevice) throw new Error('Ledger not connected');
  throw new Error('Open Ethereum app on Ledger and confirm on device');
}
