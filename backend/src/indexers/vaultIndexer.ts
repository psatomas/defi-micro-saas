import { JsonRpcProvider, Contract } from "ethers";
import { VaultABI } from "../abi/VaultABI.js";
import { vaultStateService } from "../services/vaultState.js";

const RPC_URL = "http://127.0.0.1:8545";
const VAULT_ADDRESS = "0x0000000000000000000000000000000000000000";

export async function startVaultIndexer(): Promise<void> {
  console.log("[indexer] connecting to chain...");

  const provider = new JsonRpcProvider(RPC_URL);
  const vault = new Contract(VAULT_ADDRESS, VaultABI, provider);

  console.log("[indexer] listening for vault events...");

  vault.on("Deposited", (user: string, assets: bigint, shares: bigint) => {
    console.log("[event] Deposited", { user, assets, shares });

    vaultStateService.applyDeposit(assets, shares);
  });

  vault.on("Withdrawn", (user: string, assets: bigint, shares: bigint) => {
    console.log("[event] Withdrawn", { user, assets, shares });

    vaultStateService.applyWithdraw(assets, shares);
  });
}