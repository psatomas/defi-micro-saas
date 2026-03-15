import { ethers } from "ethers";

export const RPC_URL = "http://127.0.0.1:8545";

export const provider = new ethers.JsonRpcProvider(RPC_URL);

export const VAULT_ADDRESS: string =
  "0x0000000000000000000000000000000000000000";

export async function logNetwork() {
  const network = await provider.getNetwork();

  console.log("Connected network:", {
    chainId: network.chainId,
    name: network.name
  });
}