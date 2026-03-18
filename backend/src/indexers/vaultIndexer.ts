import { ethers } from "ethers";
import { provider, VAULT_ADDRESS, logNetwork } from "../config/chain.js";
import {
  applyDeposit,
  applyWithdraw,
  getVaultState,
} from "../services/vaultState.js";

const abi = [
  "event Deposited(address indexed user, uint256 assets, uint256 shares)",
  "event Withdrawn(address indexed user, uint256 assets, uint256 shares)",
];

async function main() {
  await logNetwork();

  const vault = new ethers.Contract(
    VAULT_ADDRESS,
    abi,
    provider
  );

  console.log("Vault indexer started");

  vault.on("Deposited", (user, assets, shares) => {
    applyDeposit(assets, shares);

    console.log("Deposit", user, assets.toString(), shares.toString());
    console.log("State", {
      tvl: getVaultState().tvl.toString(),
      totalShares: getVaultState().totalShares.toString(),
      sharePrice: getVaultState().sharePrice.toString(),
    });
  });

  vault.on("Withdrawn", (user, assets, shares) => {
    applyWithdraw(assets, shares);

    console.log("Withdraw", user, assets.toString(), shares.toString());
    console.log("State", {
      tvl: getVaultState().tvl.toString(),
      totalShares: getVaultState().totalShares.toString(),
      sharePrice: getVaultState().sharePrice.toString(),
    });
  });
}

main().catch(console.error);