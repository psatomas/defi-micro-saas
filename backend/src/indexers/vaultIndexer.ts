import { Contract, JsonRpcProvider } from "ethers";
import { VAULT_ADDRESS, RPC_URL } from "../config/chain.js";
import { VaultABI } from "../abi/VaultABI.js";
import {
  updateVaultStateFromDeposit,
  updateVaultStateFromWithdraw,
  logVaultState,
} from "../services/vaultState.js";

export async function startVaultIndexer() {
  const provider = new JsonRpcProvider(RPC_URL);

  const network = await provider.getNetwork();
  console.log(
    `[vault-indexer] connected to chainId=${network.chainId.toString()} rpc=${RPC_URL}`
  );

  const vault = new Contract(VAULT_ADDRESS, VaultABI, provider);

  console.log(`[vault-indexer] listening at vault=${VAULT_ADDRESS}`);

  vault.on("Deposit", async (...args) => {
    try {
      const event = args[args.length - 1];
      const [, assets, shares] = args;

      updateVaultStateFromDeposit({
        assets,
        shares,
        blockNumber: event.log.blockNumber,
        txHash: event.log.transactionHash,
      });

      console.log("[vault-indexer] Deposit event processed");
      logVaultState();
    } catch (error) {
      console.error("[vault-indexer] failed to process Deposit:", error);
    }
  });

  vault.on("Withdraw", async (...args) => {
    try {
      const event = args[args.length - 1];
      const [, , , assets, shares] = args;

      updateVaultStateFromWithdraw({
        assets,
        shares,
        blockNumber: event.log.blockNumber,
        txHash: event.log.transactionHash,
      });

      console.log("[vault-indexer] Withdraw event processed");
      logVaultState();
    } catch (error) {
      console.error("[vault-indexer] failed to process Withdraw:", error);
    }
  });
}