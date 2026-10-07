import { ethers } from 'ethers';

const ERC721_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function tokenOfOwnerByIndex(address,uint256) view returns (uint256)',
  'function tokenURI(uint256) view returns (string)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function safeTransferFrom(address,address,uint256)',
];

export type NftItem = {
  contractAddress: string;
  tokenId: string;
  name: string;
  collection: string;
  imageUrl?: string;
};

export async function fetchNfts(
  rpcUrl: string,
  owner: string,
  contracts: { address: string; name: string }[],
): Promise<NftItem[]> {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const items: NftItem[] = [];

  for (const c of contracts) {
    try {
      const contract = new ethers.Contract(c.address, ERC721_ABI, provider);
      const balance = await contract.balanceOf(owner);
      const count = Number(balance);
      const collection = await contract.name().catch(() => c.name);
      for (let i = 0; i < Math.min(count, 20); i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(owner, i);
        let imageUrl: string | undefined;
        try {
          const uri = await contract.tokenURI(tokenId);
          const metaUrl = uri.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${uri.slice(7)}` : uri;
          const metaRes = await fetch(metaUrl);
          const meta = await metaRes.json();
          imageUrl = meta.image?.startsWith('ipfs://')
            ? `https://ipfs.io/ipfs/${meta.image.slice(7)}`
            : meta.image;
        } catch {
          /* metadata optional */
        }
        items.push({
          contractAddress: c.address,
          tokenId: tokenId.toString(),
          name: `${collection} #${tokenId}`,
          collection,
          imageUrl,
        });
      }
    } catch {
      /* skip unsupported contracts */
    }
  }
  return items;
}

export async function transferNft(
  rpcUrl: string,
  privateKey: string,
  contractAddress: string,
  to: string,
  tokenId: string,
): Promise<string> {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, ERC721_ABI, wallet);
  const tx = await contract.safeTransferFrom(await wallet.getAddress(), to, tokenId);
  await tx.wait();
  return tx.hash;
}
