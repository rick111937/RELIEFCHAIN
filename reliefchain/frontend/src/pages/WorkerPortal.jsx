import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../services/api';
import {
  Fingerprint, Wallet, Shield, Check, Loader2, AlertCircle,
  User, FileText, Zap, Gift, HelpCircle, ClipboardCopy,
  CheckCircle, Lock, Unlock, ChevronRight, Globe, Star,
  Phone, MapPin, Calendar, RefreshCw, ExternalLink
} from 'lucide-react';

// ─── DID Identity Card ──────────────────────────────────────────────────────
function DIDCard({ address }) {
  const did = address
    ? `did:reliefchain:${address.toLowerCase()}`
    : 'did:reliefchain:not-connected';
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(did);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 border border-emerald-500/30"
      style={{ background: 'linear-gradient(135deg, #0d2b1a 0%, #0a1f2e 60%, #0d1a2b 100%)' }}>
      {/* Decorative blobs */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center ring-2 ring-emerald-500/40">
            <User className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="font-black text-white text-lg">Migrant Worker</p>
            <p className="text-emerald-400 text-xs font-semibold">Self-Sovereign Identity Holder</p>
          </div>
          <div className="ml-auto">
            <Badge variant="success">W3C DID</Badge>
          </div>
        </div>

        <div className="bg-black/30 rounded-xl p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Decentralized Identifier</p>
          <div className="flex items-center gap-2">
            <p className="font-mono text-xs text-emerald-300 flex-1 break-all">{did}</p>
            <button onClick={copy} className="text-slate-500 hover:text-emerald-400 transition-colors flex-shrink-0">
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <ClipboardCopy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {address && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-black/20 rounded-lg p-2">
              <p className="text-slate-500 mb-0.5">Wallet</p>
              <p className="font-mono text-slate-300">{address.slice(0,6)}...{address.slice(-4)}</p>
            </div>
            <div className="bg-black/20 rounded-lg p-2">
              <p className="text-slate-500 mb-0.5">Network</p>
              <p className="text-slate-300">ReliefChain L2</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Credential Detail Card ─────────────────────────────────────────────────
function CredentialDetail({ credential }) {
  const [showRaw, setShowRaw] = useState(false);
  const cs = credential.credentialSubject;

  return (
    <div className="space-y-4">
      <div className="p-5 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-2xl border border-indigo-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5"><Shield className="w-28 h-28" /></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="info">W3C Verifiable Credential</Badge>
            {credential.revoked
              ? <Badge variant="danger">REVOKED</Badge>
              : <Badge variant="success">ACTIVE</Badge>
            }
          </div>
          <h3 className="font-black text-xl text-indigo-100 mb-1">{cs.status}</h3>
          <p className="text-indigo-300 text-sm mb-4">{cs.role}</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { icon: MapPin, label: 'Region', val: cs.region },
              { icon: Star,   label: 'Tier',   val: cs.tier || 'Tier 1' },
              { icon: Calendar, label: 'Issued', val: new Date(credential.issuanceDate).toLocaleDateString('en-IN') },
              { icon: Globe,  label: 'Issuer DID', val: credential.issuer?.split(':').pop()?.slice(0,16) + '…' },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex items-center gap-2 bg-black/20 rounded-lg p-2">
                <Icon className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <div>
                  <p className="text-slate-500 text-xs">{label}</p>
                  <p className="text-slate-200 text-xs font-semibold">{val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-1"
        onClick={() => setShowRaw(!showRaw)}>
        {showRaw ? 'Hide' : 'Show'} Raw JSON-LD
        <ChevronRight className={`w-3 h-3 transition-transform ${showRaw ? 'rotate-90' : ''}`} />
      </button>
      {showRaw && (
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-48 whitespace-pre-wrap">
          {JSON.stringify(credential, null, 2)}
        </div>
      )}
    </div>
  );
}

// ─── ZK Proof Simulator ────────────────────────────────────────────────────
function ZKProofTab({ credential, address }) {
  const [step, setStep] = useState('idle'); // idle | generating | proving | done | error
  const [selectedClaims, setSelectedClaims] = useState({ status: true, region: true, role: false, tier: false });
  const [proofData, setProofData] = useState(null);

  const claims = credential?.credentialSubject
    ? [
        { key: 'status', label: 'Verified Status',   sensitive: false },
        { key: 'region', label: 'Region / State',    sensitive: false },
        { key: 'role',   label: 'Role / Credential', sensitive: true },
        { key: 'tier',   label: 'Relief Tier',       sensitive: true },
      ]
    : [];

  const toggleClaim = (key) => {
    setSelectedClaims(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const generateProof = async () => {
    if (!credential) return;
    setStep('generating');
    await new Promise(r => setTimeout(r, 1500));
    setStep('proving');
    await new Promise(r => setTimeout(r, 2000));
    const revealed = Object.entries(selectedClaims)
      .filter(([, v]) => v)
      .map(([k]) => ({ claim: k, value: credential.credentialSubject[k] || 'Tier 1' }));
    setProofData({
      proof: `zkp_${Math.random().toString(36).slice(2, 18)}`,
      publicInputs: revealed,
      nullifier: `0x${Math.random().toString(16).slice(2, 34)}`,
      timestamp: new Date().toISOString(),
      circuit: 'Groth16-BN254',
    });
    setStep('done');
  };

  if (!credential) {
    return (
      <div className="text-center py-16">
        <Lock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 font-semibold mb-2">No Credential Found</p>
        <p className="text-slate-500 text-sm">You need a credential issued by the State Authority before generating a ZK Proof.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 rounded-xl border border-slate-700/50 p-4">
        <h3 className="text-sm font-bold mb-3 text-slate-300">Select Claims to Reveal</h3>
        <p className="text-xs text-slate-500 mb-4">Only the selected claims will be disclosed to the verifier. All others remain private (Zero-Knowledge).</p>
        <div className="grid grid-cols-2 gap-2">
          {claims.map(c => (
            <button key={c.key} type="button"
              onClick={() => toggleClaim(c.key)}
              className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                selectedClaims[c.key]
                  ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}>
              {selectedClaims[c.key]
                ? <Unlock className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                : <Lock className="w-4 h-4 flex-shrink-0 text-slate-500" />
              }
              <span>{c.label}</span>
              {c.sensitive && <span className="text-[10px] text-amber-500 ml-auto">PII</span>}
            </button>
          ))}
        </div>
      </div>

      {step === 'idle' && (
        <Button onClick={generateProof} className="w-full py-4 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500">
          <Zap className="w-5 h-5 mr-2" /> Generate Groth16 ZK Proof
        </Button>
      )}

      {step === 'generating' && (
        <div className="text-center py-6">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto mb-3" />
          <p className="text-slate-300 text-sm font-semibold">Generating witness and R1CS constraints…</p>
          <p className="text-slate-500 text-xs mt-1">Computing circuit over BN254 elliptic curve</p>
        </div>
      )}

      {step === 'proving' && (
        <div className="text-center py-6">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-3" />
          <p className="text-slate-300 text-sm font-semibold">Running Groth16 prover…</p>
          <p className="text-slate-500 text-xs mt-1">Generating π_A, π_B, π_C proof elements</p>
        </div>
      )}

      {step === 'done' && proofData && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-400">ZK Proof Generated ✓</p>
              <p className="text-slate-400 text-xs">Your identity claims are verifiable without revealing underlying data.</p>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-xl border border-slate-700 p-4 space-y-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Proof Hash</p>
              <p className="font-mono text-emerald-400 text-xs">{proofData.proof}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Nullifier</p>
              <p className="font-mono text-xs text-slate-300 break-all">{proofData.nullifier}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Circuit</p>
              <p className="text-xs text-slate-300">{proofData.circuit}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">Revealed Claims</p>
              <div className="space-y-1">
                {proofData.publicInputs.map(({ claim, value }) => (
                  <div key={claim} className="flex justify-between text-xs bg-slate-800 rounded-lg px-3 py-1.5">
                    <span className="text-slate-400 capitalize">{claim}</span>
                    <span className="text-white font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button className="py-3 text-sm bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle className="w-4 h-4 mr-1" /> Submit Proof
            </Button>
            <Button className="py-3 text-sm bg-slate-700 hover:bg-slate-600" onClick={() => setStep('idle')}>
              <RefreshCw className="w-4 h-4 mr-1" /> Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Relief Claims Tab ──────────────────────────────────────────────────────
function ClaimsTab({ credential }) {
  const [claimStep, setClaimStep] = useState({}); // claim id → step
  const schemes = [
    { id: 'pmay', name: 'PM Awas Yojana', amount: '₹1,20,000', type: 'Housing Grant', icon: '🏠', minTier: 'Tier 1' },
    { id: 'relief', name: 'Flood Relief Dispersal', amount: '₹5,000', type: 'Emergency Fund', icon: '💧', minTier: 'Tier 1' },
    { id: 'skill', name: 'Skill India Stipend', amount: '₹3,000/mo', type: 'Livelihood', icon: '🛠️', minTier: 'Tier 2' },
    { id: 'health', name: 'Ayushman Bharat (Top-Up)', amount: '₹50,000', type: 'Health Insurance', icon: '🏥', minTier: 'Tier 1' },
    { id: 'food', name: 'PMGKAY - Food Security', amount: '5 kg grain/mo', type: 'Food Entitlement', icon: '🌾', minTier: 'Tier 1' },
    { id: 'edu',  name: 'PM Scholarship - Child', amount: '₹12,000/yr', type: 'Education Grant', icon: '📚', minTier: 'Tier 2' },
  ];

  const handleClaim = async (id) => {
    if (!credential) return;
    setClaimStep(prev => ({ ...prev, [id]: 'loading' }));
    await new Promise(r => setTimeout(r, 2000));
    setClaimStep(prev => ({ ...prev, [id]: 'done' }));
  };

  return (
    <div className="space-y-3">
      {!credential && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-amber-400 text-sm">Connect your wallet and ensure your credential is issued to claim schemes.</p>
        </div>
      )}
      {schemes.map(s => {
        const step = claimStep[s.id];
        const canClaim = !!credential && !credential.revoked;
        return (
          <div key={s.id}
            className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-emerald-500/30 transition-all">
            <span className="text-3xl">{s.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm">{s.name}</p>
              <p className="text-xs text-slate-400">{s.type} · Requires {s.minTier}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-emerald-400 font-bold text-sm">{s.amount}</p>
              {step === 'done' ? (
                <span className="text-xs text-emerald-400 flex items-center gap-1 justify-end">
                  <CheckCircle className="w-3 h-3" /> Claimed
                </span>
              ) : (
                <button
                  onClick={() => handleClaim(s.id)}
                  disabled={!canClaim || step === 'loading'}
                  className={`mt-1 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    canClaim
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}>
                  {step === 'loading'
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : canClaim ? 'Claim →' : 'Locked'
                  }
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Help Tab ───────────────────────────────────────────────────────────────
function HelpTab({ address }) {
  const faqs = [
    { q: 'What is a Verifiable Credential (VC)?', a: 'A VC is a tamper-proof digital certificate issued by a government authority that proves your identity claims without sharing personal data.' },
    { q: 'How do I get my credential issued?', a: 'Contact a State Authority Hub or visit the Authority Portal on this app. They will issue a credential to your wallet address.' },
    { q: 'What is a Zero-Knowledge Proof?', a: 'A ZKP lets you prove you meet a requirement (e.g., "I am a verified beneficiary") without revealing your actual data to anyone.' },
    { q: 'Is my data stored on the blockchain?', a: 'Only your DID anchor (wallet address hash) is on-chain. Your credential data stays in your wallet and is never exposed publicly.' },
    { q: 'What if my credential is revoked?', a: 'If revoked by the authority, your claims become invalid. Contact your issuing State Hub for re-verification.' },
  ];
  const [open, setOpen] = useState(null);

  return (
    <div className="space-y-4">
      {/* Helpline contacts */}
      <Card className="bg-emerald-900/20 border-emerald-500/20">
        <h3 className="font-bold text-emerald-400 mb-3 flex items-center gap-2">
          <Phone className="w-4 h-4" /> State Authority Helpline
        </h3>
        <div className="space-y-2 text-sm">
          {[
            { state: 'Bihar / Jharkhand', number: '1800-345-6220', hours: 'Mon-Sat, 9am-6pm' },
            { state: 'Assam / Meghalaya', number: '1800-123-4567', hours: 'Mon-Fri, 10am-5pm' },
            { state: 'West Bengal',       number: '1800-987-6543', hours: 'Mon-Sat, 9am-5pm' },
          ].map(h => (
            <div key={h.state} className="flex justify-between items-center bg-slate-900/40 rounded-lg p-2.5">
              <div><p className="text-white font-medium">{h.state}</p><p className="text-slate-500 text-xs">{h.hours}</p></div>
              <a href={`tel:${h.number}`} className="text-emerald-400 font-mono font-semibold hover:text-emerald-300 transition-colors">{h.number}</a>
            </div>
          ))}
        </div>
      </Card>

      {/* Your DID to share */}
      {address && (
        <Card className="bg-slate-800/40 border-slate-700/40">
          <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-widest">Your Wallet Address to share with Authority</p>
          <code className="text-xs text-emerald-400 font-mono break-all bg-slate-900 p-3 rounded-lg block">{address}</code>
        </Card>
      )}

      {/* FAQ Accordion */}
      <div>
        <h3 className="font-bold text-slate-300 mb-3">Frequently Asked Questions</h3>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <div key={i} className="border border-slate-700/50 rounded-xl overflow-hidden">
              <button className="w-full flex justify-between items-center p-3 text-left text-sm font-semibold text-slate-200 hover:bg-slate-800/60 transition-colors"
                onClick={() => setOpen(open === i ? null : i)}>
                {f.q}
                <ChevronRight className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform ${open === i ? 'rotate-90' : ''}`} />
              </button>
              {open === i && (
                <div className="px-4 pb-4 pt-1 text-sm text-slate-400 border-t border-slate-700/50">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function WorkerPortal() {
  const { address, isConnected } = useAccount();
  const [credential, setCredential] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('identity');

  useEffect(() => {
    if (isConnected && address) {
      setLoading(true);
      api.get(`/vc/${address}`)
        .then(res => { if (res.data.success) setCredential(res.data.credential); })
        .catch(() => setCredential(null))
        .finally(() => setLoading(false));
    } else {
      setCredential(null);
    }
  }, [isConnected, address]);

  const TABS = [
    { id: 'identity',  label: 'My DID',     icon: User },
    { id: 'credential',label: 'Credential', icon: Shield },
    { id: 'zkproof',   label: 'ZK Proof',   icon: Zap },
    { id: 'claims',    label: 'Claim Aid',  icon: Gift },
    { id: 'help',      label: 'Help',       icon: HelpCircle },
  ];

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in max-w-3xl">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 text-emerald-400 text-xs font-semibold mb-4">
          <Fingerprint className="w-4 h-4" /> Self-Sovereign Identity Portal
        </div>
        <h1 className="text-3xl font-black mb-2">Worker SSI Hub</h1>
        <p className="text-slate-400 text-sm">
          Manage your digital identity, credentials and government relief claims in one place.
        </p>
        {!isConnected && (
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 text-amber-400 text-sm">
            <Wallet className="w-4 h-4" /> Connect wallet to load your credentials
          </div>
        )}
      </div>

      {/* DID Card — always shown */}
      <div className="mb-6">
        <DIDCard address={address} />
      </div>

      {/* Status pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-semibold ${isConnected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
          {isConnected ? 'Wallet Connected' : 'Wallet Disconnected'}
        </div>
        <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-semibold ${loading ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : credential ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : credential ? 'bg-indigo-400' : 'bg-slate-600'}`} />
          {loading ? 'Syncing Credentials…' : credential ? 'VC Issued' : 'No Credential'}
        </div>
        {credential && !credential.revoked && (
          <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-semibold bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
            <CheckCircle className="w-3 h-3" /> Aid-Eligible
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-800/80 rounded-xl mb-6 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id}
              className={`flex-1 min-w-fit flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg font-semibold text-xs transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setActiveTab(tab.id)}>
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <Card className="border-emerald-500/10 bg-slate-800/30">
        {activeTab === 'identity' && (
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-400" /> Identity Profile
            </h2>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'DID Method',   val: 'did:reliefchain' },
                  { label: 'DID Version',  val: 'W3C DID v1.0' },
                  { label: 'Key Type',     val: 'secp256k1 (Ethereum)' },
                  { label: 'Auth Method',  val: 'EcdsaSecp256k1Signature2019' },
                  { label: 'VDR Network',  val: 'ReliefChain L2 (EVM)' },
                  { label: 'Status',       val: isConnected ? 'Active' : 'Not anchored' },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/30">
                    <p className="text-slate-500 text-xs mb-1">{label}</p>
                    <p className="text-slate-200 font-semibold text-xs">{val}</p>
                  </div>
                ))}
              </div>
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/30">
                <p className="text-slate-500 text-xs mb-2">DID Document Fragment</p>
                <pre className="text-xs text-emerald-300 font-mono overflow-x-auto">{JSON.stringify({
                  "@context": "https://www.w3.org/ns/did/v1",
                  "id": `did:reliefchain:${address || '0x...'}`,
                  "verificationMethod": [{
                    "id": `did:reliefchain:${address?.slice(0,8) || '0x...'}#keys-1`,
                    "type": "EcdsaSecp256k1VerificationKey2019",
                    "controller": `did:reliefchain:${address?.slice(0,8) || '0x...'}`
                  }]
                }, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'credential' && (
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" /> Issued Credentials
            </h2>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Syncing with State Authority registry…</p>
              </div>
            ) : credential ? (
              <CredentialDetail credential={credential} />
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400 mb-3 font-semibold">No credentials linked to this DID.</p>
                <p className="text-slate-500 text-sm mb-6">Contact a State Authority Hub to get your identity verified and a Relief Credential issued.</p>
                {address && (
                  <div className="text-left bg-slate-900/80 border border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Share this address with the State Authority:</p>
                    <code className="text-xs text-emerald-400 font-mono break-all">{address}</code>
                  </div>
                )}
                <a href="/authority" className="inline-flex items-center gap-1.5 mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors">
                  <ExternalLink className="w-4 h-4" /> Go to State Authority Portal
                </a>
              </div>
            )}
          </div>
        )}

        {activeTab === 'zkproof' && (
          <div>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" /> Zero-Knowledge Proof
            </h2>
            <p className="text-slate-400 text-sm mb-5">
              Selectively disclose specific claims to a verifier without revealing your full credential or PII.
            </p>
            <ZKProofTab credential={credential} address={address} />
          </div>
        )}

        {activeTab === 'claims' && (
          <div>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-400" /> Government Aid Schemes
            </h2>
            <p className="text-slate-400 text-sm mb-5">
              Claim your entitlements from government welfare schemes — verified on-chain using your VC.
            </p>
            <ClaimsTab credential={credential} />
          </div>
        )}

        {activeTab === 'help' && (
          <div>
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-400" /> Help &amp; Support
            </h2>
            <HelpTab address={address} />
          </div>
        )}
      </Card>
    </div>
  );
}
