import React, { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../services/api';
import {
  ShieldAlert, Fingerprint, Loader2, CheckCircle, Search,
  Users, FileCheck, AlertTriangle, Trash2, RefreshCw,
  ChevronDown, ChevronUp, ClipboardCopy, UserPlus
} from 'lucide-react';

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = 'text-indigo-400' }) {
  return (
    <Card className="bg-slate-800/50 border-slate-700/40 flex items-center gap-4 py-4">
      <div className={`p-3 rounded-xl bg-slate-900/80 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-black text-white">{value}</p>
        <p className="text-xs text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </Card>
  );
}

// ─── Issuance Form ─────────────────────────────────────────────────────────
function IssueForm({ onIssued }) {
  const [workerInput, setWorkerInput] = useState('');
  const [credentialRole, setCredentialRole] = useState('Disaster Relief Beneficiary - Tier 1');
  const [region, setRegion] = useState('Bihar / Jharkhand');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const roles = [
    'Disaster Relief Beneficiary - Tier 1',
    'Disaster Relief Beneficiary - Tier 2',
    'Verified Vocational Skill - Construction',
    'Verified Vocational Skill - Agriculture',
    'Registered Migrant Worker - Bihar',
    'Registered Migrant Worker - Assam',
    'Emergency Medical Aid Recipient',
    'Flood Rehabilitation Beneficiary',
  ];

  const regions = ['Bihar / Jharkhand', 'Assam / Meghalaya', 'West Bengal', 'Odisha', 'Uttar Pradesh', 'Telangana'];

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!workerInput) return;
    setLoading(true); setError('');
    try {
      const res = await api.post('/vc/issue', { workerAddress: workerInput, role: credentialRole, region });
      if (res.data.success) {
        onIssued(res.data.credential);
        setWorkerInput('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Issuance failed. Check console.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleIssue} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Beneficiary Wallet Address / DID
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono text-sm"
            placeholder="0x..."
            value={workerInput}
            onChange={e => setWorkerInput(e.target.value)}
            required
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">Public key address anchoring the worker's DID document.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Credential Type / Claim</label>
        <select
          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          value={credentialRole}
          onChange={e => setCredentialRole(e.target.value)}
        >
          {roles.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Issuing Region / State</label>
        <select
          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          value={region}
          onChange={e => setRegion(e.target.value)}
        >
          {regions.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full py-4 text-base bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
        disabled={loading || !workerInput}
      >
        {loading
          ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Signing on-chain...</>
          : <><Fingerprint className="w-5 h-5 mr-2" /> Cryptographically Sign &amp; Issue VC</>
        }
      </Button>
    </form>
  );
}

// ─── Worker Lookup ─────────────────────────────────────────────────────────
function WorkerLookup() {
  const [query, setQuery]   = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true); setResult(null); setNotFound(false);
    try {
      const res = await api.get(`/vc/${query}`);
      setResult(res.data.credential);
    } catch {
      setNotFound(true);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleLookup} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input type="text"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors font-mono"
            placeholder="0x... wallet address"
            value={query}
            onChange={e => setQuery(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lookup'}
        </Button>
      </form>

      {notFound && (
        <div className="text-center py-4 text-slate-500 text-sm">No credential found for this address.</div>
      )}
      {result && (
        <div className="bg-slate-900 rounded-xl border border-indigo-500/30 p-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-semibold text-sm">Credential Found</span>
            {result.revoked && <Badge variant="danger">REVOKED</Badge>}
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Role</span><span className="text-white">{result.credentialSubject?.role}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Region</span><span className="text-white">{result.credentialSubject?.region}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Issued</span><span className="text-slate-300">{new Date(result.issuanceDate).toLocaleDateString('en-IN')}</span></div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Credential ID</span>
              <span className="text-indigo-400 font-mono text-xs truncate max-w-[160px]">{result.id?.split('/').pop()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Credentials Registry Table ────────────────────────────────────────────
function Registry({ credentials, onRevoke, onRefresh, refreshing }) {
  const [expanded, setExpanded] = useState(null);
  const [copied, setCopied] = useState(null);

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  if (credentials.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <FileCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>No credentials issued yet this session.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {credentials.map((vc, i) => {
        const addr = vc.credentialSubject?.walletAddress || vc.credentialSubject?.id?.split(':').pop();
        const isExpanded = expanded === i;
        const isRevoked = vc.revoked;

        return (
          <div key={i}
            className={`rounded-xl border transition-all ${isRevoked ? 'border-red-500/20 bg-red-900/10 opacity-70' : 'border-slate-700/50 bg-slate-800/50'}`}>
            <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : i)}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white ${isRevoked ? 'bg-red-700' : 'bg-indigo-600'}`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-white truncate">{addr}</p>
                <p className="text-xs text-slate-500 truncate">{vc.credentialSubject?.role}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isRevoked
                  ? <Badge variant="danger">Revoked</Badge>
                  : <Badge variant="success">Active</Badge>
                }
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-slate-700/50 p-4 space-y-3 animate-slide-up">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-400 text-xs block">Region</span>{vc.credentialSubject?.region}</div>
                  <div><span className="text-slate-400 text-xs block">Tier</span>{vc.credentialSubject?.tier || 'Tier 1'}</div>
                  <div><span className="text-slate-400 text-xs block">Issued</span>{new Date(vc.issuanceDate).toLocaleString('en-IN')}</div>
                  <div><span className="text-slate-400 text-xs block">Proof Type</span>{vc.proof?.type}</div>
                </div>

                <div className="bg-slate-900/80 rounded-lg p-3 relative">
                  <p className="text-xs text-slate-500 mb-1">JWS Proof Signature</p>
                  <p className="font-mono text-xs text-indigo-300 break-all">{vc.proof?.jws}</p>
                  <button
                    className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors"
                    onClick={() => copy(vc.proof?.jws, `jws-${i}`)}>
                    {copied === `jws-${i}` ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardCopy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {!isRevoked && (
                  <Button
                    onClick={() => onRevoke(addr)}
                    className="w-full py-2 text-sm bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/40"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Revoke This Credential
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Bulk Issuance ─────────────────────────────────────────────────────────
function BulkIssue({ onBulkIssued }) {
  const [bulkInput, setBulkInput] = useState('');
  const [role, setRole] = useState('Flood Rehabilitation Beneficiary');
  const [region, setRegion] = useState('Assam / Meghalaya');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleBulk = async (e) => {
    e.preventDefault();
    const addresses = bulkInput.split('\n').map(a => a.trim()).filter(a => a.startsWith('0x') && a.length >= 10);
    if (addresses.length === 0) return;
    setLoading(true);
    const issued = [];
    for (const addr of addresses) {
      try {
        const res = await api.post('/vc/issue', { workerAddress: addr, role, region });
        if (res.data.success) issued.push(addr);
      } catch {}
    }
    setResults({ total: addresses.length, success: issued.length });
    onBulkIssued();
    setLoading(false);
  };

  const placeholder = `0xABC123...\n0xDEF456...\n0x789GHI...`;

  return (
    <form onSubmit={handleBulk} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Worker Addresses (one per line)</label>
        <textarea
          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none"
          placeholder={placeholder}
          value={bulkInput}
          onChange={e => setBulkInput(e.target.value)}
          rows={5}
          required
        />
        <p className="text-xs text-slate-500 mt-1">
          Each line = one worker address. Only valid 0x addresses will be processed.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Credential Type</label>
          <select className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-amber-500"
            value={role} onChange={e => setRole(e.target.value)}>
            <option>Flood Rehabilitation Beneficiary</option>
            <option>Disaster Relief Beneficiary - Tier 1</option>
            <option>Emergency Medical Aid Recipient</option>
            <option>Registered Migrant Worker - Assam</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Region</label>
          <select className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-amber-500"
            value={region} onChange={e => setRegion(e.target.value)}>
            <option>Assam / Meghalaya</option>
            <option>Bihar / Jharkhand</option>
            <option>West Bengal</option>
            <option>Odisha</option>
          </select>
        </div>
      </div>

      {results && (
        <div className={`flex items-center gap-2 text-sm p-3 rounded-xl border ${results.success === results.total ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          Issued {results.success} / {results.total} credentials successfully
        </div>
      )}

      <Button type="submit" className="w-full py-3 text-sm bg-amber-600 hover:bg-amber-700 shadow-amber-500/20" disabled={loading}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Issuing batch...</> : <><UserPlus className="w-4 h-4 mr-2" /> Issue Batch Credentials</>}
      </Button>
    </form>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function AuthorityDashboard() {
  const { address, isConnected } = useAccount();
  const [credentials, setCredentials]   = useState([]);
  const [refreshing, setRefreshing]     = useState(false);
  const [lastIssued, setLastIssued]     = useState(null);
  const [activeTab, setActiveTab]       = useState('issue'); // issue | lookup | registry | bulk

  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/vc/all');
      setCredentials(res.data.credentials || []);
    } catch { /* empty */ }
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleIssued = (vc) => {
    setLastIssued(vc);
    fetchAll();
    setTimeout(() => setActiveTab('registry'), 800);
  };

  const handleRevoke = async (addr) => {
    try {
      await api.delete(`/vc/revoke/${addr}`);
      fetchAll();
    } catch {}
  };

  const total   = credentials.length;
  const active  = credentials.filter(c => !c.revoked).length;
  const revoked = credentials.filter(c => c.revoked).length;

  const TABS = [
    { id: 'issue',    label: 'Issue VC',    icon: Fingerprint },
    { id: 'lookup',   label: 'Lookup',      icon: Search },
    { id: 'registry', label: `Registry (${total})`, icon: FileCheck },
    { id: 'bulk',     label: 'Bulk Issue',  icon: UserPlus },
  ];

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in max-w-5xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <ShieldAlert className="w-9 h-9 text-indigo-400" />
            <h1 className="text-3xl font-black text-indigo-400">Authority Issuance Node</h1>
          </div>
          {isConnected ? (
            <p className="text-slate-400 text-sm">
              W3C Verifiable Credential issuance for migrant worker SSI.
              Signed as: <span className="font-mono text-indigo-300">{address?.slice(0,6)}...{address?.slice(-4)}</span>
            </p>
          ) : (
            <div className="flex items-center gap-2 mt-1 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1.5 text-amber-400 text-xs w-fit">
              <ShieldAlert className="w-3.5 h-3.5" />
              Connect your wallet (top-right) to sign and issue credentials
            </div>
          )}
        </div>
        <button onClick={fetchAll}
          className={`flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors ${refreshing ? 'animate-spin text-indigo-400' : ''}`}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard icon={Users}     label="Total Issued" value={total}   color="text-indigo-400" />
        <StatCard icon={FileCheck} label="Active VCs"   value={active}  color="text-emerald-400" />
        <StatCard icon={AlertTriangle} label="Revoked" value={revoked}  color="text-red-400" />
      </div>

      {/* Last Issued Success Banner */}
      {lastIssued && (
        <div className="mb-6 flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 animate-slide-up">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-emerald-400 font-bold text-sm">Credential Anchored On-Chain ✓</p>
            <p className="text-slate-400 text-xs mt-0.5">Issued to <span className="font-mono text-white">{lastIssued.credentialSubject?.id}</span></p>
            <p className="text-slate-500 text-xs">Role: {lastIssued.credentialSubject?.role}</p>
          </div>
          <button onClick={() => setLastIssued(null)} className="ml-auto text-slate-600 hover:text-slate-400">✕</button>
        </div>
      )}

      {/* Tab Nav */}
      <div className="flex gap-1 p-1 bg-slate-800/80 rounded-xl mb-6">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setActiveTab(tab.id)}>
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <Card className="border-indigo-500/20 bg-slate-800/40">
        {activeTab === 'issue' && (
          <div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-indigo-400" /> Issue Verifiable Credential
            </h2>
            <IssueForm onIssued={handleIssued} />
          </div>
        )}

        {activeTab === 'lookup' && (
          <div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-400" /> Worker Credential Lookup
            </h2>
            <p className="text-slate-400 text-sm mb-4">Search by wallet address to see if a worker has an existing credential.</p>
            <WorkerLookup />
          </div>
        )}

        {activeTab === 'registry' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-400" /> Credentials Registry
              </h2>
              <span className="text-xs text-slate-500">{total} total · {active} active</span>
            </div>
            <Registry
              credentials={credentials}
              onRevoke={handleRevoke}
              onRefresh={fetchAll}
              refreshing={refreshing}
            />
          </div>
        )}

        {activeTab === 'bulk' && (
          <div>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-400" /> Bulk Credential Issuance
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Issue the same credential type to multiple workers at once. Paste one wallet address per line.
            </p>
            <BulkIssue onBulkIssued={fetchAll} />
          </div>
        )}
      </Card>
    </div>
  );
}
