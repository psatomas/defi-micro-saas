import { startApiServer } from "./api/server.js";
import { startVaultIndexer } from "./indexers/vaultIndexer.js";

async function main(): Promise<void> {
  console.log("[backend] starting...");

  await startApiServer();
  await startVaultIndexer();

  console.log("[backend] ready");
}

main().catch((err: unknown) => {
  console.error("[backend] fatal error", err);
  process.exit(1);
});

