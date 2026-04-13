/**
 * AI Fraud Detection Engine
 * Simulates: OCR invoice analysis + ResNet image similarity + EXIF metadata +
 *            perceptual hashing (dedup) + statistical funding anomaly detection
 *
 * Would integrate with: TensorFlow Serving / PyTorch microservice / OpenCV / Tesseract
 */

'use strict';

// ─── Known fraud hash registry (simulated embedding store) ────────────────────
const KNOWN_HASHES = [
  { hash: 'a3f8c1d2e4b5', source: 'Invoice #INV-FRAUD-2023-01', campaign: 'Kerala Floods 2023', flaggedAt: '2023-09-12' },
  { hash: '9b2e7f4a1c3d', source: 'Warehouse Photo',           campaign: 'Odisha Relief 2022', flaggedAt: '2022-11-05' },
  { hash: '5f1a8c2b3e6d', source: 'Field Distribution Photo',  campaign: 'Bihar Aid 2022',     flaggedAt: '2022-08-20' },
];

// ─── Utility helpers ──────────────────────────────────────────────────────────
const rand   = (min, max) => Math.random() * (max - min) + min;
const randInt= (min, max) => Math.floor(rand(min, max + 1));
const pct    = v => +v.toFixed(1);

/** Simulate perceptual hash of uploaded asset */
function simulateHash(filename, size) {
  // Deterministic-ish hash from name+size so same file gives same hash
  const seed = (filename + size).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const hex  = (seed * 0xdeadbeef).toString(16).slice(-12);
  return hex.padStart(12, '0');
}

// ─── Analysis Modules ─────────────────────────────────────────────────────────

/**
 * MODULE 1: OCR Invoice Authenticity (simulates Tesseract + rule engine)
 */
function analyzeInvoice(file) {
  const ext = (file.originalname || file.name || '').split('.').pop().toLowerCase();
  const isPdf = ext === 'pdf';
  const isImage = ['jpg','jpeg','png','webp'].includes(ext);

  // Simulate OCR-extracted fields
  const findings = [];
  const riskFactors = [];
  let riskScore = 0;

  // Check 1: File type
  if (!isPdf && !isImage) {
    findings.push({ check: 'File Type', result: 'WARN', detail: 'Non-standard format — expected PDF or image invoice' });
    riskScore += 10;
  } else {
    findings.push({ check: 'File Type', result: 'PASS', detail: isPdf ? 'Valid PDF document' : 'Valid image format' });
  }

  // Check 2: GST/Invoice number pattern (OCR simulation)
  const hasInvoiceNo = Math.random() > 0.2;
  if (!hasInvoiceNo) {
    findings.push({ check: 'Invoice Number', result: 'FAIL', detail: 'No standard invoice number pattern detected (regex: INV-YYYY-NNNN)' });
    riskScore += 25;
    riskFactors.push('Missing invoice number');
  } else {
    findings.push({ check: 'Invoice Number', result: 'PASS', detail: `OCR extracted: INV-${new Date().getFullYear()}-${randInt(1000,9999)}` });
  }

  // Check 3: GST Registration
  const hasGST = Math.random() > 0.25;
  if (!hasGST) {
    findings.push({ check: 'GST / TAX ID', result: 'WARN', detail: 'No valid GSTIN pattern found — may be unregistered vendor' });
    riskScore += 20;
    riskFactors.push('Missing GSTIN');
  } else {
    const gstin = `29AABCU${randInt(1000,9999)}M1Z${randInt(1,9)}`;
    findings.push({ check: 'GST / TAX ID', result: 'PASS', detail: `GSTIN extracted: ${gstin}` });
  }

  // Check 4: Date consistency
  const dateAnomaly = Math.random() < 0.15;
  if (dateAnomaly) {
    findings.push({ check: 'Date Integrity', result: 'FAIL', detail: 'Invoice date is in the future — possible backdating fraud' });
    riskScore += 35;
    riskFactors.push('Future-dated invoice');
  } else {
    findings.push({ check: 'Date Integrity', result: 'PASS', detail: 'Invoice date within valid campaign period' });
  }

  // Check 5: Amount range
  const amountSpike = Math.random() < 0.12;
  if (amountSpike) {
    findings.push({ check: 'Amount Range', result: 'WARN', detail: 'Amount exceeds 3× median invoice value for this campaign — statistical outlier' });
    riskScore += 20;
    riskFactors.push('Abnormal amount spike');
  } else {
    findings.push({ check: 'Amount Range', result: 'PASS', detail: 'Amount within expected campaign expenditure range' });
  }

  // Check 6: Vendor name cross-reference
  const unknownVendor = Math.random() < 0.18;
  if (unknownVendor) {
    findings.push({ check: 'Vendor Registry', result: 'WARN', detail: 'Vendor name not found in verified NGO vendor whitelist' });
    riskScore += 15;
    riskFactors.push('Unknown vendor');
  } else {
    findings.push({ check: 'Vendor Registry', result: 'PASS', detail: 'Vendor found in verified supplier registry' });
  }

  return { module: 'OCR Invoice Analysis', model: 'Tesseract-OCR + Rule Engine', riskScore: Math.min(100, riskScore), findings, riskFactors };
}

/**
 * MODULE 2: Image Integrity & Duplication (simulates ResNet perceptual hash + OpenCV)
 */
function analyzeImage(file) {
  const filename = file.originalname || file.name || 'upload';
  const size = file.size || 0;
  const findings = [];
  const riskFactors = [];
  let riskScore = 0;

  // Compute simulated perceptual hash
  const hash = simulateHash(filename, size);

  // Check 1: Duplicate detection
  const knownDup = KNOWN_HASHES.find(k => k.hash === hash);
  if (knownDup) {
    findings.push({ check: 'Duplicate Detection', result: 'FAIL', detail: `Perceptual hash matches flagged asset from "${knownDup.campaign}" (${knownDup.flaggedAt})` });
    riskScore += 80;
    riskFactors.push(`Duplicate of flagged image from ${knownDup.campaign}`);
  } else {
    // Simulated near-duplicate probability
    const nearDup = Math.random() < 0.08;
    if (nearDup) {
      findings.push({ check: 'Duplicate Detection', result: 'WARN', detail: `Near-duplicate similarity (92%) with image from "Assam Floods 2024" — possible reuse` });
      riskScore += 45;
      riskFactors.push('Near-duplicate image detected');
    } else {
      findings.push({ check: 'Duplicate Detection', result: 'PASS', detail: `Unique image — hash ${hash} not in fraud registry` });
    }
  }

  // Check 2: EXIF metadata
  const exifStripped = Math.random() < 0.22;
  if (exifStripped) {
    findings.push({ check: 'EXIF Metadata', result: 'WARN', detail: 'EXIF metadata stripped — no GPS coordinates, camera model, or timestamp' });
    riskScore += 20;
    riskFactors.push('EXIF metadata removed');
  } else {
    const lat  = (20 + Math.random() * 10).toFixed(4);
    const lng  = (78 + Math.random() * 12).toFixed(4);
    findings.push({ check: 'EXIF Metadata', result: 'PASS', detail: `GPS: ${lat}°N, ${lng}°E · Captured: ${new Date(Date.now() - rand(0, 30) * 86400000).toLocaleDateString('en-IN')}` });
  }

  // Check 3: AI manipulation detection (Error Level Analysis simulation)
  const manipulated = Math.random() < 0.12;
  if (manipulated) {
    findings.push({ check: 'Manipulation (ELA)', result: 'FAIL', detail: 'Error Level Analysis detected anomalous compression artifacts — possible Photoshop splice' });
    riskScore += 60;
    riskFactors.push('Image manipulation detected');
  } else {
    findings.push({ check: 'Manipulation (ELA)', result: 'PASS', detail: 'Error Level Analysis: uniform JPEG compression — no splicing artifacts detected' });
  }

  // Check 4: AI scene classification
  const sceneMatch = Math.random() > 0.15;
  if (!sceneMatch) {
    findings.push({ check: 'Scene Classification', result: 'WARN', detail: 'ResNet-50 classified scene as "urban office" — inconsistent with claimed field distribution' });
    riskScore += 25;
    riskFactors.push('Scene-claim mismatch');
  } else {
    const scenes = ['outdoor humanitarian camp', 'food distribution center', 'flood-affected village', 'medical relief tent'];
    findings.push({ check: 'Scene Classification', result: 'PASS', detail: `ResNet-50: scene classified as "${scenes[randInt(0, scenes.length-1)]}" (confidence: ${pct(rand(78, 96))}%)` });
  }

  // Check 5: Deepfake / GAN detection
  const isGAN = Math.random() < 0.05;
  if (isGAN) {
    findings.push({ check: 'GAN / Deepfake', result: 'FAIL', detail: 'CNN-based GAN detector confidence: 94.2% — image likely AI-generated' });
    riskScore += 90;
    riskFactors.push('AI-generated image (deepfake)');
  } else {
    findings.push({ check: 'GAN / Deepfake', result: 'PASS', detail: `GAN probability: ${pct(rand(1, 8))}% — authentic photograph` });
  }

  return { module: 'Image Integrity Analysis', model: 'ResNet-50 + OpenCV ELA + pHash', riskScore: Math.min(100, riskScore), findings, riskFactors, hash };
}

/**
 * MODULE 3: Funding Pattern Anomaly (simulates statistical outlier detection)
 */
function analyzeFundingPattern(ngoId, amount, campaignId) {
  const findings = [];
  const riskFactors = [];
  let riskScore = 0;

  // Check 1: Submission frequency
  const highFreq = Math.random() < 0.14;
  if (highFreq) {
    findings.push({ check: 'Submission Rate', result: 'WARN', detail: `NGO submitted ${randInt(8,15)} proofs in the last 24h — ${randInt(4,9)}× above campaign average` });
    riskScore += 30;
    riskFactors.push('Abnormal submission frequency');
  } else {
    findings.push({ check: 'Submission Rate', result: 'PASS', detail: `Submission rate within normal range for campaign phase` });
  }

  // Check 2: Amount vs benchmark
  const benchmark = rand(50000, 300000);
  const deviation = Math.abs(amount - benchmark) / benchmark;
  if (deviation > 2.5) {
    findings.push({ check: 'Amount vs Benchmark', result: 'FAIL', detail: `Claimed amount is ${(deviation*100).toFixed(0)}% above campaign benchmark (₹${Math.round(benchmark).toLocaleString('en-IN')})` });
    riskScore += 40;
    riskFactors.push('Amount deviation > 250%');
  } else if (deviation > 1.2) {
    findings.push({ check: 'Amount vs Benchmark', result: 'WARN', detail: `Claimed amount is ${(deviation*100).toFixed(0)}% above benchmark — moderate anomaly` });
    riskScore += 18;
  } else {
    findings.push({ check: 'Amount vs Benchmark', result: 'PASS', detail: `Amount within ±${(deviation*100).toFixed(0)}% of campaign benchmark` });
  }

  // Check 3: Velocity (spending pace)
  const velocitySpike = Math.random() < 0.10;
  if (velocitySpike) {
    findings.push({ check: 'Spending Velocity', result: 'WARN', detail: `60% of campaign funds claimed in last 3 days — abnormal velocity spike` });
    riskScore += 25;
    riskFactors.push('Spending velocity spike');
  } else {
    findings.push({ check: 'Spending Velocity', result: 'PASS', detail: 'Spending pace consistent with campaign timeline' });
  }

  // Check 4: Geographic consistency
  const geoMismatch = Math.random() < 0.08;
  if (geoMismatch) {
    findings.push({ check: 'Geographic Consistency', result: 'FAIL', detail: 'Transaction IP geolocation (Delhi) conflicts with declared disaster zone (Assam)' });
    riskScore += 35;
    riskFactors.push('Geographic location mismatch');
  } else {
    findings.push({ check: 'Geographic Consistency', result: 'PASS', detail: 'Transaction origin consistent with declared region' });
  }

  // Check 5: NGO history
  const badHistory = Math.random() < 0.07;
  if (badHistory) {
    findings.push({ check: 'NGO Risk History', result: 'WARN', detail: `NGO has 2 prior flagged submissions (scores: 71, 63) — elevated risk profile` });
    riskScore += 20;
    riskFactors.push('Prior fraud flags on NGO');
  } else {
    findings.push({ check: 'NGO Risk History', result: 'PASS', detail: 'No prior fraud flags on this NGO wallet' });
  }

  return { module: 'Funding Pattern Anomaly', model: 'Isolation Forest + Z-Score', riskScore: Math.min(100, riskScore), findings, riskFactors };
}

/**
 * Aggregate all modules into a final fraud decision
 */
function aggregateResults(modules) {
  // Weighted combination: image 40%, invoice 35%, funding 25%
  const weights = { 'Image Integrity Analysis': 0.40, 'OCR Invoice Analysis': 0.35, 'Funding Pattern Anomaly': 0.25 };
  let totalScore = 0;
  for (const m of modules) {
    totalScore += m.riskScore * (weights[m.module] || 0.33);
  }
  totalScore = Math.min(100, totalScore);

  const allRiskFactors = modules.flatMap(m => m.riskFactors);
  const passCount  = modules.flatMap(m => m.findings).filter(f => f.result === 'PASS').length;
  const warnCount  = modules.flatMap(m => m.findings).filter(f => f.result === 'WARN').length;
  const failCount  = modules.flatMap(m => m.findings).filter(f => f.result === 'FAIL').length;

  let verdict, severity, daoAction, recommendation;
  if (totalScore >= 70 || failCount >= 2) {
    verdict = 'FRAUDULENT';      severity = 'CRITICAL';
    daoAction = 'BLOCK';
    recommendation = 'Submission blocked. Escalate to DAO security committee. NGO bond may be slashed.';
  } else if (totalScore >= 45 || failCount >= 1 || warnCount >= 3) {
    verdict = 'SUSPICIOUS';      severity = 'HIGH';
    daoAction = 'FLAG_FOR_REVIEW';
    recommendation = 'Flagged for manual DAO review. Tranche release paused until human verification.';
  } else if (totalScore >= 25 || warnCount >= 2) {
    verdict = 'INCONCLUSIVE';    severity = 'MODERATE';
    daoAction = 'HOLD';
    recommendation = 'Hold tranche for 48h. Request NGO to resubmit with additional metadata.';
  } else {
    verdict = 'AUTHENTIC';       severity = 'LOW';
    daoAction = 'APPROVE';
    recommendation = 'Submission appears authentic. Recommend DAO approval for tranche release.';
  }

  return {
    overallRiskScore: Math.round(totalScore),
    verdict, severity, daoAction, recommendation,
    allRiskFactors,
    summary: { passCount, warnCount, failCount, totalChecks: passCount + warnCount + failCount },
  };
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/** POST /api/v1/fraud/analyze — analyze uploaded proof files */
exports.analyzeProof = (req, res) => {
  // Accept file metadata from body (since we can't process actual binaries in mock mode)
  const files = req.body.files || [];
  const { ngoId = 'NGO-001', campaignId = 'camp-1', amount = 150000 } = req.body;

  if (!files.length) {
    return res.status(400).json({ success: false, message: 'No files provided for analysis' });
  }

  const moduleResults = [];

  for (const file of files) {
    const ext = (file.name || '').split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) {
      moduleResults.push(analyzeInvoice(file));
    } else if (['jpg','jpeg','png','webp'].includes(ext)) {
      moduleResults.push(analyzeImage(file));
    }
  }

  // Always run funding pattern regardless of file types
  moduleResults.push(analyzeFundingPattern(ngoId, amount, campaignId));

  const aggregate = aggregateResults(moduleResults);
  const analysisId = 'FRAUD-' + Date.now().toString(36).toUpperCase();

  res.json({
    success: true,
    analysisId,
    analyzedAt: new Date().toISOString(),
    files: files.map(f => ({ name: f.name, type: f.type, size: f.size })),
    modules: moduleResults,
    ...aggregate,
    caseUrl: `https://ipfs.io/ipfs/Qm${Math.random().toString(36).slice(2,14).toUpperCase()}`,
  });
};

/** GET /api/v1/fraud/registry — list of all flagged submissions */
exports.getRegistry = (req, res) => {
  const registry = [
    { id: 'FRAUD-1A2B3C', ngo: 'GreenHelp Foundation', campaign: 'Assam Flood Relief 2024', verdict: 'FRAUDULENT',   score: 82, flags: 3, date: '2024-09-05', amount: 4800000, action: 'BLOCK' },
    { id: 'FRAUD-4D5E6F', ngo: 'RuralAid Society',      campaign: 'Bihar Medical Aid 2024',  verdict: 'SUSPICIOUS',   score: 58, flags: 2, date: '2024-08-22', amount: 2100000, action: 'FLAG_FOR_REVIEW' },
    { id: 'FRAUD-7G8H9I', ngo: 'FloodSafe NGO',         campaign: 'Kerala Relief 2023',      verdict: 'FRAUDULENT',   score: 91, flags: 4, date: '2023-09-14', amount: 7200000, action: 'BLOCK' },
    { id: 'FRAUD-J0K1L2', ngo: 'CycloneHelp Trust',     campaign: 'Odisha Recovery 2024',   verdict: 'INCONCLUSIVE', score: 37, flags: 1, date: '2024-10-01', amount: 980000,  action: 'HOLD' },
    { id: 'FRAUD-M3N4O5', ngo: 'ReliefFirst India',     campaign: 'Assam Flood Relief 2024', verdict: 'SUSPICIOUS',   score: 64, flags: 3, date: '2024-09-18', amount: 3300000, action: 'FLAG_FOR_REVIEW' },
  ];

  res.json({
    success: true,
    total: registry.length,
    blocked: registry.filter(r => r.action === 'BLOCK').length,
    flagged: registry.filter(r => r.action === 'FLAG_FOR_REVIEW').length,
    held:    registry.filter(r => r.action === 'HOLD').length,
    fundsProtected: registry.reduce((s, r) => s + r.amount, 0),
    registry,
  });
};

/** GET /api/v1/fraud/stats — summary statistics */
exports.getStats = (req, res) => {
  res.json({
    success: true,
    stats: {
      totalAnalyzed: 247,
      fraudulent: 12,
      suspicious: 28,
      inconclusive: 41,
      authentic: 166,
      accuracyRate: '94.2%',
      fundsProtectedCrore: 42.8,
      avgAnalysisMs: 1240,
      modelsDeployed: ['ResNet-50 (image)', 'Tesseract-OCR (invoice)', 'Isolation Forest (funding)', 'pHash (dedup)', 'ELA (manipulation)'],
    },
  });
};
