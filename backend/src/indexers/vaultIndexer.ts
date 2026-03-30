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

  const fromBlock = cursor.lastIndexedBlock + 1;

  console.log("[indexer] starting from block", fromBlock);

  const depositEvents = await vault.queryFilter("Deposited", fromBlock);
  const withdrawEvents = await vault.queryFilter("Withdrawn", fromBlock);

  // merge events
  const events: EventLog[] = [
    ...depositEvents,
    ...withdrawEvents
  ] as EventLog[];

  // deterministic ordering
  events.sort((a, b) => {
    if (a.blockNumber !== b.blockNumber) {
      return a.blockNumber - b.blockNumber;
    }
    return a.index - b.index;
  });

  let latestBlock = cursor.lastIndexedBlock;

  for (const event of events) {
    const { assets, shares } = event.args;

    if (event.eventName === "Deposited") {
      vaultStateService.applyDeposit(assets, shares);
    }

    if (event.eventName === "Withdrawn") {
      vaultStateService.applyWithdraw(assets, shares);
    }

    if (event.blockNumber > latestBlock) {
      latestBlock = event.blockNumber;
    }
  }

  saveCursor({ lastIndexedBlock: latestBlock });

  console.log("[indexer] historical sync complete");

  vault.on("Deposited", (user: string, assets: bigint, shares: bigint, event) => {
    vaultStateService.applyDeposit(assets, shares);
    saveCursor({
      lastIndexedBlock: Math.max(cursor.lastIndexedBlock, event.log.blockNumber)
    });
  });

  vault.on("Withdrawn", (user: string, assets: bigint, shares: bigint, event) => {
    saveCursor({
      lastIndexedBlock: Math.max(cursor.lastIndexedBlock, event.log.blockNumber)
    });
  })
};
