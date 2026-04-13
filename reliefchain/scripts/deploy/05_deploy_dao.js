const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying DAOGovernor with:", deployer.address);
  const Factory = await ethers.getContractFactory("DAOGovernor");
  const contract = await Factory.deploy(/* constructor args */);
  await contract.waitForDeployment();
  console.log("DAOGovernor deployed to:", await contract.getAddress());
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
