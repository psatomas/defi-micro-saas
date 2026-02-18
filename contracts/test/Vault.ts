import { expect } from "chai";
import { network } from "hardhat";

describe("Vault", async function () {

  it("Should deploy", async function () {

    const { viem } = await network.connect();

    const vault = await viem.deployContract("Vault", [
      "0x0000000000000000000000000000000000000000"
    ]);

    expect(vault.address).to.not.equal(undefined);

  });

});


