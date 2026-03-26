export type VaultState = {
  tvl: bigint;
  totalShares: bigint;
  sharePrice: number;
};

export function createVaultStateService() {
  let state: VaultState = {
    tvl: 0n,
    totalShares: 0n,
    sharePrice: 0,
  };

  function recomputeSharePrice() {
    if (state.totalShares === 0n) {
      state.sharePrice = 0;
      return;
    }

    state.sharePrice =
      Number(state.tvl) / Number(state.totalShares);
  }

  return {
    getState(): VaultState {
      return { ...state };
    },

    applyDeposit(assets: bigint, shares: bigint) {
      state.tvl += assets;
      state.totalShares += shares;

      recomputeSharePrice();
    },

    applyWithdraw(assets: bigint, shares: bigint) {
      state.tvl -= assets;
      state.totalShares -= shares;

      recomputeSharePrice();
    },
  };
}

export const vaultStateService = createVaultStateService();