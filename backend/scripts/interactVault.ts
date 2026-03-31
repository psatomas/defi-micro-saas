import { ethers } from "ethers";
import { VaultABI } from "../src/abi/VaultABI.js";
import { VAULT_ADDRESS, RPC_URL } from "../src/config/chain.js";

async function main() {
  // Use JsonRpcProvider
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  // Get signer correctly for ethers v6 + Hardhat
  const signer = new ethers.Wallet(
    "0x59c6995e998f97a5a0044966f094538c79a65f7f2ca3fa9a4d52f18d8a27e5ab", // first Hardhat account private key
    provider
  );

  // Connect contract with correct runner
  const vault = new ethers.Contract(VAULT_ADDRESS, VaultABI, signer);

  const tokenAddress = await vault.asset();
  const token = new ethers.Contract(
    tokenAddress,
    ["function approve(address spender, uint256 amount) public returns (bool)"],
    signer
  );

  const depositAmount = ethers.parseUnits("1", 18);
  await token.approve(VAULT_ADDRESS, depositAmount);

  const depositTx = await vault.deposit(depositAmount);
  await depositTx.wait();
  console.log("Deposit completed");

  const withdrawTx = await vault.withdraw(ethers.parseUnits("0.5", 18));
  await withdrawTx.wait();
  console.log("Withdraw completed");
}

main().catch(console.error);