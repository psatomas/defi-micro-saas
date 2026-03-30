import { db } from "./db.js";

type VaultRow = {
  tvl: string;
  totalShares: string;
  lastProcessedBlock: number;
};

export function loadVaultState() {
  const row = db
    .prepare(
      "SELECT tvl, totalShares, lastProcessedBlock FROM vault_state WHERE id = 1"
    )
    .get() as VaultRow | undefined;

  if (!row) {
    return {
      tvl: 0n,
      totalShares: 0n,
      lastProcessedBlock: 0,
    };
  }

  return {
    tvl: BigInt(row.tvl),
    totalShares: BigInt(row.totalShares),
    lastProcessedBlock: row.lastProcessedBlock ?? 0,
  };
}

export function saveVaultState(
  tvl: bigint,
  totalShares: bigint,
  lastProcessedBlock: number
) {
  db.prepare(`
    INSERT INTO vault_state (id, tvl, totalShares, lastProcessedBlock)
    VALUES (1, ?, ?, ?)
    ON CONFLICT(id)
    DO UPDATE SET
      tvl = excluded.tvl,
      totalShares = excluded.totalShares,
      lastProcessedBlock = excluded.lastProcessedBlock
  `).run(tvl.toString(), totalShares.toString(), lastProcessedBlock);
}