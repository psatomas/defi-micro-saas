let tvl = 0n
let totalShares = 0n

export function onDeposit(assets: bigint, shares: bigint) {
  tvl += assets
  totalShares += shares
}

export function onWithdraw(assets: bigint, shares: bigint) {
  tvl -= assets
  totalShares -= shares
}

export function getState() {
  return {
    tvl,
    totalShares,
    sharePrice: calculateSharePrice()
  }
}

function calculateSharePrice(): bigint {
  if (totalShares === 0n) return 1_000_000_000_000_000_000n
  return (tvl * 1_000_000_000_000_000_000n) / totalShares
}