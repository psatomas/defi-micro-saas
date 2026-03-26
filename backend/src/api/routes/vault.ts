import { FastifyInstance } from "fastify";
import { vaultStateService } from "../../services/vaultState.js";

export async function vaultRoutes(app: FastifyInstance) {
  app.get("/vault", async () => {
    const state = vaultStateService.getState();

    return {
      tvl: state.tvl.toString(),
      totalShares: state.totalShares.toString(),
      sharePrice: state.sharePrice,
    };
  });
}