import '@/polyfills';
import 'react-native-get-random-values';
import SignClient from '@walletconnect/sign-client';
import type { SignClientTypes } from '@walletconnect/types';

export type WCSession = {
  topic: string;
  peerName: string;
  peerUrl: string;
};

export type WCProposal = SignClientTypes.EventArguments['session_proposal'];
export type WCRequest = SignClientTypes.EventArguments['session_request'];

let client: SignClient | null = null;
let proposalHandler: ((p: WCProposal) => void) | null = null;
let requestHandler: ((r: WCRequest) => void) | null = null;

export function onSessionProposal(handler: (p: WCProposal) => void) {
  proposalHandler = handler;
}

export function onSessionRequest(handler: (r: WCRequest) => void) {
  requestHandler = handler;
}

export async function getSignClient(): Promise<SignClient> {
  if (client) return client;
  const projectId = process.env.EXPO_PUBLIC_WC_PROJECT_ID ?? 'a01b9639353caa1d2c8c1b0e4a1e1234';
  client = await SignClient.init({
    projectId,
    metadata: {
      name: 'Wallet',
      description: 'Multi-chain Wallet App',
      url: 'https://wallet.app',
      icons: ['https://wallet.app/icon.png'],
    },
  });

  client.on('session_proposal', (proposal) => proposalHandler?.(proposal));
  client.on('session_request', (request) => requestHandler?.(request));

  return client;
}

export async function pairWithUri(uri: string) {
  const c = await getSignClient();
  await c.pair({ uri: uri.trim() });
}

export async function approveProposal(
  proposal: WCProposal,
  ethAddress: string,
  chainIds: number[] = [1, 56, 137, 42161, 10, 8453],
) {
  const c = await getSignClient();
  const accounts = chainIds.map((id) => `eip155:${id}:${ethAddress}`);
  const chains = chainIds.map((id) => `eip155:${id}`);
  return c.approve({
    id: proposal.id,
    namespaces: {
      eip155: {
        accounts,
        chains,
        methods: [
          'eth_sendTransaction',
          'eth_signTransaction',
          'personal_sign',
          'eth_sign',
          'eth_signTypedData',
          'eth_signTypedData_v4',
          'wallet_switchEthereumChain',
        ],
        events: ['chainChanged', 'accountsChanged'],
      },
    },
  });
}

export async function rejectProposal(proposal: WCProposal) {
  const c = await getSignClient();
  await c.reject({ id: proposal.id, reason: { code: 5000, message: 'User rejected' } });
}

export async function respondRequest(topic: string, id: number, result: unknown) {
  const c = await getSignClient();
  await c.respond({ topic, response: { id, jsonrpc: '2.0', result } });
}

export async function rejectRequest(topic: string, id: number) {
  const c = await getSignClient();
  await c.respond({
    topic,
    response: { id, jsonrpc: '2.0', error: { code: 5000, message: 'User rejected' } },
  });
}

export async function getSessions(): Promise<WCSession[]> {
  const c = await getSignClient();
  return Object.values(c.session.getAll()).map((s) => ({
    topic: s.topic,
    peerName: s.peer.metadata.name,
    peerUrl: s.peer.metadata.url,
  }));
}

export async function disconnectSession(topic: string) {
  const c = await getSignClient();
  await c.disconnect({ topic, reason: { code: 6000, message: 'Disconnected' } });
}

export function isWalletConnectUri(text: string): boolean {
  return text.startsWith('wc:');
}
