import { ethers } from "ethers";
import { provider, VAULT_ADDRESS, logNetwork } from "./config/chain.js";

const abi = [
  "event Deposited(address indexed user, uint256 assets, uint256 shares)",
  "event Withdrawn(address indexed user, uint256 assets, uint256 shares)"
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
    console.log("Deposit", user, assets.toString(), shares.toString());
  });

  vault.on("Withdrawn", (user, assets, shares) => {
    console.log("Withdraw", user, assets.toString(), shares.toString());
  });
}

main().catch(console.error);

