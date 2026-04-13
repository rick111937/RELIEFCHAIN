const { ethers } = require('ethers');
const { provider } = require('../config/blockchain');
// Listen to smart contract events and index them
exports.listenToEvents = (contract) => {
  contract.on('DonationReceived', (donor, projectId, amount) => {
    console.log(`Donation: ${donor} -> project ${projectId}: ${ethers.formatEther(amount)} MATIC`);
    // TODO: persist to DB
  });
};
