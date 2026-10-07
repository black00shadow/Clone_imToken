import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getSignClient,
  onSessionProposal,
  onSessionRequest,
  approveProposal,
  rejectProposal,
  respondRequest,
  rejectRequest,
  getSessions,
  pairWithUri,
  disconnectSession,
  WCProposal,
  WCRequest,
  WCSession,
} from '@/services/walletconnect';
import { getAccount, signMessage, sendNative } from '@/services/wallet';
import { handleEthereumRequest } from '@/services/dapp-provider';
import { useBootstrap } from './BootstrapContext';

type WCContextType = {
  sessions: WCSession[];
  pendingProposal: WCProposal | null;
  pendingRequest: WCRequest | null;
  refreshSessions: () => Promise<void>;
  connectUri: (uri: string) => Promise<void>;
  approveSession: () => Promise<void>;
  rejectSession: () => Promise<void>;
  approveRequest: () => Promise<void>;
  rejectPendingRequest: () => Promise<void>;
  disconnect: (topic: string) => Promise<void>;
};

const WCContext = createContext<WCContextType>({
  sessions: [],
  pendingProposal: null,
  pendingRequest: null,
  refreshSessions: async () => {},
  connectUri: async () => {},
  approveSession: async () => {},
  rejectSession: async () => {},
  approveRequest: async () => {},
  rejectPendingRequest: async () => {},
  disconnect: async () => {},
});

export function WalletConnectProvider({ children }: { children: React.ReactNode }) {
  const { data } = useBootstrap();
  const [sessions, setSessions] = useState<WCSession[]>([]);
  const [pendingProposal, setPendingProposal] = useState<WCProposal | null>(null);
  const [pendingRequest, setPendingRequest] = useState<WCRequest | null>(null);

  const refreshSessions = useCallback(async () => {
    setSessions(await getSessions());
  }, []);

  useEffect(() => {
    getSignClient().then(refreshSessions);

    onSessionProposal((proposal) => {
      setPendingProposal(proposal);
    });

    onSessionRequest((request) => {
      setPendingRequest(request);
    });
  }, [refreshSessions]);

  const connectUri = async (uri: string) => {
    await pairWithUri(uri);
  };

  const approveSession = async () => {
    if (!pendingProposal) return;
    const account = await getAccount();
    if (!account) return;
    await approveProposal(pendingProposal, account.address);
    setPendingProposal(null);
    await refreshSessions();
  };

  const rejectSession = async () => {
    if (!pendingProposal) return;
    await rejectProposal(pendingProposal);
    setPendingProposal(null);
  };

  const approveRequest = async () => {
    if (!pendingRequest) return;
    const account = await getAccount();
    if (!account) return;
    const { topic, id, params } = pendingRequest;
    const ethChain = data?.chains.find((c) => c.chainId === 1) ?? data?.chains[0];
    if (!ethChain?.chainId) return;

    try {
      const result = await handleEthereumRequest(
        params.request.method,
        params.request.params as unknown[],
        {
          address: account.address,
          privateKey: account.privateKey,
          rpcUrl: ethChain.rpcUrl,
          chainId: ethChain.chainId,
        },
      );
      await respondRequest(topic, id, result);
    } catch (e) {
      await rejectRequest(topic, id);
    }
    setPendingRequest(null);
  };

  const rejectPendingRequest = async () => {
    if (!pendingRequest) return;
    await rejectRequest(pendingRequest.topic, pendingRequest.id);
    setPendingRequest(null);
  };

  const disconnect = async (topic: string) => {
    await disconnectSession(topic);
    await refreshSessions();
  };

  return (
    <WCContext.Provider
      value={{
        sessions,
        pendingProposal,
        pendingRequest,
        refreshSessions,
        connectUri,
        approveSession,
        rejectSession,
        approveRequest,
        rejectPendingRequest,
        disconnect,
      }}
    >
      {children}
    </WCContext.Provider>
  );
}

export const useWalletConnect = () => useContext(WCContext);
