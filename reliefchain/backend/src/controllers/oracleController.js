const crypto = require('crypto');
const predictionCtrl = require('./predictionController');

// Helper to generate a mock Ethereum transaction hash
const generateMockTxHash = () => '0x' + crypto.randomBytes(32).toString('hex');

/**
 * POST /api/v1/oracle/trigger/:regionId
 * Acts as an Anticipatory Action Oracle.
 * It fetches the current prediction severity for the region.
 * If severity is high enough (>= 60), it simulates a smart contract call
 * to pre-release the funds to the NGO/Vault.
 */
exports.triggerPreRelease = (req, res) => {
  const regionId = req.params.regionId;

  // We reuse the local logic to get the current mock prediction.
  // In a real app, the oracle might call weather APIs itself, then post the result on-chain.
  
  // We'll simulate fetching the prediction
  const REGIONS = [
    { id: 'AS', name: 'Assam',          lat: 26.2, lng: 92.9, basePop: 398  },
    { id: 'OR', name: 'Odisha',         lat: 20.9, lng: 84.8, basePop: 269  },
    { id: 'WB', name: 'West Bengal',    lat: 22.9, lng: 87.8, basePop: 1028 },
    { id: 'KL', name: 'Kerala',         lat: 10.8, lng: 76.3, basePop: 860  },
    { id: 'BR', name: 'Bihar',          lat: 25.1, lng: 85.3, basePop: 1102 },
    { id: 'AP', name: 'Andhra Pradesh', lat: 15.9, lng: 79.7, basePop: 308  },
    { id: 'MH', name: 'Maharashtra',    lat: 19.6, lng: 75.3, basePop: 365  },
    { id: 'UK', name: 'Uttarakhand',    lat: 30.1, lng: 79.2, basePop: 189  },
  ];

  const region = REGIONS.find(r => r.id.toUpperCase() === regionId.toUpperCase());
  if (!region) {
    return res.status(404).json({ success: false, message: 'Region not found' });
  }

  // To simulate the payload the oracle receives, we assume the frontend sent the severityScore directly,
  // or we can just randomly generate a high one for demo purposes if it wasn't passed.
  // We will accept `severityScore` from req.body if provided.
  const severityScore = req.body.severityScore || Math.floor(Math.random() * 40) + 60; // Default to 60-100
  const fundsCrore = req.body.fundsCrore || ((region.basePop * 78438 * (severityScore / 100) * 0.08) * 4200 / 10000000).toFixed(2);

  if (severityScore < 60) {
    return res.status(400).json({
      success: false,
      message: `Severity score (${severityScore}) is below the threshold of 60. Anticipatory action aborted.`,
    });
  }

  // Simulate Smart Contract interaction (calling AnticipatoryOracle -> DonationVault.oracleReleaseFunds)
  const txHash = generateMockTxHash();

  return res.json({
    success: true,
    message: `Anticipatory Action triggered successfully. Pre-allocating funds.`,
    transactionHash: txHash,
    details: {
      region: region.name,
      severityScore: severityScore,
      action: 'oracleReleaseFunds',
      amountReleasedCrore: fundsCrore,
      timestamp: new Date().toISOString()
    }
  });
};
