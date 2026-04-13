const express = require('express');
const router = express.Router();

// Mock IPFS Upload (In a real app, this would pin to Pinata/Infura)
router.post('/upload', (req, res) => {
    // Simulated upload delay
    setTimeout(() => {
        const mockIpfsHash = "Qm" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        res.json({
            success: true,
            ipfsHash: mockIpfsHash,
            message: "Successfully pinned geo-tagged expenditure proof to IPFS"
        });
    }, 1000);
});

module.exports = router;
