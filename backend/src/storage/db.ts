import Database from "better-sqlite3";

export const db = new Database("vault.db");

db.exec(`
CREATE TABLE IF NOT EXISTS vault_state (
  id INTEGER PRIMARY KEY,
  tvl TEXT NOT NULL,
  totalShares TEXT NOT NULL
);
`);

