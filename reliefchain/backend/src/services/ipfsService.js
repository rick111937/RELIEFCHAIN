// Upload files to IPFS via Pinata or Web3.Storage
const axios = require('axios');
exports.uploadToIPFS = async (fileBuffer, fileName) => {
  // TODO: implement Pinata pinFileToIPFS
  // Returns: { cid: 'Qm...' }
  throw new Error('ipfsService.uploadToIPFS not yet implemented');
};
exports.getIPFSUrl = (cid) => `https://ipfs.io/ipfs/${cid}`;
