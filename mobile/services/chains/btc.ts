import '@/polyfills';
import 'react-native-get-random-values';
import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';
import ECPairFactory from 'ecpair';
import * as ecc from '@bitcoinerlab/secp256k1';
import * as bitcoin from 'bitcoinjs-lib';

const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);

export function deriveBtcAddress(mnemonic: string, index: number): string {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed);
  const child = root.derivePath(`m/84'/0'/0'/0/${index}`);
  const { address } = bitcoin.payments.p2wpkh({
    pubkey: child.publicKey,
    network: bitcoin.networks.bitcoin,
  });
  if (!address) throw new Error('Failed to derive BTC address');
  return address;
}

export function deriveBtcPrivateKey(mnemonic: string, index: number): Uint8Array {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed);
  const child = root.derivePath(`m/84'/0'/0'/0/${index}`);
  if (!child.privateKey) throw new Error('No private key');
  return child.privateKey;
}

export async function getBtcBalance(address: string): Promise<string> {
  try {
    const res = await fetch(`https://blockstream.info/api/address/${address}`);
    if (!res.ok) return '0';
    const data = await res.json();
    const sats = (data.chain_stats?.funded_txo_sum ?? 0) - (data.chain_stats?.spent_txo_sum ?? 0);
    return (sats / 1e8).toFixed(8);
  } catch {
    return '0';
  }
}

export async function sendBtc(mnemonic: string, index: number, to: string, amountBtc: string): Promise<string> {
  const privateKey = deriveBtcPrivateKey(mnemonic, index);
  const ecPair = ECPair.fromPrivateKey(Buffer.from(privateKey), { network: bitcoin.networks.bitcoin });
  const fromAddress = deriveBtcAddress(mnemonic, index);

  const utxoRes = await fetch(`https://blockstream.info/api/address/${fromAddress}/utxo`);
  const utxos = await utxoRes.json();
  if (!utxos.length) throw new Error('No UTXOs');

  const psbt = new bitcoin.Psbt({ network: bitcoin.networks.bitcoin });
  let total = 0;
  const amountSats = Math.floor(parseFloat(amountBtc) * 1e8);
  const fee = 1000;

  for (const utxo of utxos) {
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        script: bitcoin.payments.p2wpkh({ pubkey: ecPair.publicKey }).output!,
        value: BigInt(utxo.value),
      },
    });
    total += utxo.value;
    if (total >= amountSats + fee) break;
  }

  if (total < amountSats + fee) throw new Error('Insufficient balance');

  psbt.addOutput({ address: to, value: BigInt(amountSats) });
  if (total > amountSats + fee) {
    psbt.addOutput({ address: fromAddress, value: BigInt(total - amountSats - fee) });
  }

  psbt.signAllInputs(ecPair);
  psbt.finalizeAllInputs();
  const tx = psbt.extractTransaction();
  const txHex = tx.toHex();
  const txId = tx.getId();

  const broadcast = await fetch('https://blockstream.info/api/tx', {
    method: 'POST',
    body: txHex,
  });
  if (!broadcast.ok) throw new Error('Broadcast failed');
  return txId;
}
