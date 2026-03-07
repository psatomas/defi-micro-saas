// back/vaultIndexer.ts
import { createPublicClient, http, type PublicClient } from "viem";
import { mainnet } from "viem/chains";
import { VaultABI } from "./VaultABI";

// Configuração
const vaultAddress = "0xYourVaultAddressHere"; // substitua pelo endereço real

const client: PublicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

// Estado interno
let tvl = 0n;
let totalShares = 0n;

// Helper: share price
function calculateSharePrice(): bigint {
  if (totalShares === 0n) return 1_000_000_000_000_000_000n; // 1e18
  return (tvl * 1_000_000_000_000_000_000n) / totalShares;
}

// Listener Deposited
client.watchContractEvent({
  address: vaultAddress,
  abi: VaultABI,
  eventName: "Deposited",
  onLogs: (log) => {
    const { user, assets, shares } = log.args as {
      user: string;
      assets: bigint;
      shares: bigint;
    };
    tvl += assets;
    totalShares += shares;
    console.log(`[Deposited] User: ${user}, Assets: ${assets}, Shares: ${shares}`);
    console.log(`TVL: ${tvl}, Share Price: ${calculateSharePrice()}`);
  },
});

// Listener Withdrawn
client.watchContractEvent({
  address: vaultAddress,
  abi: VaultABI,
  eventName: "Withdrawn",
  onLogs: (log) => {
    const { user, assets, shares } = log.args as {
      user: string;
      assets: bigint;
      shares: bigint;
    };
    tvl -= assets;
    totalShares -= shares;
    console.log(`[Withdrawn] User: ${user}, Assets: ${assets}, Shares: ${shares}`);
    console.log(`TVL: ${tvl}, Share Price: ${calculateSharePrice()}`);
  },
});

console.log("VaultIndexer rodando...");