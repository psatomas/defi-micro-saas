import Database from "better-sqlite3";

export const db = new Database("vault.db");

db.exec(`
CREATE TABLE IF NOT EXISTS vault_state (
  id INTEGER PRIMARY KEY,
  tvl TEXT NOT NULL,
  totalShares TEXT NOT NULL,
  lastProcessedBlock INTEGER DEFAULT 0
);
`);

const columns = db
  .prepare("PRAGMA table_info(vault_state)")
  .all() as { name: string }[];

const hasLastProcessedBlock = columns.some(
  (c) => c.name === "lastProcessedBlock"
);

if (!hasLastProcessedBlock) {
  db.prepare(
    "ALTER TABLE vault_state ADD COLUMN lastProcessedBlock INTEGER DEFAULT 0"
  ).run();
}
