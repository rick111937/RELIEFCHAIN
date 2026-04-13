import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../services/api';
import {
  BrainCircuit, Zap, AlertTriangle, TrendingUp, CloudRain,
  Wind, Thermometer, Droplets, Users, IndianRupee, RefreshCw,
  Shield, Activity, BarChart2, Info, ChevronRight, ArrowUpRight,
  CheckCircle, Clock, MapPin, Cpu, Database
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const RISK_STYLES = {
  CRITICAL: { bg: 'bg-red-500/10',    border: 'border-red-500/30',    text: 'text-red-400',    bar: 'bg-gradient-to-r from-red-600 to-red-400',    badgeVariant: 'danger'  },
  HIGH:     { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', bar: 'bg-gradient-to-r from-orange-500 to-amber-400', badgeVariant: 'warning' },
  MODERATE: { bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  text: 'text-amber-400',  bar: 'bg-gradient-to-r from-amber-500 to-yellow-400', badgeVariant: 'warning' },
  LOW:      { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', bar: 'bg-gradient-to-r from-yellow-600 to-yellow-400', badgeVariant: 'info'   },
  MINIMAL:  { bg: 'bg-emerald-500/10',border: 'border-emerald-500/30',text: 'text-emerald-400',bar: 'bg-gradient-to-r from-emerald-600 to-emerald-400',badgeVariant: 'success'},
};

function SeverityGauge({ score }) {
  const angle = (score / 100) * 180 - 90; // -90 to 90 deg
  const color = score >= 80 ? '#ef4444' : score >= 60 ? '#f97316' : score >= 40 ? '#f59e0b' : score >= 20 ? '#eab308' : '#10b981';
  return (
    <div className="relative w-36 h-20 mx-auto">
      {/* Track arc */}
      <svg viewBox="0 0 140 80" className="absolute inset-0 w-full h-full">
        <path d="M10 70 A60 60 0 0 1 130 70" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" strokeLinecap="round" />
        <path d="M10 70 A60 60 0 0 1 130 70" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 188} 200`} opacity="0.9"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
        {/* Needle */}
        <line x1="70" y1="70" x2="70" y2="20"
          stroke={color} strokeWidth="2.5" strokeLinecap="round"
          transform={`rotate(${angle}, 70, 70)`}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        <circle cx="70" cy="70" r="4" fill={color} />
      </svg>
      <div className="absolute bottom-0 inset-x-0 text-center">
        <span className="text-xl font-black" style={{ color }}>{score}</span>
        <span className="text-slate-500 text-xs ml-0.5">/100</span>
      </div>
    </div>
  );
}

function MiniChart({ data, height = 60 }) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.severity), 1);
  const minVal = 0;
  const range = maxVal - minVal || 1;
  const W = 300, H = height;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((d.severity - minVal) / range) * (H - 8);
    return `${x},${y}`;
  }).join(' ');

  const histPts = data.filter(d => d.type === 'historical');
  const forecastPts = data.filter(d => d.type === 'forecast');

  const histPath = histPts.map((d, i) => {
    const x = (data.indexOf(d) / (data.length - 1)) * W;
    const y = H - ((d.severity - minVal) / range) * (H - 8);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const forecastPath = forecastPts.map((d, i) => {
    const x = (data.indexOf(d) / (data.length - 1)) * W;
    const y = H - ((d.severity - minVal) / range) * (H - 8);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[25, 50, 75].map(v => {
        const y = H - ((v - minVal) / range) * (H - 8);
        return <line key={v} x1="0" y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />;
      })}
      {/* Historical area */}
      {histPts.length > 1 && (
        <>
          <path d={`${histPath} L ${(data.indexOf(histPts[histPts.length - 1]) / (data.length-1)) * W} ${H} L 0 ${H} Z`}
            fill="url(#chartGrad)" />
          <path d={histPath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {/* Forecast area */}
      {forecastPts.length > 1 && (
        <>
          <path d={`${forecastPath} L ${W} ${H} L ${(data.indexOf(forecastPts[0]) / (data.length-1)) * W} ${H} Z`}
            fill="url(#forecastGrad)" />
          <path d={forecastPath} fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="5 3"
            strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {/* Divider between hist and forecast */}
      {histPts.length > 0 && forecastPts.length > 0 && (
        <line x1={(data.indexOf(histPts[histPts.length - 1]) / (data.length - 1)) * W} y1="0"
          x2={(data.indexOf(histPts[histPts.length - 1]) / (data.length - 1)) * W} y2={H}
          stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 2" />
      )}
    </svg>
  );
}

function SensorPill({ icon: Icon, label, value, unit, warn }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${warn ? 'bg-red-500/5 border-red-500/20' : 'bg-white/[0.03] border-white/[0.07]'}`}>
      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${warn ? 'text-red-400' : 'text-slate-400'}`} />
      <span className="text-[11px] text-slate-500 flex-shrink-0">{label}</span>
      <span className={`text-xs font-bold ml-auto ${warn ? 'text-red-300' : 'text-slate-200'}`}>{value} <span className="text-slate-500 font-normal">{unit}</span></span>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function RegionDetailPanel({ regionId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [oracleStatus, setOracleStatus] = useState(null);
  const [triggering, setTriggering] = useState(false);

  const handleTriggerOracle = async () => {
    setTriggering(true);
    try {
      const res = await api.post(`/oracle/trigger/${regionId}`, {
        severityScore: data?.severityScore,
        fundsCrore: data?.funds?.totalFundsCrore
      });
      if (res.data.success) {
        setOracleStatus({ success: true, txHash: res.data.transactionHash, details: res.data.details });
      } else {
        setOracleStatus({ success: false, error: res.data.message });
      }
    } catch (err) {
      setOracleStatus({ success: false, error: err.response?.data?.message || err.message });
    }
    setTriggering(false);
  };

  useEffect(() => {
    setLoading(true);
    api.get(`/predictions/${regionId}`)
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [regionId]);

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Cpu className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-slate-300 text-sm font-medium">Running LSTM model…</p>
      </div>
    </div>
  );

  if (!data) return null;
  const st = RISK_STYLES[data.riskLevel] || RISK_STYLES.MINIMAL;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0a1628] shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={`p-6 border-b border-white/[0.07] ${st.bg} rounded-t-3xl`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className={`w-4 h-4 ${st.text}`} />
                <span className="text-xs text-slate-400 uppercase tracking-widest">{data.region.id}</span>
              </div>
              <h2 className="text-2xl font-black text-white">{data.region.name}</h2>
              <p className={`text-sm font-semibold mt-0.5 ${st.text}`}>{data.riskLabel}</p>
            </div>
            <div className="text-right">
              <SeverityGauge score={data.severityScore} />
              <p className="text-[11px] text-slate-500 mt-1">Confidence: {data.confidence}%</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* DAO Recommendation */}
          <div className={`flex items-start gap-3 p-4 rounded-2xl border ${data.daoRecommendation.urgency === 'HIGH' ? 'bg-red-500/8 border-red-500/25' : 'bg-emerald-500/8 border-emerald-500/25'}`}>
            <Shield className={`w-5 h-5 flex-shrink-0 mt-0.5 ${data.daoRecommendation.urgency === 'HIGH' ? 'text-red-400' : 'text-emerald-400'}`} />
            <div className="flex-1 w-full overflow-hidden">
              <p className="text-xs font-bold uppercase tracking-widest mb-1 text-slate-400">DAO Recommendation</p>
              <p className="text-sm font-semibold text-white">{data.daoRecommendation.message}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <Badge variant={data.daoRecommendation.urgency === 'HIGH' ? 'danger' : 'success'} dot>
                  {data.daoRecommendation.action}
                </Badge>
                {data.daoRecommendation.action === 'PRE_ALLOCATE' && !oracleStatus?.success && (
                  <Button 
                    size="sm" 
                    className="gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    onClick={handleTriggerOracle}
                    disabled={triggering}
                  >
                    <Zap className="w-4 h-4" />
                    {triggering ? 'Triggering...' : 'Trigger Anticipatory Oracle'}
                  </Button>
                )}
              </div>

              {oracleStatus && (
                <div className={`mt-4 p-3 rounded-xl border text-sm ${oracleStatus.success ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  {oracleStatus.success ? (
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 text-emerald-400 font-bold">
                        <CheckCircle className="w-4 h-4" /> Smart Contract Execution Successful
                      </div>
                      <p className="text-emerald-400/80 text-xs mb-2 leading-relaxed">Anticipatory funds pre-released to field NGOs automatically.</p>
                      <div className="bg-[#051020] p-2 rounded-lg border border-emerald-500/20 text-xs overflow-hidden break-all">
                        <span className="text-slate-500">TxHash:</span> <span className="text-emerald-300 font-mono">{oracleStatus.txHash}</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-1 text-red-400 font-bold">
                        <AlertTriangle className="w-4 h-4" /> Execution failed
                      </div>
                      <p className="text-red-400/80 text-xs">{oracleStatus.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* LSTM Trend Chart */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-white flex items-center gap-1.5"><Activity className="w-4 h-4 text-indigo-400" /> LSTM Severity Forecast (14-day)</p>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-emerald-400 inline-block rounded" /> Historical</span>
                <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-indigo-400 inline-block rounded border-dashed" style={{borderTop: '2px dashed'}} /> Forecast</span>
              </div>
            </div>
            <div className="bg-[#051020] rounded-2xl p-4 border border-white/[0.05]">
              <MiniChart data={data.timeSeries} height={100} />
              <div className="flex justify-between text-[10px] text-slate-600 mt-2 px-1">
                <span>7 days ago</span>
                <span className="text-white/30">Today →</span>
                <span>+7 days</span>
              </div>
            </div>
          </div>

          {/* Sensor Data */}
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Live Sensor Readings</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <SensorPill icon={CloudRain} label="Rainfall" value={data.sensors.rainfall} unit="mm/day" warn={data.sensors.rainfall > 250} />
              <SensorPill icon={Droplets} label="Flood Level" value={data.sensors.floodLevel} unit="m" warn={data.sensors.floodLevel > 3} />
              <SensorPill icon={Thermometer} label="Temp" value={data.sensors.temperature} unit="°C" warn={data.sensors.temperature > 38} />
              <SensorPill icon={Activity} label="Humidity" value={data.sensors.humidity} unit="%" warn={data.sensors.humidity > 85} />
              <SensorPill icon={Wind} label="Wind" value={data.sensors.windSpeed} unit="km/h" warn={data.sensors.windSpeed > 60} />
              <SensorPill icon={Users} label="Pop/km²" value={data.region.id === 'BR' ? '1,102' : '—'} unit="" warn={false} />
            </div>
          </div>

          {/* Feature Importance */}
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Random Forest Feature Importance</p>
            <div className="space-y-2">
              {data.featureImportance.map(f => (
                <div key={f.feature} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-36 flex-shrink-0">{f.feature}</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                      style={{ width: `${f.importance * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-emerald-400 w-10 text-right">{(f.importance * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fund Breakdown */}
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Estimated Pre-Allocation</p>
            <div className="bg-[#051020] border border-white/[0.06] rounded-2xl p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400 text-sm">Total Required</span>
                <span className="text-2xl font-black text-emerald-400">₹{data.funds.totalFundsCrore} Cr</span>
              </div>
              <div className="space-y-2">
                {Object.entries(data.funds.breakdown).map(([key, val]) => {
                  const labels = { emergencyRelief: 'Emergency Relief', medicalAid: 'Medical Aid', shelterRebuild: 'Shelter & Rebuild', foodWater: 'Food & Water', adminOps: 'Admin & Ops' };
                  const pct = Math.round((val / data.funds.totalFundsCrore) * 100);
                  return (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 w-32 flex-shrink-0">{labels[key]}</span>
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-slate-300 font-semibold w-14 text-right">₹{val} Cr</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-600 mt-3">~{data.funds.estimatedBeneficiaries.toLocaleString('en-IN')} estimated beneficiaries</p>
            </div>
          </div>

          {/* Model Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
              <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">Random Forest Metrics</p>
              {Object.entries(data.modelMetrics.randomForest).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs py-1 border-b border-white/[0.04] last:border-0">
                  <span className="text-slate-400 capitalize">{k}</span>
                  <span className="text-emerald-400 font-semibold">{v}</span>
                </div>
              ))}
            </div>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
              <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">LSTM-TS Metrics</p>
              {Object.entries(data.modelMetrics.lstm).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs py-1 border-b border-white/[0.04] last:border-0">
                  <span className="text-slate-400 uppercase">{k}</span>
                  <span className="text-indigo-400 font-semibold">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={onClose}>Close Report</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DisasterPredictionPage() {
  const [predictions, setPredictions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterRisk, setFilterRisk] = useState('ALL');

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/predictions');
      setPredictions(res.data.predictions || []);
      setSummary(res.data.summary);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Prediction API error:', err);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = filterRisk === 'ALL' ? predictions
    : predictions.filter(p => p.riskLevel === filterRisk);

  const RISK_FILTERS = ['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW', 'MINIMAL'];

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in max-w-6xl bg-mesh min-h-screen">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-xs text-indigo-400 uppercase tracking-widest font-bold">AI-Powered · ReliefChain Intelligence</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2">
              Disaster Severity <span className="text-gradient">Prediction</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Machine learning models (Random Forest + LSTM time-series) analyze real-time rainfall, flood levels, satellite data and weather APIs to predict disaster severity and pre-allocate DAO relief funds.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Button onClick={fetchData} variant="secondary" size="sm" className={`gap-2 ${refreshing ? 'opacity-60' : ''}`} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Running models…' : 'Refresh Predictions'}
            </Button>
            {lastRefresh && (
              <p className="text-[11px] text-slate-600 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Updated: {lastRefresh.toLocaleTimeString('en-IN')}
              </p>
            )}
          </div>
        </div>

        {/* Model Info Strip */}
        <div className="flex flex-wrap gap-3 mt-5">
          {[
            { icon: Cpu,      label: 'Random Forest v2.1', sub: '87.3% accuracy', color: 'text-emerald-400' },
            { icon: Activity, label: 'LSTM-TS v1.4',       sub: 'R² = 0.91',      color: 'text-indigo-400' },
            { icon: Database, label: 'Data Sources',        sub: 'IMD · CWC · OpenWeather · Sentinel-2', color: 'text-cyan-400' },
            { icon: RefreshCw,label: 'Update Frequency',   sub: 'Every 15 min',   color: 'text-amber-400' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 text-xs bg-white/[0.03] border border-white/[0.07] rounded-xl px-3 py-2">
              <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
              <span className="text-slate-300 font-semibold">{item.label}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-500">{item.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: MapPin,       label: 'Regions Scanned',  value: summary.totalRegions,              color: 'text-slate-300' },
            { icon: AlertTriangle,label: 'Critical Zones',   value: summary.criticalZones,             color: 'text-red-400' },
            { icon: IndianRupee,  label: 'Pre-Alloc Total',  value: `₹${summary.totalPreAllocFundsCrore} Cr`, color: 'text-emerald-400' },
            { icon: Shield,       label: 'Models Active',    value: summary.modelsRun.length,          color: 'text-indigo-400' },
          ].map(s => (
            <Card key={s.label} className="py-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-slate-500 uppercase tracking-widest">{s.label}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center gap-1.5 flex-wrap mb-6">
        <span className="text-xs text-slate-500 mr-1">Filter by risk:</span>
        {RISK_FILTERS.map(f => {
          const active = filterRisk === f;
          const st = RISK_STYLES[f];
          return (
            <button key={f} onClick={() => setFilterRisk(f)}
              className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${
                active ? (st ? `${st.bg} ${st.border} ${st.text}` : 'bg-white/10 border-white/20 text-white') : 'bg-transparent border-white/[0.07] text-slate-500 hover:text-white'
              }`}>
              {f}
            </button>
          );
        })}
      </div>

      {/* Region Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 rounded-2xl bg-white/[0.02] border border-white/[0.06] animate-shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(region => {
            const st = RISK_STYLES[region.riskLevel] || RISK_STYLES.MINIMAL;
            return (
              <div key={region.regionId}
                className={`group relative rounded-2xl border p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${st.bg} ${st.border} hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]`}
                onClick={() => setSelectedRegion(region.regionId)}>

                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <MapPin className={`w-3.5 h-3.5 ${st.text}`} />
                      <span className={`text-[11px] uppercase tracking-widest font-bold ${st.text}`}>{region.regionId} · India</span>
                    </div>
                    <h3 className="text-lg font-black text-white">{region.regionName}</h3>
                  </div>
                  <Badge variant={st.badgeVariant} dot pulse={region.riskLevel === 'CRITICAL' || region.riskLevel === 'HIGH'}>
                    {region.riskLevel}
                  </Badge>
                </div>

                {/* Severity bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Severity Score</span>
                    <span className={`font-black ${st.text}`}>{region.severityScore}/100</span>
                  </div>
                  <div className="h-2.5 bg-black/30 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${st.bar}`}
                      style={{ width: `${region.severityScore}%`, boxShadow: `0 0 8px currentColor` }} />
                  </div>
                </div>

                {/* Sensor mini-pills */}
                <div className="grid grid-cols-3 gap-1.5 mb-4">
                  {[
                    { icon: CloudRain, v: `${region.sensors.rainfall}mm` },
                    { icon: Droplets,  v: `${region.sensors.floodLevel}m` },
                    { icon: Wind,      v: `${region.sensors.windSpeed}km/h` },
                  ].map(({ icon: Icon, v }, i) => (
                    <div key={i} className="flex items-center gap-1 bg-black/20 rounded-lg px-2 py-1.5">
                      <Icon className="w-3 h-3 text-slate-500 flex-shrink-0" />
                      <span className="text-[11px] text-slate-300 truncate">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Fund estimate */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.06]">
                  <div>
                    <p className="text-[11px] text-slate-500 uppercase tracking-widest">Est. Relief Funds</p>
                    <p className={`text-base font-black ${st.text}`}>₹{region.funds.totalFundsCrore} Cr</p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <span>Confidence: {region.confidence}%</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* Hover overlay arrow */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className={`w-4 h-4 ${st.text}`} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Data Sources Info */}
      <div className="mt-10 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-500 leading-relaxed">
            <span className="text-slate-300 font-semibold">Data Sources & Methodology: </span>
            Rainfall and flood data sourced from <strong className="text-slate-400">India Meteorological Department (IMD)</strong> and <strong className="text-slate-400">Central Water Commission (CWC)</strong> gauge stations.
            Satellite imagery via <strong className="text-slate-400">Sentinel-2 SAR</strong> for flood mapping. Weather forecasts from <strong className="text-slate-400">OpenWeatherMap API</strong>.
            The Random Forest model was trained on 12 years of historical disaster records (2012–2024).
            LSTM time-series model uses a sliding 30-day window with daily granularity.
            All predictions are probabilistic — always validate with field teams before fund deployment.
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRegion && (
        <RegionDetailPanel regionId={selectedRegion} onClose={() => setSelectedRegion(null)} />
      )}
    </div>
  );
}
