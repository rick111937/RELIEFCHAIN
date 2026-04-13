const { Web3Storage } = require('web3.storage');
const client = new Web3Storage({ token: process.env.WEB3_STORAGE_TOKEN });
module.exports = client;
