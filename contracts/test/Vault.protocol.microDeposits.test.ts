// contracts/test/Vault.protocol.microDeposits.test.ts

import { describe, it } from "node:test";              // test runner types
import assert from "node:assert/strict";              // assert for checks
import hre from "hardhat";                             // hardhat network

type Fixture<T> = () => Promise<T>;
function useFixture<T>(fixture: Fixture<T>): Fixture<T> {
  let cache: T | undefined;
  return async () => {
    if (!cache) cache = await fixture();
    return cache;
  };
}

// Helpers
const BI = (v: unknown): bigint => BigInt(v as any);
const E18 = 10n ** 18n;

// Fixture for deploying Vault + MockERC20
const deployFixture = useFixture(async () => {
  const { viem } = await hre.network.connect();
  const users = await viem.getWalletClients();

  const token = await viem.deployContract("MockERC20", []);
  const vault = await viem.deployContract("Vault", [token.address]);

  const mint = 100_000_000n * E18;
  const activeUsers = users.slice(0, 6);
  const MAX = 2n ** 256n - 1n;

  for (const u of activeUsers) {
    await token.write.mint([u.account.address, mint]);
    await token.write.approve([vault.address, MAX], { account: u.account });
  }

  return { token, vault, users: activeUsers, mint };
});

describe("Vault — Micro-deposit Rounding Resistance", () => {
  it("micro-deposit rounding resistance", async () => {
    const { vault, token, users } = await deployFixture();
    const depositor = users[1];

    // Whale deposit to initialize pool
    await vault.write.deposit([1_000_000n * E18], { account: users[0].account });

    const initialBalance = BI(await token.read.balanceOf([depositor.account.address]));

    for (let i = 0; i < 100; i++) {
      const before = BI(await token.read.balanceOf([depositor.account.address]));
      await vault.write.deposit([1n], { account: depositor.account });
      const shares = BI(await vault.read.sharesOf([depositor.account.address]));
      
      console.log(`Iteration ${i}, Depositor shares: ${shares.toString()}`);
      
      if (shares > 0n) {
        await vault.write.withdraw([shares], { account: depositor.account });
      }

      const after = BI(await token.read.balanceOf([depositor.account.address]));
      console.log(`Iteration ${i}, Balance change: ${(after - before).toString()}`);
    }

    const finalBalance = BI(await token.read.balanceOf([depositor.account.address]));
    assert.ok(finalBalance <= initialBalance, "Attacker gained from micro deposits");
  });
});