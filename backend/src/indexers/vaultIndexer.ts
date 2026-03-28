import { JsonRpcProvider, Contract, EventLog } from "ethers";
import { VaultABI } from "../abi/VaultABI.js";
import { vaultStateService } from "../services/vaultState.js";

const RPC_URL = "http://127.0.0.1:8545";
const VAULT_ADDRESS = "0x0000000000000000000000000000000000000000";

export async function startVaultIndexer(): Promise<void> {
  console.log("[indexer] connecting to chain...");

  const provider = new JsonRpcProvider(RPC_URL);
  const vault = new Contract(VAULT_ADDRESS, VaultABI, provider);

  console.log("[indexer] replaying historical events...");

  const depositEvents = await vault.queryFilter("Deposited");
  const withdrawEvents = await vault.queryFilter("Withdrawn");

  for (const e of depositEvents) {
  const event = e as EventLog;

  const { assets, shares } = event.args;
  vaultStateService.applyDeposit(assets, shares);
  }

  for (const e of withdrawEvents) {
  const event = e as EventLog;

  const { assets, shares } = event.args;
  vaultStateService.applyWithdraw(assets, shares);
  }

  console.log("[indexer] state rebuilt from history");

  console.log("[indexer] listening for new events...");

  vault.on("Deposited", (user: string, assets: bigint, shares: bigint) => {
    vaultStateService.applyDeposit(assets, shares);
  });

  vault.on("Withdrawn", (user: string, assets: bigint, shares: bigint) => {
    vaultStateService.applyWithdraw(assets, shares);
  });
}