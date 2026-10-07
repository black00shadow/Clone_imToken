import { ethers } from 'ethers';

export function getInjectedEthereumScript(chainId: number, address: string) {
  return `
(function() {
  if (window.ethereum) return;
  const chainId = '0x${chainId.toString(16)}';
  const address = '${address.toLowerCase()}';
  let requestId = 0;
  const pending = {};

  window.ethereum = {
    isMetaMask: true,
    isWallet: true,
    chainId,
    selectedAddress: address,
    networkVersion: String(parseInt(chainId, 16)),
    _events: {},
    on(event, cb) { this._events[event] = cb; },
    removeListener(event) { delete this._events[event]; },
    request: async ({ method, params }) => {
      return new Promise((resolve, reject) => {
        const id = ++requestId;
        pending[id] = { resolve, reject };
        window.ReactNativeWebView.postMessage(JSON.stringify({ id, method, params }));
      });
    },
    enable: async () => [address],
  };

  window.__handleEthereumResponse = (id, result, error) => {
    const p = pending[id];
    if (!p) return;
    delete pending[id];
    if (error) p.reject(new Error(error));
    else p.resolve(result);
  };

  window.dispatchEvent(new Event('ethereum#initialized'));
})();
true;
`;
}

export async function handleEthereumRequest(
  method: string,
  params: unknown[],
  ctx: { address: string; privateKey: string; rpcUrl: string; chainId: number },
): Promise<unknown> {
  const provider = new ethers.JsonRpcProvider(ctx.rpcUrl);
  const wallet = new ethers.Wallet(ctx.privateKey, provider);

  switch (method) {
    case 'eth_accounts':
    case 'eth_requestAccounts':
      return [ctx.address];
    case 'eth_chainId':
      return `0x${ctx.chainId.toString(16)}`;
    case 'net_version':
      return String(ctx.chainId);
    case 'personal_sign': {
      const message = params[0] as string;
      return wallet.signMessage(ethers.getBytes(message.startsWith('0x') ? message : message));
    }
    case 'eth_sign': {
      return wallet.signMessage(params[1] as string);
    }
    case 'eth_sendTransaction': {
      const tx = params[0] as { to?: string; value?: string; data?: string; gas?: string };
      const sent = await wallet.sendTransaction({
        to: tx.to,
        value: tx.value ? BigInt(tx.value) : 0n,
        data: tx.data,
        gasLimit: tx.gas ? BigInt(tx.gas) : undefined,
      });
      await sent.wait();
      return sent.hash;
    }
    case 'wallet_switchEthereumChain':
      return null;
    default:
      return provider.send(method, params as unknown[]);
  }
}
