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