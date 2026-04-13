const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying GovernanceToken with:", deployer.address);
  const Factory = await ethers.getContractFactory("GovernanceToken");
  const contract = await Factory.deploy(/* constructor args */);
  await contract.waitForDeployment();
  console.log("GovernanceToken deployed to:", await contract.getAddress());
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
