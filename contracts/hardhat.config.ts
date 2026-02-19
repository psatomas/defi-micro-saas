import { defineConfig } from "hardhat/config";
import viemPlugin from "@nomicfoundation/hardhat-viem";
import networkHelpersPlugin from "@nomicfoundation/hardhat-network-helpers";

export default defineConfig({
  solidity: "0.8.28",
  plugins: [
    viemPlugin,
    networkHelpersPlugin
  ],
});

