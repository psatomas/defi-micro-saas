type VaultState = {
  tvl: bigint;
  totalShares: bigint;
  sharePrice: bigint;
  lastUpdatedBlock?: number;
  lastUpdatedTx?: string;
};

type VaultEventInput = {
  assets: bigint;
  shares: bigint;
  blockNumber?: number;
  txHash?: string;
};

const PRECISION = 10n ** 18n;

const vaultState: VaultState = {
  tvl: 0n,
  totalShares: 0n,
  sharePrice: PRECISION,
};

function recalculateSharePrice() {
  if (vaultState.totalShares === 0n) {
    vaultState.sharePrice = PRECISION;
    return;
  }

  vaultState.sharePrice = (vaultState.tvl * PRECISION) / vaultState.totalShares;
}

export function updateVaultStateFromDeposit(input: VaultEventInput) {
  vaultState.tvl += input.assets;
  vaultState.totalShares += input.shares;
  vaultState.lastUpdatedBlock = input.blockNumber;
  vaultState.lastUpdatedTx = input.txHash;
  recalculateSharePrice();
}

export function updateVaultStateFromWithdraw(input: VaultEventInput) {
  vaultState.tvl -= input.assets;
  vaultState.totalShares -= input.shares;
  vaultState.lastUpdatedBlock = input.blockNumber;
  vaultState.lastUpdatedTx = input.txHash;
  recalculateSharePrice();
}

export function getVaultState() {
  return { ...vaultState };
}

export function logVaultState() {
  console.log("[vault-state]", {
    tvl: vaultState.tvl.toString(),
    totalShares: vaultState.totalShares.toString(),
    sharePrice: vaultState.sharePrice.toString(),
    lastUpdatedBlock: vaultState.lastUpdatedBlock,
    lastUpdatedTx: vaultState.lastUpdatedTx,
  });
}