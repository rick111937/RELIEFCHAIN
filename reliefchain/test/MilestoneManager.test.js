const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MilestoneManager", function () {
  let contract, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("MilestoneManager");
    contract = await Factory.deploy(/* args */);
  });

  it("should deploy correctly", async function () {
    expect(await contract.getAddress()).to.be.properAddress;
  });

  // TODO: add full test cases
});
