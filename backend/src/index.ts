import { ethers } from "ethers";

const RPC = "http://127.0.0.1:8545";
const VAULT = "VAULT_ADDRESS_HERE";

const abi = [
  "event Deposited(address indexed user, uint256 assets, uint256 shares)",
  "event Withdrawn(address indexed user, uint256 assets, uint256 shares)"
];

async function main() {

  const provider = new ethers.JsonRpcProvider(RPC);

  const vault = new ethers.Contract(
    VAULT,
    abi,
    provider
  );

  console.log("Vault indexer started");

  vault.on("Deposited", (user, assets, shares) => {

    console.log("Deposit detected");

    console.log({
      user,
      assets: assets.toString(),
      shares: shares.toString()
    });

  });

  vault.on("Withdrawn", (user, assets, shares) => {

    console.log("Withdraw detected");

    console.log({
      user,
      assets: assets.toString(),
      shares: shares.toString()
    });

  });

}

main();

