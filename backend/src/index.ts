import { startVaultIndexer } from "./indexers/vaultIndexer.js";

async function main() {
  console.log("[backend] starting vault indexer...");
  await startVaultIndexer();
}

main().catch((error) => {
  console.error("[backend] fatal error:", error);
  process.exit(1);
});

