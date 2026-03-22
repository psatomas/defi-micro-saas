import Fastify from "fastify";
import { vaultStateService } from "../services/vaultState.js";

export async function startApiServer() {
  const app = Fastify();

  app.get("/vault", async () => {
    return vaultStateService.getState();
  });

  await app.listen({ port: 3000 });

  console.log("[api] server running on :3000");
}