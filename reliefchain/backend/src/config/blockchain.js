const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
module.exports = { provider };
