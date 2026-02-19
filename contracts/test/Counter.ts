import { describe, it } from "node:test";
import assert from "node:assert/strict";
import hre from "hardhat";

// --- simple fixture loader
type Fixture<T> = () => Promise<T>;
function useFixture<T>(fixture: Fixture<T>): Fixture<T> {
  let cache: T | undefined;
  return async () => {
    if (!cache) cache = await fixture();
    return cache;
  };
}

describe("Counter", () => {

  const deployFixture = useFixture(async () => {
    const { viem } = await hre.network.connect();
    const [alice] = await viem.getWalletClients();

    const counter = await viem.deployContract("Counter");

    return { counter, alice };
  });

  it("Initial value is 0", async () => {
    const { counter } = await deployFixture();
    const value = await counter.read.number();
    assert.equal(value, 0n);
  });

  it("Increment works", async () => {
    const { counter, alice } = await deployFixture();

    // write transaction
    await counter.write.inc([5n], { account: alice.account });

    // read current state
    const value = await counter.read.number();
    assert.equal(value, 5n);
  });

  it("Multiple increments accumulate", async () => {
    const { counter, alice } = await deployFixture();

    await counter.write.inc([2n], { account: alice.account });
    await counter.write.inc([3n], { account: alice.account });

    const value = await counter.read.number();
    assert.equal(value, 5n);
  });

});