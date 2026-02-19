import { describe, it } from "node:test";
import assert from "node:assert/strict";
import hre from "hardhat";

// --- Self-made fixture loader
type Fixture<T> = () => Promise<T>;
function useFixture<T>(fixture: Fixture<T>): Fixture<T> {
  let cache: T | undefined;
  return async () => {
    if (!cache) cache = await fixture();
    return cache;
  };
}

describe("Vault", () => {

  // deployFixture defines the contracts we need
  const deployFixture = useFixture(async () => {
    const { viem } = await hre.network.connect();

    const [alice, bob] = await viem.getWalletClients();

    const token = await viem.deployContract(
      "MockERC20",
      ["Mock Token", "MOCK", 18]
    );

    const vault = await viem.deployContract(
      "Vault",
      [token.address]
    );

    const amount = 1_000n * 10n ** 18n;

    // mint and approve
    await token.write.mint([alice.account.address, amount]);
    await token.write.mint([bob.account.address, amount]);

    await token.write.approve([vault.address, amount], { account: alice.account });
    await token.write.approve([vault.address, amount], { account: bob.account });

    return { token, vault, alice, bob, amount };
  });

  it("deposit mints correct shares", async () => {
    const { vault, alice, amount } = await deployFixture();
    await vault.write.deposit([amount], { account: alice.account });
    const shares = await vault.read.sharesOf([alice.account.address]);
    assert.equal(shares, amount);
  });

  it("withdraw returns correct assets", async () => {
    const { token, vault, alice, amount } = await deployFixture();
    await vault.write.deposit([amount], { account: alice.account });
    await vault.write.withdraw([amount], { account: alice.account });
    const balance = await token.read.balanceOf([alice.account.address]);
    assert.equal(balance, amount);
  });

  it("multi-user share accounting correct", async () => {
    const { vault, alice, bob, amount } = await deployFixture();
    await vault.write.deposit([amount], { account: alice.account });
    await vault.write.deposit([amount], { account: bob.account });
    const totalShares = await vault.read.totalShares();
    const aliceShares = await vault.read.sharesOf([alice.account.address]);
    const bobShares = await vault.read.sharesOf([bob.account.address]);
    assert.equal(aliceShares, amount);
    assert.equal(bobShares, amount);
    assert.equal(totalShares, amount * 2n);
  });

  it("invariant: totalAssets == vault balance", async () => {
    const { token, vault, alice, bob, amount } = await deployFixture();
    await vault.write.deposit([amount], { account: alice.account });
    await vault.write.deposit([amount], { account: bob.account });
    const totalAssets = await vault.read.totalAssets();
    const vaultBalance = await token.read.balanceOf([vault.address]);
    assert.equal(totalAssets, vaultBalance);
  });

});