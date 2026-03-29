import { loadVaultState, saveVaultState } from "../storage/vaultRepository.js";

export type VaultState = {
  tvl: bigint;
  totalShares: bigint;
  sharePrice: number;
};

export function createVaultStateService() {

  const persisted = loadVaultState();

  let state: VaultState = {
    tvl: persisted.tvl,
    totalShares: persisted.totalShares,
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

      saveVaultState(state.tvl, state.totalShares);
    },

    applyWithdraw(assets: bigint, shares: bigint) {
      state.tvl -= assets;
      state.totalShares -= shares;

      recomputeSharePrice();

      saveVaultState(state.tvl, state.totalShares);
    },
  };
}

export const vaultStateService = createVaultStateService();