import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../services/api';
import {
  ShieldAlert, Upload, CheckCircle2, XCircle, AlertTriangle,
  FileText, Image, Cpu, BarChart2, Clock, RefreshCw, Eye,
  Lock, Scan, Fingerprint, BrainCircuit, AlertCircle, IndianRupee,
  ChevronDown, ChevronUp, Activity, Database, Zap
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const VERDICT_STYLE = {
  FRAUDULENT:   { bg: 'bg-red-500/10',     border: 'border-red-500/30',    text: 'text-red-400',    badge: 'danger',  icon: XCircle },
  SUSPICIOUS:   { bg: 'bg-orange-500/10',  border: 'border-orange-500/30', text: 'text-orange-400', badge: 'warning', icon: AlertTriangle },
  INCONCLUSIVE: { bg: 'bg-amber-500/10',   border: 'border-amber-500/30',  text: 'text-amber-400',  badge: 'warning', icon: AlertCircle },
  AUTHENTIC:    { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30',text: 'text-emerald-400',badge: 'success', icon: CheckCircle2 },
};

const FINDING_STYLE = {
  PASS: { text: 'text-emerald-400', bg: 'bg-emerald-500/8', border: 'border-emerald-500/20', icon: CheckCircle2 },
  WARN: { text: 'text-amber-400',   bg: 'bg-amber-500/8',   border: 'border-amber-500/20',  icon: AlertTriangle },
  FAIL: { text: 'text-red-400',     bg: 'bg-red-500/8',     border: 'border-red-500/20',    icon: XCircle },
};

const MODULE_ICONS = {
  'OCR Invoice Analysis':      FileText,
  'Image Integrity Analysis':  Image,
  'Funding Pattern Anomaly':   BarChart2,
};

function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

// ─── Pipeline Step Component ──────────────────────────────────────────────────
function PipelineStep({ label, icon: Icon, status, delay }) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setActive(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className={`flex items-center gap-2 transition-all duration-500 ${active ? 'opacity-100' : 'opacity-0 translate-y-2'}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all ${
        status === 'running' ? 'bg-indigo-500/15 border-indigo-500/30' :
        status === 'done'    ? 'bg-emerald-500/15 border-emerald-500/30' :
        'bg-white/[0.04] border-white/[0.08]'
      }`}>
        {status === 'running'
          ? <Cpu className="w-4 h-4 text-indigo-400 animate-spin" />
          : status === 'done'
          ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          : <Icon className="w-4 h-4 text-slate-500" />
        }
      </div>
      <span className={`text-xs font-semibold ${status === 'running' ? 'text-indigo-300' : status === 'done' ? 'text-emerald-400' : 'text-slate-500'}`}>{label}</span>
      {status === 'running' && <span className="text-[10px] text-indigo-400 animate-pulse ml-auto">analyzing…</span>}
      {status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto" />}
    </div>
  );
}

// ─── Module Result Card ───────────────────────────────────────────────────────
function ModuleCard({ module }) {
  const [expanded, setExpanded] = useState(true);
  const Icon = MODULE_ICONS[module.module] || BrainCircuit;
  const scoreColor = module.riskScore >= 70 ? 'text-red-400' : module.riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400';
  const barColor   = module.riskScore >= 70 ? 'from-red-600 to-red-400' : module.riskScore >= 40 ? 'from-amber-500 to-yellow-400' : 'from-emerald-600 to-emerald-400';

  return (
    <div className="border border-white/[0.07] rounded-2xl overflow-hidden bg-gradient-to-b from-[#0f1f35]/90 to-[#0a1628]/90">
      <button className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}>
        <div className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.07]">
          <Icon className="w-4 h-4 text-slate-300" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-bold text-white">{module.module}</p>
          <p className="text-[11px] text-slate-500">{module.model}</p>
        </div>
        <div className="text-right mr-2">
          <p className={`text-lg font-black ${scoreColor}`}>{module.riskScore}</p>
          <p className="text-[10px] text-slate-500">risk score</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />}
      </button>

      {/* Risk bar */}
      <div className="px-4 pb-3">
        <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
          <div className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
            style={{ width: `${module.riskScore}%`, boxShadow: `0 0 6px currentColor` }} />
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-white/[0.05] pt-4">
          {module.findings.map((f, i) => {
            const s = FINDING_STYLE[f.result];
            const FIcon = s.icon;
            return (
              <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${s.bg} ${s.border}`}>
                <FIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${s.text}`} />
                <div className="min-w-0">
                  <span className={`text-xs font-bold ${s.text}`}>{f.check}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{f.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Verdict Banner ───────────────────────────────────────────────────────────
function VerdictBanner({ result }) {
  const s = VERDICT_STYLE[result.verdict] || VERDICT_STYLE.AUTHENTIC;
  const VIcon = s.icon;
  const actionLabels = { BLOCK: '🚫 Block & Escalate', FLAG_FOR_REVIEW: '🚩 Flag for DAO Review', HOLD: '⏸ Hold 48h', APPROVE: '✅ Approve Tranche' };

  return (
    <div className={`rounded-2xl border p-5 ${s.bg} ${s.border} animate-slide-up`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-2xl bg-black/20 border ${s.border} flex-shrink-0`}>
          <VIcon className={`w-6 h-6 ${s.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h3 className={`text-xl font-black ${s.text}`}>{result.verdict}</h3>
            <Badge variant={s.badge} dot pulse={result.verdict === 'FRAUDULENT'}>
              Severity: {result.severity}
            </Badge>
            <Badge variant={s.badge}>{result.daoAction.replace(/_/g, ' ')}</Badge>
          </div>

          {/* Score bar */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-3 bg-black/30 rounded-full overflow-hidden relative">
              <div className={`h-full rounded-full bg-gradient-to-r ${
                result.overallRiskScore >= 70 ? 'from-red-600 to-red-400' :
                result.overallRiskScore >= 45 ? 'from-orange-500 to-amber-400' :
                result.overallRiskScore >= 25 ? 'from-amber-500 to-yellow-400' :
                'from-emerald-600 to-emerald-400'
              } transition-all duration-1000`}
                style={{ width: `${result.overallRiskScore}%` }} />
            </div>
            <span className={`text-lg font-black flex-shrink-0 ${s.text}`}>{result.overallRiskScore}/100</span>
          </div>

          <p className="text-sm text-slate-300 mb-3 leading-relaxed">{result.recommendation}</p>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-xs text-slate-500">
              <span className="text-emerald-400 font-bold">{result.summary.passCount}</span> passed ·{' '}
              <span className="text-amber-400 font-bold">{result.summary.warnCount}</span> warnings ·{' '}
              <span className="text-red-400 font-bold">{result.summary.failCount}</span> failed
            </div>
          </div>

          {result.allRiskFactors?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {result.allRiskFactors.map((f, i) => (
                <span key={i} className={`text-[11px] px-2.5 py-1 rounded-full border ${s.bg} ${s.border} ${s.text} font-semibold`}>⚠ {f}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Fraud Registry Table ─────────────────────────────────────────────────────
function FraudRegistry() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/fraud/registry')
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-40 rounded-2xl bg-white/[0.02] animate-shimmer" />;
  if (!data) return null;

  const verdictColor = { FRAUDULENT: 'danger', SUSPICIOUS: 'warning', INCONCLUSIVE: 'info', AUTHENTIC: 'success' };

  return (
    <div className="space-y-4">
      {/* Registry Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Blocked',          value: data.blocked,  color: 'text-red-400' },
          { label: 'Flagged',          value: data.flagged,  color: 'text-amber-400' },
          { label: 'On Hold',          value: data.held,     color: 'text-indigo-400' },
          { label: 'Funds Protected',  value: `₹${(data.fundsProtected/10000000).toFixed(1)}Cr`, color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-3 text-center">
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-slate-500 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.04] border-b border-white/[0.07] text-slate-500 text-[11px] uppercase tracking-widest">
                <th className="text-left px-4 py-3">Case ID</th>
                <th className="text-left px-4 py-3">NGO</th>
                <th className="text-left px-4 py-3">Campaign</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Score</th>
                <th className="text-left px-4 py-3">Verdict</th>
                <th className="text-left px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.registry.map((row, i) => {
                const score = row.score;
                const sc = score >= 70 ? 'text-red-400' : score >= 45 ? 'text-amber-400' : 'text-yellow-400';
                return (
                  <tr key={row.id} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'}`}>
                    <td className="px-4 py-3 font-mono text-[11px] text-indigo-400">{row.id}</td>
                    <td className="px-4 py-3 text-slate-300 font-semibold text-xs">{row.ngo}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs truncate max-w-[180px]">{row.campaign}</td>
                    <td className="px-4 py-3 text-slate-300 text-xs font-semibold">{fmt(row.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-black ${sc}`}>{score}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={verdictColor[row.verdict] || 'neutral'} className="text-[10px]">
                        {row.verdict}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">{row.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FraudDetectionPage() {
  const [tab, setTab] = useState('analyze');
  const [files, setFiles] = useState([]);
  const [ngoId]  = useState('NGO-GF-2024');
  const [amount, setAmount] = useState('150000');
  const [analyzing, setAnalyzing] = useState(false);
  const [pipeline, setPipeline] = useState([]); // steps with statuses
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState(null);
  const dropRef = useRef();

  useEffect(() => {
    api.get('/fraud/stats').then(res => setStats(res.data.stats)).catch(() => {});
  }, []);

  const PIPELINE_STEPS = [
    { id: 'upload',   label: 'File Validation & Extraction', icon: Upload },
    { id: 'ocr',      label: 'OCR Invoice Analysis (Tesseract)', icon: FileText },
    { id: 'hash',     label: 'Perceptual Hash Deduplication', icon: Fingerprint },
    { id: 'exif',     label: 'EXIF Metadata Extraction', icon: Scan },
    { id: 'ela',      label: 'Error Level Analysis (OpenCV)', icon: Eye },
    { id: 'resnet',   label: 'ResNet-50 Scene Classification', icon: BrainCircuit },
    { id: 'gan',      label: 'GAN / Deepfake Detection', icon: Activity },
    { id: 'anomaly',  label: 'Funding Pattern Anomaly (IsoForest)', icon: BarChart2 },
    { id: 'verdict',  label: 'Weighted Ensemble Verdict', icon: ShieldAlert },
  ];

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = [...(e.dataTransfer?.files || e.target.files || [])];
    setFiles(prev => {
      const newFiles = dropped.filter(f => !prev.find(p => p.name === f.name));
      return [...prev, ...newFiles].slice(0, 5);
    });
    setResult(null);
  };

  const removeFile = (name) => {
    setFiles(prev => prev.filter(f => f.name !== name));
    setResult(null);
  };

  const runAnalysis = async () => {
    if (!files.length) return;
    setAnalyzing(true);
    setResult(null);
    setPipeline(PIPELINE_STEPS.map((s, i) => ({ ...s, status: 'pending' })));

    // Animate pipeline steps sequentially
    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      setPipeline(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'running' } : s));
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
      setPipeline(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'done' } : s));
    }

    try {
      const payload = {
        files: files.map(f => ({ name: f.name, type: f.type, size: f.size })),
        ngoId,
        amount: parseFloat(amount) || 150000,
        campaignId: 'campaign-1',
      };
      const res = await api.post('/fraud/analyze', payload);
      setResult(res.data);
    } catch (err) {
      console.error(err);
    }
    setAnalyzing(false);
  };

  const TABS = [
    { id: 'analyze',  label: '🔍 Analyze Proof',   icon: Scan },
    { id: 'registry', label: '📋 Fraud Registry',  icon: Database },
  ];

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in max-w-5xl">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-xs text-red-400 uppercase tracking-widest font-bold">AI-Powered · ReliefChain Security</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-2">
          Fraud <span className="text-gradient">Detection</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
          AI models detect invoice forgery, duplicate images, EXIF manipulation, deepfakes, and funding anomalies
          in NGO proof submissions before DAO tranche release.
        </p>

        {/* Model pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { label: 'Tesseract OCR', color: 'text-amber-400',   icon: FileText },
            { label: 'ResNet-50',     color: 'text-indigo-400',  icon: BrainCircuit },
            { label: 'OpenCV ELA',    color: 'text-cyan-400',    icon: Eye },
            { label: 'pHash Dedup',   color: 'text-emerald-400', icon: Fingerprint },
            { label: 'IsoForest',     color: 'text-orange-400',  icon: BarChart2 },
          ].map(m => (
            <div key={m.label} className="flex items-center gap-1.5 text-xs bg-white/[0.03] border border-white/[0.07] rounded-full px-3 py-1.5">
              <m.icon className={`w-3 h-3 ${m.color}`} />
              <span className="text-slate-400">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Analysed',        value: stats.totalAnalyzed, color: 'text-slate-300' },
            { label: 'Fraudulent',      value: stats.fraudulent,    color: 'text-red-400' },
            { label: 'Suspicious',      value: stats.suspicious,    color: 'text-amber-400' },
            { label: 'Funds Protected', value: `₹${stats.fundsProtectedCrore} Cr`, color: 'text-emerald-400' },
          ].map(s => (
            <Card key={s.label} className="py-3 text-center">
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-slate-500 uppercase tracking-widest">{s.label}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Tab Nav */}
      <div className="flex gap-1 p-1 bg-slate-800/80 rounded-xl mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Analyze ─────────────────────────────────────── */}
      {tab === 'analyze' && (
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Left: Upload + Config */}
          <div className="space-y-5">
            {/* Drop zone */}
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Upload Proof Files</p>
              <div
                ref={dropRef}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => document.getElementById('fraud-file-input').click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-red-500/40 hover:bg-red-500/[0.03] ${files.length ? 'border-red-500/30 bg-red-500/[0.03]' : 'border-white/[0.10]'}`}>
                <input id="fraud-file-input" type="file" className="hidden" multiple accept="image/*,.pdf"
                  onChange={handleDrop} />
                <Upload className="w-9 h-9 text-slate-500 mx-auto mb-3" />
                <p className="font-semibold text-slate-300 mb-1">Drop files or click to browse</p>
                <p className="text-xs text-slate-500">Invoices (PDF), field photos (JPEG/PNG) · Max 5 files, 10 MB each</p>
              </div>

              {/* File list */}
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map(f => {
                    const isPdf = f.name.endsWith('.pdf');
                    return (
                      <div key={f.name} className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.07] rounded-xl text-sm">
                        {isPdf ? <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" /> : <Image className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
                        <span className="flex-1 text-slate-300 truncate">{f.name}</span>
                        <span className="text-[11px] text-slate-500">{(f.size / 1024).toFixed(0)} KB</span>
                        <button onClick={() => removeFile(f.name)} className="text-slate-600 hover:text-red-400 transition-colors text-lg leading-none">×</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Config */}
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Analysis Context</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">NGO Wallet / ID</label>
                  <input value={ngoId} readOnly
                    className="w-full bg-slate-900/60 border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-slate-400 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Claimed Amount (₹)</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors" />
                </div>
              </div>
            </div>

            <Button className="w-full py-4 text-base" onClick={runAnalysis} disabled={!files.length || analyzing}
              style={{ background: !files.length || analyzing ? undefined : 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
              {analyzing
                ? <><Cpu className="w-5 h-5 animate-spin mr-2" /> Running AI Models…</>
                : <><ShieldAlert className="w-5 h-5 mr-2" /> Run Fraud Analysis</>
              }
            </Button>

            {/* AI Pipeline visualization */}
            {(analyzing || result) && (
              <div className="bg-[#051020] border border-white/[0.06] rounded-2xl p-4 space-y-3">
                <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-1">AI Analysis Pipeline</p>
                {PIPELINE_STEPS.map((step, i) => (
                  <PipelineStep key={step.id} label={step.label} icon={step.icon}
                    status={pipeline[i]?.status || 'pending'} delay={i * 80} />
                ))}
              </div>
            )}
          </div>

          {/* Right: Results */}
          <div className="space-y-5">
            {!result && !analyzing && (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/[0.07] rounded-2xl">
                <ShieldAlert className="w-12 h-12 text-slate-700 mb-4" />
                <p className="text-slate-500 text-sm font-medium">Upload proof files and run analysis</p>
                <p className="text-slate-600 text-xs mt-1">16 AI checks across 3 modules</p>
              </div>
            )}

            {result && (
              <>
                <VerdictBanner result={result} />

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono">Case: {result.analysisId}</span>
                  <span>{new Date(result.analyzedAt).toLocaleTimeString('en-IN')}</span>
                </div>

                <div className="space-y-3">
                  {result.modules?.map((m, i) => <ModuleCard key={i} module={m} />)}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Registry ─────────────────────────────────────── */}
      {tab === 'registry' && <FraudRegistry />}
    </div>
  );
}
