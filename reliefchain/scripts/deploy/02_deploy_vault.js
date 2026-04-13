const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying DonationVault with:", deployer.address);
  const Factory = await ethers.getContractFactory("DonationVault");
  const contract = await Factory.deploy(/* constructor args */);
  await contract.waitForDeployment();
  console.log("DonationVault deployed to:", await contract.getAddress());
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
