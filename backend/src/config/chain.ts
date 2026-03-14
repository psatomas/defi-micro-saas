import { ethers } from "ethers";

export const RPC_URL = "http://127.0.0.1:8545";

export const provider = new ethers.JsonRpcProvider(RPC_URL);

export const VAULT_ADDRESS = "0x0000000000000000000000000000000000000000";