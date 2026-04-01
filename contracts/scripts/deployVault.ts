import { network } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  // Connect to Hardhat network with viem
  const { viem } = await network.connect({
    network: "hardhatOp",
    chainType: "op",
  });

  const publicClient = await viem.getPublicClient();
  const [walletClient] = await viem.getWalletClients();

  console.log("Deploying Vault contract using OP network");

  // Load Vault artifact
  const artifactPath = path.resolve(
    __dirname,
    "../artifacts/contracts/Vault.sol/Vault.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const { abi, bytecode } = artifact;

  // Deploy contract
  const deployTx = await walletClient.deployContract({
    abi,
    bytecode,
    account: walletClient.account.address,
  });

  console.log("Transaction sent, waiting for confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: deployTx,
  });

  console.log("Vault deployed at:", receipt.contractAddress);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});