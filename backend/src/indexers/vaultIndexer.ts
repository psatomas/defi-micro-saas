import { JsonRpcProvider, Contract, EventLog } from "ethers";
import { VaultABI } from "../abi/VaultABI.js";
import { vaultStateService } from "../services/vaultState.js";
import { loadCursor, saveCursor } from "./indexerCursor.js";

const RPC_URL = "http://127.0.0.1:8545";
const VAULT_ADDRESS = "0x0000000000000000000000000000000000000000";
const CONFIRMATIONS = 6;

export async function startVaultIndexer(): Promise<void> {
  const provider = new JsonRpcProvider(RPC_URL);
  const vault = new Contract(VAULT_ADDRESS, VaultABI, provider);

  const cursor = loadCursor();

  const fromBlock = cursor.lastIndexedBlock + 1;

  const chainHead = await provider.getBlockNumber();
  const safeBlock = chainHead - CONFIRMATIONS;

  console.log("[indexer] syncing", fromBlock, "→", safeBlock);

  if (fromBlock > safeBlock) {
    console.log("[indexer] no confirmed blocks to process");
  } else {
    const depositEvents = await vault.queryFilter("Deposited", fromBlock, safeBlock);
    const withdrawEvents = await vault.queryFilter("Withdrawn", fromBlock, safeBlock);

    const events: EventLog[] = [
      ...depositEvents,
      ...withdrawEvents
    ] as EventLog[];

    events.sort((a, b) => {
      if (a.blockNumber !== b.blockNumber) {
        return a.blockNumber - b.blockNumber;
      }
      return a.index - b.index;
    });

    let latestProcessedBlock = cursor.lastIndexedBlock;

    for (const event of events) {
      const { assets, shares } = event.args;

      if (event.eventName === "Deposited") {
        vaultStateService.applyDeposit(assets, shares);
      }

      if (event.eventName === "Withdrawn") {
        vaultStateService.applyWithdraw(assets, shares);
      }

      if (event.blockNumber > latestProcessedBlock) {
        latestProcessedBlock = event.blockNumber;
      }
    }

    saveCursor({ lastIndexedBlock: latestProcessedBlock });

    console.log("[indexer] historical sync complete");
  }

  // realtime listeners
  vault.on("Deposited", (user: string, assets: bigint, shares: bigint, event) => {
    vaultStateService.applyDeposit(assets, shares);

    saveCursor({
      lastIndexedBlock: event.blockNumber
    });
  });

  vault.on("Withdrawn", (user: string, assets: bigint, shares: bigint, event) => {
    vaultStateService.applyWithdraw(assets, shares);

    saveCursor({
      lastIndexedBlock: event.blockNumber
    });
  });
}
