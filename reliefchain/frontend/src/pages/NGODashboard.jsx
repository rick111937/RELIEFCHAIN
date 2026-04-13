import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../services/api';
import {
  UploadCloud, FileCheck, Loader2, AlertCircle, BarChart2,
  CheckCircle, Clock, Lock, ChevronDown, ChevronUp,
  ClipboardCopy, Plus, Trash2, IndianRupee, RefreshCw,
  Building2, MapPin, Phone, Globe, Send, FileText,
  TrendingUp, ShieldCheck, Users, Calendar
} from 'lucide-react';

// ─── Mock data ───────────────────────────────────────────────────────────────
const CAMPAIGNS = [
  {
    id: 1,
    name: 'Assam Flood Relief 2024',
    icon: '🌊',
    region: 'Assam & Meghalaya',
    status: 'ACTIVE',
    raisedAmount: 3750000,
    targetAmount: 8300000,
    beneficiaries: 4820,
    milestones: [
      { id: 1, title: 'Emergency Logistics & Camp Setup',    amount: 830000,  status: 'released', proofHash: 'QmX7r2k9P' },
      { id: 2, title: 'Water Filtration Units (500 units)',  amount: 2075000, status: 'pending',  proofHash: null },
      { id: 3, title: 'Shelter Rebuilding – Phase 1',        amount: 2490000, status: 'locked',   proofHash: null },
      { id: 4, title: 'Livelihood Restoration Grants',       amount: 2905000, status: 'locked',   proofHash: null },
    ],
  },
  {
    id: 2,
    name: 'Odisha Cyclone Recovery',
    icon: '🌀',
    region: 'Coastal Odisha',
    status: 'ACTIVE',
    raisedAmount: 1250000,
    targetAmount: 5000000,
    beneficiaries: 1230,
    milestones: [
      { id: 1, title: 'Search & Rescue Operations',     amount: 500000,  status: 'released', proofHash: 'QmA3b5cF2' },
      { id: 2, title: 'Food & Medical Kits (Phase 1)',  amount: 1250000, status: 'released', proofHash: 'QmK9d7eG4' },
      { id: 3, title: 'Infrastructure Repair',          amount: 1500000, status: 'locked',   proofHash: null },
      { id: 4, title: 'Fishing Boat Restoration',       amount: 1750000, status: 'locked',   proofHash: null },
    ],
  },
];

const EXPENSE_CATS = ['Transport', 'Food & Water', 'Medical', 'Construction', 'Admin', 'Communication'];

function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'text-emerald-400' }) {
  return (
    <Card className="bg-slate-800/50 border-slate-700/40 flex items-center gap-4 py-4">
      <div className={`p-3 rounded-xl bg-slate-900/80 ${color}`}><Icon className="w-5 h-5" /></div>
      <div>
        <p className="text-xl font-black text-white">{value}</p>
        <p className="text-xs text-slate-400 uppercase tracking-widest">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </Card>
  );
}

// ─── Campaign Overview ────────────────────────────────────────────────────────
function CampaignCard({ c, onSelect, selected }) {
  const pct = Math.round((c.raisedAmount / c.targetAmount) * 100);
  return (
    <div
      onClick={() => onSelect(c.id)}
      className={`p-4 rounded-2xl border cursor-pointer transition-all ${selected ? 'border-emerald-500/60 bg-emerald-900/20' : 'border-slate-700/50 bg-slate-800/40 hover:border-emerald-500/30'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{c.icon}</span>
          <div>
            <p className="font-bold text-white text-sm">{c.name}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{c.region}</p>
          </div>
        </div>
        <Badge variant={c.status === 'ACTIVE' ? 'success' : 'neutral'}>{c.status}</Badge>
      </div>
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span className="text-emerald-400 font-semibold">{fmt(c.raisedAmount)} raised</span>
        <span>{fmt(c.targetAmount)}</span>
      </div>
      <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>{pct}% funded</span>
        <span><Users className="w-3 h-3 inline mr-0.5" />{c.beneficiaries.toLocaleString('en-IN')} beneficiaries</span>
      </div>
    </div>
  );
}

// ─── Milestone Tracker ────────────────────────────────────────────────────────
function MilestoneTracker({ campaign, onSubmitProof }) {
  const statusStyle = {
    released: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    pending:  'bg-amber-500/10  border-amber-500/30  text-amber-400',
    locked:   'bg-slate-800     border-slate-700     text-slate-500',
  };
  const statusIcon = { released: <CheckCircle className="w-4 h-4" />, pending: <Clock className="w-4 h-4" />, locked: <Lock className="w-4 h-4" /> };

  return (
    <div className="space-y-3">
      {campaign.milestones.map((m, i) => (
        <div key={m.id} className={`border rounded-xl p-4 transition-all ${statusStyle[m.status]}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {statusIcon[m.status]}
              <span className="font-semibold text-sm">Tranche {i + 1}: {m.title}</span>
            </div>
            <span className="font-black text-sm">{fmt(m.amount)}</span>
          </div>
          {m.status === 'released' && m.proofHash && (
            <p className="text-xs font-mono opacity-70">IPFS: {m.proofHash}…<a href={`https://ipfs.io/ipfs/${m.proofHash}`} target="_blank" rel="noreferrer" className="ml-2 underline">View ↗</a></p>
          )}
          {m.status === 'pending' && (
            <button
              onClick={() => onSubmitProof(m)}
              className="mt-2 w-full text-xs py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all font-semibold flex items-center justify-center gap-1">
              <UploadCloud className="w-3.5 h-3.5" /> Submit Expenditure Proof for DAO Vote
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Expense Logger ───────────────────────────────────────────────────────────
function ExpenseLogger() {
  const [expenses, setExpenses] = useState([
    { id: 1, desc: 'Truck hire – Guwahati depot', cat: 'Transport',    amount: 85000,  date: '2024-08-12', receipt: 'INV-001' },
    { id: 2, desc: '500 water filter units',       cat: 'Food & Water', amount: 210000, date: '2024-08-15', receipt: 'INV-002' },
    { id: 3, desc: 'Medical kit procurement',       cat: 'Medical',      amount: 128000, date: '2024-08-18', receipt: 'INV-003' },
  ]);
  const [form, setForm] = useState({ desc: '', cat: 'Transport', amount: '', date: '', receipt: '' });
  const [show, setShow] = useState(false);

  const add = () => {
    if (!form.desc || !form.amount) return;
    setExpenses(prev => [...prev, { ...form, id: Date.now(), amount: parseInt(form.amount) }]);
    setForm({ desc: '', cat: 'Transport', amount: '', date: '', receipt: '' });
    setShow(false);
  };

  const remove = (id) => setExpenses(prev => prev.filter(e => e.id !== id));
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Total Logged</p>
          <p className="text-2xl font-black text-emerald-400">{fmt(total)}</p>
        </div>
        <Button onClick={() => setShow(!show)} className="text-sm py-2 px-4 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-1" /> Log Expense
        </Button>
      </div>

      {show && (
        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-4 space-y-3 animate-slide-up">
          <input className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            placeholder="Description" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <select className="bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              value={form.cat} onChange={e => setForm({ ...form, cat: e.target.value })}>
              {EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
            <input type="number" className="bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              placeholder="Amount (₹)" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            <input type="date" className="bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <input className="bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              placeholder="Invoice / Receipt #" value={form.receipt} onChange={e => setForm({ ...form, receipt: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <Button onClick={add} className="flex-1 py-2 text-sm bg-emerald-600 hover:bg-emerald-700">Add Entry</Button>
            <Button onClick={() => setShow(false)} className="py-2 px-4 text-sm bg-slate-700 hover:bg-slate-600">Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {expenses.map(e => (
          <div key={e.id} className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700/40 rounded-xl hover:border-slate-600 transition-all">
            <IndianRupee className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{e.desc}</p>
              <p className="text-xs text-slate-500">{e.cat} · {e.date} · #{e.receipt}</p>
            </div>
            <p className="text-emerald-400 font-bold text-sm flex-shrink-0">{fmt(e.amount)}</p>
            <button onClick={() => remove(e.id)} className="text-slate-600 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── IPFS Proof Upload ─────────────────────────────────────────────────────────
function ProofUpload({ activeMilestone }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    { hash: 'QmX7r2k9P3bE2aVfL', milestone: 'Tranche 1 – Emergency Logistics', date: '2024-08-10', status: 'Approved by DAO' },
  ]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      await api.post('/ipfs/upload');
      const fakeHash = 'Qm' + Math.random().toString(36).slice(2, 12).toUpperCase();
      setHistory(prev => [{
        hash: fakeHash,
        milestone: activeMilestone?.title || 'Current Milestone',
        date: new Date().toISOString().slice(0, 10),
        status: 'Pending DAO Vote',
      }, ...prev]);
      setSelectedFile(null);
      setNote('');
    } catch {}
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      {activeMilestone && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-amber-400 text-xs font-semibold">Pending Tranche</p>
            <p className="text-slate-300 text-sm">{activeMilestone.title} — {fmt(activeMilestone.amount)}</p>
          </div>
        </div>
      )}

      <div
        className="relative border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center hover:border-emerald-500/50 transition-colors group cursor-pointer"
        onClick={() => document.getElementById('ngo-file-input').click()}>
        <input id="ngo-file-input" type="file" className="hidden" accept="image/*,.pdf"
          onChange={e => e.target.files?.[0] && setSelectedFile(e.target.files[0])} />
        <UploadCloud className="w-10 h-10 text-slate-500 mx-auto mb-3 group-hover:text-emerald-400 transition-colors" />
        {selectedFile
          ? <p className="font-semibold text-emerald-400">{selectedFile.name}</p>
          : <><p className="font-medium text-slate-300 mb-1">Click to choose file</p>
            <p className="text-xs text-slate-500">Geo-tagged photos (JPEG/PNG) or vendor invoices (PDF). Max 10 MB.</p></>
        }
      </div>

      <textarea
        className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
        placeholder="Proof notes (optional) — describe the work completed and funds spent…"
        rows={3} value={note} onChange={e => setNote(e.target.value)} />

      <div className="flex items-start gap-2 text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        Falsified proofs or missing EXIF geolocation data will result in DAO rejection and slashing of your NGO bond.
      </div>

      <Button
        className="w-full py-4 text-base bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
        disabled={!selectedFile || loading}
        onClick={handleUpload}>
        {loading
          ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Pinning to IPFS…</>
          : <><Send className="w-5 h-5 mr-2" /> Pin to IPFS &amp; Submit to DAO</>
        }
      </Button>

      {history.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Submission History</p>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700/40 rounded-xl text-sm">
                <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-indigo-300 truncate">{h.hash}</p>
                  <p className="text-slate-500 text-xs truncate">{h.milestone} · {h.date}</p>
                </div>
                <Badge variant={h.status === 'Approved by DAO' ? 'success' : 'warning'} className="text-xs">{h.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── NGO Profile ──────────────────────────────────────────────────────────────
function NGOProfile({ address }) {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'GreenRelief Foundation',
    reg: 'NGO-MH-2019-008432',
    type: '12A Registered NPO',
    website: 'greenrelief.org.in',
    contact: '+91 98765 43210',
    region: 'Pan-India (HQ: Pune)',
    about: 'GreenRelief Foundation is a grassroots disaster-response NGO specializing in rapid deployment of water, shelter, and medical aid across flood-prone states.',
  });
  const [draft, setDraft] = useState({ ...profile });

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4 p-4 bg-slate-900/60 rounded-2xl border border-slate-700/40">
        <div className="w-14 h-14 bg-emerald-600/30 rounded-2xl flex items-center justify-center text-2xl ring-2 ring-emerald-500/30 flex-shrink-0">
          <Building2 className="w-7 h-7 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input className="w-full bg-slate-800 border border-slate-600 rounded-lg py-1.5 px-3 text-white font-bold text-lg focus:outline-none focus:border-emerald-500 mb-1"
              value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} />
          ) : <p className="font-black text-xl text-white mb-1">{profile.name}</p>}
          <p className="text-slate-400 text-xs font-mono">{profile.reg}</p>
          <p className="text-slate-500 text-xs">{profile.type}</p>
        </div>
        <button
          className="text-xs text-slate-500 hover:text-emerald-400 transition-colors flex-shrink-0 mt-1"
          onClick={() => { if (editing) { setProfile({ ...draft }); } setEditing(!editing); }}>
          {editing ? <CheckCircle className="w-4 h-4" /> : '✏️'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 text-sm">
        {[
          { icon: Globe,    label: 'Website',  field: 'website',  prefix: 'https://' },
          { icon: Phone,    label: 'Contact',  field: 'contact',  prefix: '' },
          { icon: MapPin,   label: 'Region',   field: 'region',   prefix: '' },
        ].map(({ icon: Icon, label, field, prefix }) => (
          <div key={field} className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700/40 rounded-xl">
            <Icon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-slate-500 text-xs">{label}</p>
              {editing
                ? <input className="w-full bg-slate-700 rounded-lg py-1 px-2 text-white text-xs focus:outline-none focus:border-emerald-500 mt-0.5"
                    value={draft[field]} onChange={e => setDraft({ ...draft, [field]: e.target.value })} />
                : <p className="text-slate-200 font-medium truncate">{prefix}{profile[field]}</p>
              }
            </div>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">About</p>
        {editing
          ? <textarea className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
              rows={3} value={draft.about} onChange={e => setDraft({ ...draft, about: e.target.value })} />
          : <p className="text-slate-400 text-sm leading-relaxed">{profile.about}</p>
        }
      </div>

      {address && (
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1">Registered Wallet</p>
          <code className="text-xs text-emerald-400 font-mono break-all">{address}</code>
        </div>
      )}

      {editing && (
        <Button className="w-full py-2.5 text-sm bg-emerald-600 hover:bg-emerald-700"
          onClick={() => { setProfile({ ...draft }); setEditing(false); }}>
          <CheckCircle className="w-4 h-4 mr-2" /> Save Profile
        </Button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NGODashboard() {
  const { address, isConnected } = useAccount();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');

  const campaign = CAMPAIGNS.find(c => c.id === selectedId) || CAMPAIGNS[0];
  const pendingMilestone = campaign.milestones.find(m => m.status === 'pending') || null;
  const releasedCount = campaign.milestones.filter(m => m.status === 'released').length;
  const totalReleased = campaign.milestones.filter(m => m.status === 'released').reduce((s, m) => s + m.amount, 0);

  const TABS = [
    { id: 'overview',    label: 'Overview',    icon: BarChart2 },
    { id: 'milestones',  label: 'Milestones',  icon: TrendingUp },
    { id: 'expenses',    label: 'Expenses',    icon: IndianRupee },
    { id: 'proof',       label: 'IPFS Proof',  icon: UploadCloud },
    { id: 'profile',     label: 'NGO Profile', icon: Building2 },
  ];

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in max-w-5xl">

      {/* Welcome / Register Banner for Non-NGOs or Guests */}
      {(!user || user.role !== 'ngo') && (
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent border border-emerald-500/20 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 flex-shrink-0">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white mb-1">NGO Operations Hub</h3>
              <p className="text-sm text-slate-400 max-w-md">
                View verified audit campaigns using on-chain tracking milestones. Submit proofs to release donor tranches.
              </p>
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0 w-full md:w-auto">
            <Button onClick={() => navigate('/register')} className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5">
              Get Verified
            </Button>
            <Button onClick={() => navigate('/login')} className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold px-5">
              Portal Login
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-black text-emerald-400 mb-1">NGO Operations Hub</h1>
          <p className="text-slate-400 text-sm">
            Manage campaigns, submit IPFS proofs, log expenses, and request tranche releases.
          </p>
          {!isConnected && (
            <div className="mt-2 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1 text-amber-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5" /> Connect your NGO wallet to sign transactions
            </div>
          )}
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1 flex-shrink-0">
          <Calendar className="w-3.5 h-3.5" /> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard icon={BarChart2}    label="Campaigns"   value={CAMPAIGNS.length}        color="text-emerald-400" />
        <StatCard icon={CheckCircle}  label="Tranches Released" value={releasedCount}     color="text-cyan-400" />
        <StatCard icon={IndianRupee}  label="Total Raised" value={fmt(campaign.raisedAmount)} color="text-indigo-400" />
        <StatCard icon={Users}        label="Beneficiaries" value={campaign.beneficiaries.toLocaleString('en-IN')} color="text-amber-400" />
      </div>

      {/* Campaign Selector */}
      <div className="mb-6">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Select Campaign</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {CAMPAIGNS.map(c => (
            <CampaignCard key={c.id} c={c} selected={selectedId === c.id} onSelect={setSelectedId} />
          ))}
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 p-1 bg-slate-800/80 rounded-xl mb-6 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id}
              className={`flex-1 min-w-fit flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg font-semibold text-xs whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setActiveTab(tab.id)}>
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <Card className="border-emerald-500/10 bg-slate-800/30">

        {activeTab === 'overview' && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-400" /> Campaign Overview — {campaign.name}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                {[
                  { label: 'Total Target',    val: fmt(campaign.targetAmount),  color: 'text-white' },
                  { label: 'Total Raised',    val: fmt(campaign.raisedAmount),  color: 'text-emerald-400' },
                  { label: 'Released So Far', val: fmt(totalReleased),          color: 'text-cyan-400' },
                  { label: 'Remaining',       val: fmt(campaign.targetAmount - campaign.raisedAmount), color: 'text-amber-400' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-700/30">
                    <span className="text-slate-400 text-sm">{label}</span>
                    <span className={`font-black text-sm ${color}`}>{val}</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-900/60 rounded-2xl border border-slate-700/30 p-4">
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-3">Milestone Progress</p>
                {campaign.milestones.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.status === 'released' ? 'bg-emerald-400' : m.status === 'pending' ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
                    <p className="text-xs text-slate-300 flex-1 truncate">T{i+1}: {m.title}</p>
                    <span className="text-xs font-semibold text-slate-400">{fmt(m.amount)}</span>
                  </div>
                ))}
                <div className="mt-4 pt-3 border-t border-slate-700/50">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Funding progress</span>
                    <span>{Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)}%</span>
                  </div>
                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                      style={{ width: `${(campaign.raisedAmount / campaign.targetAmount) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              All funds locked in <span className="font-bold mx-1">ReliefFund.sol</span> smart contract — released only after DAO milestone approval.
            </div>
          </div>
        )}

        {activeTab === 'milestones' && (
          <div>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" /> Milestone Tracker — {campaign.name}
            </h2>
            <p className="text-slate-400 text-sm mb-5">
              Track each tranche's lifecycle: Released → Pending DAO Vote → Locked.
            </p>
            <MilestoneTracker campaign={campaign} onSubmitProof={() => setActiveTab('proof')} />
          </div>
        )}

        {activeTab === 'expenses' && (
          <div>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-emerald-400" /> Expense Logger
            </h2>
            <p className="text-slate-400 text-sm mb-5">
              Log all expenditures per milestone. These entries form the basis of the IPFS proof you submit to the DAO.
            </p>
            <ExpenseLogger />
          </div>
        )}

        {activeTab === 'proof' && (
          <div>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-emerald-400" /> IPFS Proof Submission
            </h2>
            <p className="text-slate-400 text-sm mb-5">
              Upload geo-tagged photos or invoices. Files are cryptographically pinned to IPFS and linked to a DAO governance proposal for tranche release.
            </p>
            <ProofUpload activeMilestone={pendingMilestone} />
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" /> NGO Profile
            </h2>
            <NGOProfile address={address} />
          </div>
        )}
      </Card>
    </div>
  );
}
