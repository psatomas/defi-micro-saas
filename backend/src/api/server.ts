import Fastify from "fastify";
import { vaultRoutes } from "./routes/vault.js";

export async function startApiServer() {
  const app = Fastify();

  await app.register(vaultRoutes);

  await app.listen({ port: 3000 });

  console.log("[api] server running on :3000");
}