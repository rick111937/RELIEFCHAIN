// Verify deployed contracts on Polygonscan
const { run } = require("hardhat");
async function verify(address, args=[]) {
  await run("verify:verify", { address, constructorArguments: args });
}
module.exports = { verify };
