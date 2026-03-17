import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"
import { VaultABI } from "../abi/VaultABI.js"
import { onDeposit, onWithdraw, getState } from "../services/vaultState.js"

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const vaultAddress = "0xYourVaultAddressHere"

client.watchContractEvent({
  address: vaultAddress,
  abi: VaultABI,
  eventName: "Deposited",
  onLogs: (logs) => {
    for (const log of logs) {
      const { assets, shares } = log.args as any

      onDeposit(assets, shares)

      console.log("Deposit:", getState())
    }
  },
})

client.watchContractEvent({
  address: vaultAddress,
  abi: VaultABI,
  eventName: "Withdrawn",
  onLogs: (logs) => {
    for (const log of logs) {
      const { assets, shares } = log.args as any

      onWithdraw(assets, shares)

      console.log("Withdraw:", getState())
    }
  },
})

console.log("VaultIndexer rodando...")