const express = require('express');
const router = express.Router();

// In-memory datastore for Verifiable Credentials: address -> VC
const credentialStore = new Map();
// Revoked credential IDs
const revokedIds = new Set();

// ── POST /vc/issue ─────────────────────────────────────────────────────────────
router.post('/issue', (req, res) => {
    const { workerAddress, role, region, tier } = req.body;
    if (!workerAddress) {
        return res.status(400).json({ success: false, error: 'Worker address required' });
    }

    const credId = `https://reliefchain.org/credentials/${Date.now()}-${Math.floor(Math.random() * 9999)}`;
    const vc = {
        '@context': [
            'https://www.w3.org/2018/credentials/v1',
            'https://reliefchain.org/credentials/v1'
        ],
        id: credId,
        type: ['VerifiableCredential', 'DisasterReliefBeneficiaryCredential'],
        issuer: 'did:reliefchain:state_authority_01',
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
            id: `did:reliefchain:${workerAddress.toLowerCase()}`,
            walletAddress: workerAddress,
            status: 'Verified Beneficiary',
            role: role || 'Disaster Relief Beneficiary - Tier 1',
            region: region || 'Bihar / Jharkhand',
            tier: tier || 'Tier 1',
        },
        proof: {
            type: 'Ed25519Signature2018',
            created: new Date().toISOString(),
            proofPurpose: 'assertionMethod',
            verificationMethod: 'did:reliefchain:state_authority_01#keys-1',
            jws: `eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..${Buffer.from(credId).toString('base64').slice(0, 24)}`
        }
    };

    credentialStore.set(workerAddress.toLowerCase(), vc);
    res.json({ success: true, credential: vc });
});

// ── GET /vc/all  — list every issued VC  ────────────────────────────────────
router.get('/all', (req, res) => {
    const list = [];
    credentialStore.forEach((vc) => {
        list.push({
            ...vc,
            revoked: revokedIds.has(vc.id)
        });
    });
    res.json({ success: true, credentials: list });
});

// ── DELETE /vc/revoke/:address — revoke a credential  ───────────────────────
router.delete('/revoke/:address', (req, res) => {
    const address = req.params.address.toLowerCase();
    if (!credentialStore.has(address)) {
        return res.status(404).json({ success: false, error: 'No credential found for this address' });
    }
    const vc = credentialStore.get(address);
    revokedIds.add(vc.id);
    // Update store entry to reflect revocation
    credentialStore.set(address, { ...vc, revoked: true, revokedAt: new Date().toISOString() });
    res.json({ success: true, message: 'Credential revoked', id: vc.id });
});

// ── GET /vc/:address — retrieve VC for one worker  ───────────────────────────
router.get('/:address', (req, res) => {
    const address = req.params.address.toLowerCase();
    if (credentialStore.has(address)) {
        const vc = credentialStore.get(address);
        res.json({ success: true, credential: { ...vc, revoked: revokedIds.has(vc.id) } });
    } else {
        res.status(404).json({ success: false, error: 'No credential found for this address' });
    }
});

module.exports = router;
