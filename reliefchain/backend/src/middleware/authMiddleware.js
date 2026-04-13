const { ethers } = require('ethers');
// Verify Ethereum wallet signature (SIWE pattern)
exports.walletAuth = async (req, res, next) => {
  const { address, signature, message } = req.headers;
  if (!address || !signature) return res.status(401).json({ error: 'Unauthorized' });
  const recovered = ethers.verifyMessage(message, signature);
  if (recovered.toLowerCase() !== address.toLowerCase()) return res.status(401).json({ error: 'Invalid signature' });
  req.walletAddress = address;
  next();
};
