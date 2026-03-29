import { JsonRpcProvider, Contract, EventLog } from "ethers";
import { VaultABI } from "../abi/VaultABI.js";
import { vaultStateService } from "../services/vaultState.js";
import { loadCursor, saveCursor } from "./indexerCursor.js";

const RPC_URL = "http://127.0.0.1:8545";
const VAULT_ADDRESS = "0x0000000000000000000000000000000000000000";

export async function startVaultIndexer(): Promise<void> {
  const provider = new JsonRpcProvider(RPC_URL);
  const vault = new Contract(VAULT_ADDRESS, VaultABI, provider);

  const cursor = loadCursor();

  console.log("[indexer] starting from block", cursor.lastIndexedBlock);

  const depositEvents = await vault.queryFilter(
    "Deposited",
    cursor.lastIndexedBlock
  );

  const withdrawEvents = await vault.queryFilter(
    "Withdrawn",
    cursor.lastIndexedBlock
  );

  let latestBlock = cursor.lastIndexedBlock;

  for (const e of depositEvents) {
    const event = e as EventLog;
    const { assets, shares } = event.args;

    vaultStateService.applyDeposit(assets, shares);

    if (event.blockNumber > latestBlock) {
      latestBlock = event.blockNumber;
    }
  }

  for (const e of withdrawEvents) {
    const event = e as EventLog;
    const { assets, shares } = event.args;

    vaultStateService.applyWithdraw(assets, shares);

    if (event.blockNumber > latestBlock) {
      latestBlock = event.blockNumber;
    }
  }

  saveCursor({ lastIndexedBlock: latestBlock });

  console.log("[indexer] historical sync complete");

  vault.on("Deposited", (user: string, assets: bigint, shares: bigint, event) => {
    vaultStateService.applyDeposit(assets, shares);

    saveCursor({ lastIndexedBlock: event.log.blockNumber });
  });

  vault.on("Withdrawn", (user: string, assets: bigint, shares: bigint, event) => {
    vaultStateService.applyWithdraw(assets, shares);

    saveCursor({ lastIndexedBlock: event.log.blockNumber });
  });
}