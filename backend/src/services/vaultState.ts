type VaultState = {
  tvl: bigint;
  totalShares: bigint;
};

const state: VaultState = {
  tvl: 0n,
  totalShares: 0n,
};

export function applyDeposit(assets: bigint, shares: bigint) {
  state.tvl += assets;
  state.totalShares += shares;
}

export function applyWithdraw(assets: bigint, shares: bigint) {
  state.tvl -= assets;
  state.totalShares -= shares;
}

export function getSharePrice(): bigint {
  if (state.totalShares === 0n) {
    return 1_000_000_000_000_000_000n;
  }

  return (state.tvl * 1_000_000_000_000_000_000n) / state.totalShares;
}

export function getVaultState() {
  return {
    tvl: state.tvl,
    totalShares: state.totalShares,
    sharePrice: getSharePrice(),
  };
}