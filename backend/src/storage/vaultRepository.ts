import { db } from "./db.js";

type VaultRow = {
  tvl: string;
  totalShares: string;
};

export function loadVaultState() {
  const row = db
    .prepare("SELECT tvl, totalShares FROM vault_state WHERE id = 1")
    .get() as VaultRow | undefined;

  if (!row) {
    return {
      tvl: 0n,
      totalShares: 0n,
    };
  }

  return {
    tvl: BigInt(row.tvl),
    totalShares: BigInt(row.totalShares),
  };
}

export function saveVaultState(tvl: bigint, totalShares: bigint) {
  db.prepare(`
    INSERT INTO vault_state (id, tvl, totalShares)
    VALUES (1, ?, ?)
    ON CONFLICT(id)
    DO UPDATE SET
      tvl = excluded.tvl,
      totalShares = excluded.totalShares
  `).run(tvl.toString(), totalShares.toString());
}