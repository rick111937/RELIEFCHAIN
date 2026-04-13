const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying MilestoneManager with:", deployer.address);
  const Factory = await ethers.getContractFactory("MilestoneManager");
  const contract = await Factory.deploy(/* constructor args */);
  await contract.waitForDeployment();
  console.log("MilestoneManager deployed to:", await contract.getAddress());
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
