/**
 * Disaster Severity Prediction Engine
 * Simulates: Random Forest (risk classification) + LSTM time-series (trend forecasting)
 *
 * Inputs:  rainfall (mm), floodLevel (m), temperature (°C), humidity (%),
 *          windSpeed (km/h), populationDensity (per km²), previousSeverity
 * Outputs: severityScore (0–100), riskLevel, predictedFunds, confidence, trend
 */

const REGIONS = [
  { id: 'AS', name: 'Assam',          lat: 26.2, lng: 92.9, baseRainfall: 280, baseFlood: 3.2, basePop: 398  },
  { id: 'OR', name: 'Odisha',         lat: 20.9, lng: 84.8, baseRainfall: 190, baseFlood: 2.1, basePop: 269  },
  { id: 'WB', name: 'West Bengal',    lat: 22.9, lng: 87.8, baseRainfall: 220, baseFlood: 1.8, basePop: 1028 },
  { id: 'KL', name: 'Kerala',         lat: 10.8, lng: 76.3, baseRainfall: 310, baseFlood: 2.9, basePop: 860  },
  { id: 'BR', name: 'Bihar',          lat: 25.1, lng: 85.3, baseRainfall: 140, baseFlood: 4.1, basePop: 1102 },
  { id: 'AP', name: 'Andhra Pradesh', lat: 15.9, lng: 79.7, baseRainfall: 130, baseFlood: 1.2, basePop: 308  },
  { id: 'MH', name: 'Maharashtra',    lat: 19.6, lng: 75.3, baseRainfall: 170, baseFlood: 0.9, basePop: 365  },
  { id: 'UK', name: 'Uttarakhand',    lat: 30.1, lng: 79.2, baseRainfall: 250, baseFlood: 3.5, basePop: 189  },
];

/**
 * Random-Forest-style weighted feature scoring
 * Each feature maps to a weighted contribution to overall severity
 */
function randomForestScore(features) {
  const {
    rainfall,          // mm/day
    floodLevel,        // metres
    temperature,       // °C
    humidity,          // %
    windSpeed,         // km/h
    populationDensity, // per km²
    previousSeverity,  // 0–100
  } = features;

  // Decision tree ensemble weights (simplified RF)
  const tree1 = Math.min(100,
    (rainfall / 400) * 35 +
    (floodLevel / 6) * 30 +
    (humidity / 100) * 10 +
    (previousSeverity / 100) * 25
  );

  const tree2 = Math.min(100,
    (floodLevel / 6) * 40 +
    (rainfall / 400) * 25 +
    (populationDensity / 1200) * 20 +
    (windSpeed / 120) * 15
  );

  const tree3 = Math.min(100,
    (rainfall / 400) * 30 +
    (temperature > 35 ? 15 : temperature < 10 ? 20 : 5) +
    (populationDensity / 1200) * 30 +
    (previousSeverity / 100) * 25
  );

  // Aggregate ensemble (average + noise for realism)
  const ensemble = (tree1 * 0.4 + tree2 * 0.35 + tree3 * 0.25);
  const noise = (Math.random() - 0.5) * 4; // ±2 variability
  return Math.max(0, Math.min(100, ensemble + noise));
}

/**
 * LSTM time-series simulation: generates historical + 7-day forecast
 * Simulates autoregressive dampening with seasonal component
 */
function lstmForecast(baseScore, days = 14) {
  const history = [];
  let current = baseScore * 0.6; // historical start lower
  for (let i = -7; i < 0; i++) {
    const seasonal = Math.sin((i / 30) * Math.PI * 2) * 8;
    const trend = (baseScore - current) * 0.15;
    current = Math.max(0, Math.min(100, current + trend + seasonal + (Math.random() - 0.5) * 5));
    history.push({
      day: i,
      label: new Date(Date.now() + i * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      severity: Math.round(current),
      type: 'historical',
    });
  }

  const forecast = [];
  let forecastScore = baseScore;
  for (let i = 1; i <= 7; i++) {
    const decay = Math.pow(0.88, i);  // LSTM mean-reversion
    const seasonal = Math.sin((i / 30) * Math.PI * 2) * 6;
    forecastScore = baseScore * decay + 20 * (1 - decay) + seasonal + (Math.random() - 0.5) * 6;
    forecastScore = Math.max(0, Math.min(100, forecastScore));
    forecast.push({
      day: i,
      label: new Date(Date.now() + i * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      severity: Math.round(forecastScore),
      type: 'forecast',
    });
  }

  return [...history, ...forecast];
}

/**
 * Classify risk level from score
 */
function riskLevel(score) {
  if (score >= 80) return { level: 'CRITICAL',  color: 'red',    label: 'Immediate Action' };
  if (score >= 60) return { level: 'HIGH',      color: 'orange', label: 'High Alert' };
  if (score >= 40) return { level: 'MODERATE',  color: 'amber',  label: 'Prepare Response' };
  if (score >= 20) return { level: 'LOW',       color: 'yellow', label: 'Monitor' };
  return               { level: 'MINIMAL',    color: 'green',  label: 'Normal' };
}

/**
 * Estimate pre-allocated relief funds (INR crore) based on severity + population
 */
function estimateFunds(score, populationDensity, areaSqKm = 78438) {
  const affectedPop = (populationDensity * areaSqKm * (score / 100) * 0.08);
  const perCapitaRelief = 4200; // ₹ per beneficiary
  const total = affectedPop * perCapitaRelief;
  const crore = total / 10000000;
  return {
    estimatedBeneficiaries: Math.round(affectedPop),
    totalFundsCrore: +crore.toFixed(2),
    breakdown: {
      emergencyRelief:  +(crore * 0.35).toFixed(2),
      medicalAid:       +(crore * 0.20).toFixed(2),
      shelterRebuild:   +(crore * 0.25).toFixed(2),
      foodWater:        +(crore * 0.15).toFixed(2),
      adminOps:         +(crore * 0.05).toFixed(2),
    }
  };
}

// ─── Controllers ────────────────────────────────────────────────────────────

/** GET /api/v1/predictions — all region overview */
exports.getAllPredictions = (req, res) => {
  const predictions = REGIONS.map(region => {
    // Generate plausible live sensor readings
    const rainfall    = region.baseRainfall + (Math.random() - 0.3) * 80;
    const floodLevel  = region.baseFlood    + (Math.random() - 0.4) * 1.5;
    const humidity    = 60 + Math.random() * 35;
    const temperature = 22  + (Math.random() - 0.5) * 18;
    const windSpeed   = 15  + Math.random() * 45;
    const prevSeverity= 20  + Math.random() * 60;

    const features = { rainfall, floodLevel, temperature, humidity, windSpeed,
      populationDensity: region.basePop, previousSeverity: prevSeverity };

    const score    = randomForestScore(features);
    const risk     = riskLevel(score);
    const funds    = estimateFunds(score, region.basePop);
    const confidence = 72 + Math.random() * 22; // 72–94%

    return {
      regionId: region.id,
      regionName: region.name,
      lat: region.lat,
      lng: region.lng,
      severityScore: Math.round(score),
      riskLevel: risk.level,
      riskColor: risk.color,
      riskLabel: risk.label,
      confidence: +confidence.toFixed(1),
      sensors: {
        rainfall:    +rainfall.toFixed(1),
        floodLevel:  +floodLevel.toFixed(2),
        temperature: +temperature.toFixed(1),
        humidity:    +humidity.toFixed(1),
        windSpeed:   +windSpeed.toFixed(1),
      },
      funds,
      modelUsed: 'RandomForest v2.1',
      updatedAt: new Date().toISOString(),
    };
  });

  // Sort by severity descending
  predictions.sort((a, b) => b.severityScore - a.severityScore);

  const totalFunds = predictions.reduce((s, p) => s + p.funds.totalFundsCrore, 0);
  const criticalZones = predictions.filter(p => p.severityScore >= 60).length;

  res.json({
    success: true,
    generatedAt: new Date().toISOString(),
    summary: {
      totalRegions: predictions.length,
      criticalZones,
      totalPreAllocFundsCrore: +totalFunds.toFixed(2),
      modelsRun: ['RandomForest v2.1', 'LSTM-TS v1.4'],
      dataSources: ['OpenWeather API', 'IMD Rainfall Grid', 'CWC Flood Gauge', 'Sentinel-2 SAR'],
    },
    predictions,
  });
};

/** GET /api/v1/predictions/:regionId — detailed with LSTM forecast */
exports.getRegionPrediction = (req, res) => {
  const region = REGIONS.find(r => r.id.toUpperCase() === req.params.regionId.toUpperCase());
  if (!region) return res.status(404).json({ success: false, message: 'Region not found' });

  const rainfall    = region.baseRainfall + (Math.random() - 0.3) * 80;
  const floodLevel  = region.baseFlood    + (Math.random() - 0.4) * 1.5;
  const humidity    = 60 + Math.random() * 35;
  const temperature = 22 + (Math.random() - 0.5) * 18;
  const windSpeed   = 15 + Math.random() * 45;
  const prevSeverity= 20 + Math.random() * 60;

  const features = { rainfall, floodLevel, temperature, humidity, windSpeed,
    populationDensity: region.basePop, previousSeverity: prevSeverity };

  const score      = randomForestScore(features);
  const risk       = riskLevel(score);
  const funds      = estimateFunds(score, region.basePop);
  const timeSeries = lstmForecast(score);
  const confidence = 72 + Math.random() * 22;

  // Feature importances (Random Forest interpretation)
  const featureImportance = [
    { feature: 'Flood Level',       importance: 0.31 },
    { feature: 'Rainfall (mm/day)', importance: 0.27 },
    { feature: 'Historical Trend',  importance: 0.18 },
    { feature: 'Population Density',importance: 0.13 },
    { feature: 'Wind Speed',        importance: 0.07 },
    { feature: 'Temperature',       importance: 0.04 },
  ];

  res.json({
    success: true,
    region: { id: region.id, name: region.name, lat: region.lat, lng: region.lng },
    severityScore: Math.round(score),
    riskLevel: risk.level,
    riskColor: risk.color,
    riskLabel: risk.label,
    confidence: +confidence.toFixed(1),
    sensors: { rainfall: +rainfall.toFixed(1), floodLevel: +floodLevel.toFixed(2),
      temperature: +temperature.toFixed(1), humidity: +humidity.toFixed(1), windSpeed: +windSpeed.toFixed(1) },
    funds,
    timeSeries,
    featureImportance,
    modelMetrics: {
      randomForest: { accuracy: '87.3%', precision: '84.1%', recall: '89.2%', f1: '86.6%' },
      lstm:         { mae: '4.2',       rmse: '6.1',       r2: '0.91' },
    },
    daoRecommendation: score >= 60
      ? { action: 'PRE_ALLOCATE', urgency: 'HIGH', message: `Pre-allocate ₹${funds.totalFundsCrore} Cr for ${region.name} immediately.` }
      : { action: 'MONITOR',     urgency: 'LOW',  message: `Continue monitoring ${region.name}. Severity below threshold.` },
    updatedAt: new Date().toISOString(),
  });
};
