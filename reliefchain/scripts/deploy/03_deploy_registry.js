const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying ProjectRegistry with:", deployer.address);
  const Factory = await ethers.getContractFactory("ProjectRegistry");
  const contract = await Factory.deploy(/* constructor args */);
  await contract.waitForDeployment();
  console.log("ProjectRegistry deployed to:", await contract.getAddress());
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
