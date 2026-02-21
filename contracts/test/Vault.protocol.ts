import { describe, it } from "node:test";
import assert from "node:assert/strict";
import hre from "hardhat";

type Fixture<T> = () => Promise<T>;

function useFixture<T>(fixture: Fixture<T>): Fixture<T> {
  let cache: T | undefined;
  return async () => {
    if (!cache) cache = await fixture();
    return cache;
  };
}

const BI = (v: unknown): bigint => BigInt(v as any);

const E18 = 10n ** 18n;

describe("Vault — Protocol Grade Tests", () => {

  const deployFixture = useFixture(async () => {

    const { viem } = await hre.network.connect();

    const users = await viem.getWalletClients();

    const token = await viem.deployContract(
        "MockERC20",
        []
    );

    const vault = await viem.deployContract(
        "Vault",
        [token.address]
    );

    const mint = 100_000_000n * E18;

    const activeUsers = users.slice(0, 6);

    const MAX = 2n**256n - 1n;

    for (const u of activeUsers) {

        await token.write.mint(
        [u.account.address, mint]
        );

        await token.write.approve(
        [vault.address, MAX],
        { account: u.account }
        );

    }

    return {
        token,
        vault,
        users: activeUsers,
        mint
    };

});


  it("INV totalShares consistency", async () => {

    const { vault, users } = await deployFixture();

    for (let i = 0; i < users.length; i++) {

      const amount = BigInt(i + 1) * 137n * E18;

      await vault.write.deposit(
        [amount],
        { account: users[i].account }
      );

    }

    let sum = 0n;

    for (const u of users) {

      sum += BI(
        await vault.read.sharesOf(
          [u.account.address]
        )
      );

    }

    const totalShares = BI(
      await vault.read.totalShares()
    );

    assert.equal(sum, totalShares);

  });



  it("INV totalAssets consistency", async () => {

    const { vault, token, users } =
      await deployFixture();

    for (let i = 0; i < users.length; i++) {

      await vault.write.deposit(
        [(999n + BigInt(i)) * E18],
        { account: users[i].account }
      );

    }

    const totalAssets = BI(
      await vault.read.totalAssets()
    );

    const balance = BI(
      await token.read.balanceOf(
        [vault.address]
      )
    );

    assert.equal(totalAssets, balance);

  });



  it("INV conservation", async () => {

    const { vault, token, users, mint } =
      await deployFixture();

    const initial =
      mint * BigInt(users.length);

    for (const u of users) {

      await vault.write.deposit(
        [mint / 2n],
        { account: u.account }
      );

    }

    let userBalances = 0n;

    for (const u of users) {

      userBalances += BI(
        await token.read.balanceOf(
          [u.account.address]
        )
      );

    }

    const vaultBalance = BI(
      await token.read.balanceOf(
        [vault.address]
      )
    );

    assert.ok(
        vaultBalance + userBalances <= initial
    );

  });



  it("ADV rounding resistance", async () => {

    const { vault, token, users } =
        await deployFixture();

    const whale = users[0];
    const attacker = users[1];

    await vault.write.deposit(
        [1_000_000n * E18],
        { account: whale.account }
    );

    const attackerInitial = BI(
        await token.read.balanceOf(
        [attacker.account.address]
        )
    );

    for (let i = 0; i < 50; i++) {

        const before = BI(
        await token.read.balanceOf(
            [attacker.account.address]
        )
        );

        await vault.write.deposit(
        [1n],
        { account: attacker.account }
        );

        const shares = BI(
        await vault.read.sharesOf(
            [attacker.account.address]
        )
        );

        if (shares > 0n) {

        await vault.write.withdraw(
            [shares],
            { account: attacker.account }
        );

        }

        const after = BI(
        await token.read.balanceOf(
            [attacker.account.address]
        )
        );

        console.log(
        "iteration",
        i,
        "profit",
        after - before
        );

    }

    const attackerFinal = BI(
        await token.read.balanceOf(
        [attacker.account.address]
        )
    );

    assert.ok(
        attackerFinal <= attackerInitial,
        "Attacker was able to extract profit"
    );

    });



  it("STATE randomized", async () => {

    const { vault, token, users } =
      await deployFixture();

    for (let i = 0; i < 100; i++) {

      const u = users[i % users.length];

      const shares = BI(
        await vault.read.sharesOf(
          [u.account.address]
        )
      );

      if (shares > 0n && i % 3 === 0) {

        await vault.write.withdraw(
          [shares / 2n],
          { account: u.account }
        );

      }

      else {

        await vault.write.deposit(
          [(BigInt(i + 1) * 19n) * E18],
          { account: u.account }
        );

      }

      const totalAssets = BI(
        await vault.read.totalAssets()
      );

      const balance = BI(
        await token.read.balanceOf(
          [vault.address]
        )
      );

      assert.equal(totalAssets, balance);

      let sum = 0n;

      for (const usr of users) {

        sum += BI(
          await vault.read.sharesOf(
            [usr.account.address]
          )
        );

      }

      const totalShares = BI(
        await vault.read.totalShares()
      );

      assert.equal(sum, totalShares);

    }

  });

});