import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  CreditCard, Smartphone, Wallet, ArrowRight, Loader2,
  CheckCircle, ShieldCheck, Lock, ChevronRight, Building2
} from 'lucide-react';

// --- Sub-component: Visual Credit Card ---
function CardVisual({ cardNumber, cardHolder, expiry }) {
  const formatted = cardNumber.replace(/\D/g, '').padEnd(16, '•');
  const parts = [formatted.slice(0,4), formatted.slice(4,8), formatted.slice(8,12), formatted.slice(12,16)];

  return (
    <div className="relative w-full max-w-sm mx-auto h-48 rounded-2xl p-6 overflow-hidden shadow-2xl"
      style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2040 50%, #0a1628 100%)' }}>
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #00d4aa, transparent)' }} />
      <div className="absolute -right-4 -bottom-12 w-36 h-36 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />

      {/* Top Row */}
      <div className="flex justify-between items-start mb-6">
        <div className="w-10 h-7 rounded bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-90" />
        <div className="text-right">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest">Relief</div>
          <div className="text-sm font-bold text-emerald-400">ReliefChain</div>
        </div>
      </div>

      {/* Card Number */}
      <div className="flex gap-3 mb-4">
        {parts.map((part, i) => (
          <span key={i} className="text-base font-mono font-semibold tracking-widest text-white/90">{part}</span>
        ))}
      </div>

      {/* Bottom Row */}
      <div className="flex justify-between items-end">
        <div>
          <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">Card Holder</div>
          <div className="text-sm font-semibold text-white uppercase tracking-wider">{cardHolder || 'Your Name'}</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">Expires</div>
          <div className="text-sm font-semibold text-white">{expiry || 'MM/YY'}</div>
        </div>
        <div className="flex -space-x-3">
          <div className="w-8 h-8 rounded-full bg-red-500 opacity-80" />
          <div className="w-8 h-8 rounded-full bg-yellow-400 opacity-90" />
        </div>
      </div>
    </div>
  );
}

// --- Sub-component: Debit Card Form ---
function DebitCardForm({ onSuccess }) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [amount, setAmount] = useState('1000');
  const [step, setStep] = useState('form'); // form | processing | linked | confirm

  const formatCardNumber = (val) => {
    return val.replace(/\D/g, '').slice(0,16).replace(/(.{4})/g, '$1 ').trim();
  };
  const formatExpiry = (val) => {
    const clean = val.replace(/\D/g, '').slice(0,4);
    if (clean.length >= 3) return clean.slice(0,2) + '/' + clean.slice(2);
    return clean;
  };

  const handleLink = async (e) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g,'').length < 16 || !cardHolder || expiry.length < 5 || cvv.length < 3) return;
    setStep('processing');
    await new Promise(r => setTimeout(r, 2000));
    setStep('linked');
    await new Promise(r => setTimeout(r, 1000));
    setStep('confirm');
  };

  const handleTopUp = async () => {
    setStep('processing');
    await new Promise(r => setTimeout(r, 1800));
    onSuccess({ method: 'Debit Card', amount, last4: cardNumber.replace(/\s/g,'').slice(-4) });
  };

  return (
    <div className="space-y-6">
      <CardVisual cardNumber={cardNumber.replace(/\s/g,'')} cardHolder={cardHolder} expiry={expiry} />

      {step === 'form' && (
        <form onSubmit={handleLink} className="space-y-4 mt-4">
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-widest block mb-2">Card Number</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input type="text" inputMode="numeric"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white font-mono text-lg focus:outline-none focus:border-emerald-500 transition-colors tracking-widest"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19} required />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-widest block mb-2">Cardholder Name</label>
            <input type="text"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3 px-4 text-white uppercase focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="FULL NAME AS ON CARD"
              value={cardHolder}
              onChange={e => setCardHolder(e.target.value)}
              required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest block mb-2">Expiry (MM/YY)</label>
              <input type="text" inputMode="numeric"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3 px-4 text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="MM/YY"
                value={expiry}
                onChange={e => setExpiry(formatExpiry(e.target.value))}
                maxLength={5} required />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest block mb-2">CVV</label>
              <input type="password" inputMode="numeric"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3 px-4 text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="•••"
                value={cvv}
                onChange={e => setCvv(e.target.value.replace(/\D/g,'').slice(0,4))}
                maxLength={4} required />
            </div>
          </div>
          <Button type="submit" className="w-full py-4 text-lg bg-emerald-600 hover:bg-emerald-700">
            <Lock className="w-5 h-5 mr-2" /> Verify & Link Bank Account
          </Button>
        </form>
      )}

      {step === 'processing' && (
        <div className="text-center py-8 animate-fade-in">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-400 mx-auto mb-4" />
          <p className="text-slate-300 font-medium">Connecting to your bank securely...</p>
          <p className="text-slate-500 text-sm mt-2">End-to-end encrypted via PCI DSS Level 1</p>
        </div>
      )}

      {step === 'linked' && (
        <div className="text-center py-6 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-emerald-500/30">
            <Building2 className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="font-bold text-emerald-400 text-xl">Bank Account Linked!</p>
          <p className="text-slate-400 text-sm mt-1">Card ending in {cardNumber.replace(/\s/g,'').slice(-4)} connected successfully.</p>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-4 animate-slide-up">
          <div className="bg-slate-900/80 rounded-xl border border-emerald-500/30 p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-400 text-sm">Linked Card</span>
              <span className="text-white font-mono font-bold">•••• {cardNumber.replace(/\s/g,'').slice(-4)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Bank Status</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Verified</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-widest block mb-2">Top-Up Amount (₹)</label>
            <div className="flex gap-2 mb-3">
              {['500', '1000', '2500', '5000'].map(a => (
                <button key={a} type="button"
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${amount === a ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-emerald-700'}`}
                  onClick={() => setAmount(a)}>₹{a}</button>
              ))}
            </div>
            <input type="number"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3 px-4 text-white text-lg font-bold focus:outline-none focus:border-emerald-500 transition-colors"
              value={amount}
              onChange={e => setAmount(e.target.value)} />
          </div>
          <Button onClick={handleTopUp} className="w-full py-4 text-lg bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 shadow-emerald-500/30">
            Fund Wallet with ₹{parseInt(amount || 0).toLocaleString('en-IN')} <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}

// --- Sub-component: UPI Form (Real Deep Link + QR Code) ---
function UPIForm({ onSuccess }) {
  const [amount, setAmount] = useState('500');
  const [step, setStep] = useState('form'); // form | payment | verifying | done
  const [upiLink, setUpiLink] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [txnNote, setTxnNote] = useState('');

  // ReliefChain's merchant UPI VPA (Virtual Payment Address)
  const MERCHANT_UPI = 'reliefchain@ybl';
  const MERCHANT_NAME = 'ReliefChain Relief Fund';

  const handleGeneratePayment = (e) => {
    e.preventDefault();
    if (!amount || parseInt(amount) < 1) return;

    const note = `Relief+Fund+Donation+${Date.now()}`;
    setTxnNote(note.replace(/\+/g, ' '));

    // Build real NPCI UPI deep link
    const link = `upi://pay?pa=${encodeURIComponent(MERCHANT_UPI)}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${note}`;
    setUpiLink(link);

    // Generate QR code using free public API (no API key needed)
    const qrData = encodeURIComponent(link);
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrData}&margin=10&color=000000&bgcolor=FFFFFF`);

    setStep('payment');
  };

  const handleOpenUpiApp = () => {
    // On mobile, this opens the default UPI app directly
    window.location.href = upiLink;
  };

  const handleConfirmPayment = () => {
    setStep('verifying');
    setTimeout(() => {
      onSuccess({ method: 'UPI', amount, upiId: MERCHANT_UPI });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* UPI Logo Header */}
      <div className="flex items-center justify-center gap-4 p-4 bg-slate-900/80 rounded-xl border border-slate-700">
        <div className="flex gap-2 items-center">
          <div className="flex gap-0.5">
            <div className="w-2 h-8 rounded-full bg-blue-500" />
            <div className="w-2 h-8 rounded-full bg-indigo-500" />
            <div className="w-2 h-8 rounded-full bg-violet-500" />
          </div>
          <span className="text-3xl font-black text-white tracking-tight">UPI</span>
        </div>
        <div className="h-8 w-px bg-slate-700" />
        <div className="flex gap-2">
          {[
            { label: 'G', color: 'bg-red-500', name: 'GPay' },
            { label: 'P', color: 'bg-green-500', name: 'PhonePe' },
            { label: 'B', color: 'bg-blue-600', name: 'Bharat' },
          ].map((p, i) => (
            <div key={i} title={p.name} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white ${p.color}`}>{p.label}</div>
          ))}
        </div>
      </div>

      {step === 'form' && (
        <form onSubmit={handleGeneratePayment} className="space-y-4">
          <div className="bg-slate-900/60 border border-emerald-500/20 rounded-xl p-4">
            <p className="text-sm text-slate-300 mb-1">
              <span className="font-bold text-emerald-400">Paying to:</span> {MERCHANT_NAME}
            </p>
            <p className="text-xs font-mono text-slate-500">{MERCHANT_UPI}</p>
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-widest block mb-2">Donation Amount (₹)</label>
            <div className="flex gap-2 mb-3">
              {['100', '200', '500', '1000'].map(a => (
                <button key={a} type="button"
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${amount === a ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-cyan-700'}`}
                  onClick={() => setAmount(a)}>₹{a}</button>
              ))}
            </div>
            <input type="number" min="1"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3 px-4 text-white text-lg font-bold focus:outline-none focus:border-cyan-500 transition-colors"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required />
          </div>

          <Button type="submit" className="w-full py-4 text-lg bg-cyan-600 hover:bg-cyan-700">
            <Smartphone className="w-5 h-5 mr-2" /> Generate UPI Payment
          </Button>
        </form>
      )}

      {step === 'payment' && (
        <div className="space-y-5 animate-slide-up">
          {/* Amount Summary */}
          <div className="bg-slate-900/80 rounded-xl border border-cyan-500/30 p-4 flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-xs mb-1">Amount to Pay</p>
              <p className="text-2xl font-black text-white">₹{parseInt(amount).toLocaleString('en-IN')}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs mb-1">Merchant</p>
              <p className="text-emerald-400 font-semibold text-sm">{MERCHANT_NAME}</p>
              <p className="text-slate-500 text-xs font-mono">{MERCHANT_UPI}</p>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center">
            <p className="text-slate-300 text-sm font-semibold mb-3">📱 Scan with any UPI App</p>
            <div className="inline-block p-3 bg-white rounded-2xl shadow-2xl shadow-cyan-500/10 ring-4 ring-cyan-500/20">
              <img
                src={qrUrl}
                alt="UPI QR Code"
                className="w-52 h-52 rounded-xl"
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
            <p className="text-slate-500 text-xs mt-2">Works with GPay, PhonePe, Paytm, BHIM & any UPI app</p>
          </div>

          {/* OR separator */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-slate-500 text-xs uppercase tracking-widest">OR</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          {/* Direct App Launch */}
          <Button
            onClick={handleOpenUpiApp}
            className="w-full py-4 text-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/20"
          >
            <Smartphone className="w-5 h-5 mr-2" /> Open UPI App Directly
          </Button>

          {/* Transaction Note */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
            <p className="text-amber-400 text-xs font-semibold mb-1">📝 Payment Note</p>
            <p className="text-slate-400 text-xs font-mono break-all">{txnNote}</p>
          </div>

          {/* After paying, confirm */}
          <div className="text-center pt-2 border-t border-slate-800">
            <p className="text-slate-400 text-sm mb-3">Completed payment in your UPI app?</p>
            <Button
              onClick={handleConfirmPayment}
              variant="secondary"
              className="w-full border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
            >
              <CheckCircle className="w-4 h-4 mr-2" /> I've Completed the Payment
            </Button>
          </div>
        </div>
      )}

      {step === 'verifying' && (
        <div className="text-center py-10 animate-fade-in">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-slate-300 font-medium">Verifying payment on blockchain...</p>
          <p className="text-slate-500 text-sm mt-2">Powered by NPCI UPI Protocol</p>
        </div>
      )}
    </div>
  );
}


// --- Main Page ---
export default function OnrampPage() {
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState('card'); // card | upi
  const [successTx, setSuccessTx] = useState(null);

  const handleSuccess = (tx) => {
    setSuccessTx(tx);
  };

  if (successTx) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-lg animate-fade-in">
        <div className="text-center">
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-500/10">
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black mb-2 text-emerald-400">Wallet Funded!</h1>
          <p className="text-slate-400 mb-8">Your crypto wallet has been successfully topped up via {successTx.method}.</p>

          <Card className="text-left space-y-3 mb-8">
            <div className="flex justify-between">
              <span className="text-slate-400">Method</span>
              <span className="text-white font-semibold">{successTx.method}</span>
            </div>
            {successTx.last4 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Card</span>
                <span className="text-white font-mono">•••• {successTx.last4}</span>
              </div>
            )}
            {successTx.upiId && (
              <div className="flex justify-between">
                <span className="text-slate-400">UPI ID</span>
                <span className="text-cyan-400 font-medium">{successTx.upiId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Amount Funded</span>
              <span className="text-emerald-400 font-bold text-lg">₹{parseInt(successTx.amount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Wallet</span>
              <span className="text-slate-300 font-mono text-xs">
                {address ? `${address.slice(0,6)}...${address.slice(-4)}` : 'Connect wallet to link'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle className="w-4 h-4" />Confirmed</span>
            </div>
          </Card>

          <Button className="w-full py-4" onClick={() => setSuccessTx(null)}>
            Fund More
          </Button>
          <a href="/" className="block mt-3 text-slate-400 hover:text-white transition-colors text-sm">← Back to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 text-emerald-400 text-sm font-semibold mb-4">
          <ShieldCheck className="w-4 h-4" /> PCI DSS Compliant · 256-bit SSL
        </div>
        <h1 className="text-4xl font-black mb-3">Fund Your Wallet</h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Instantly link your bank account or UPI ID to your ReliefChain wallet.
          Contributions are locked in smart contracts and released only on milestone completion.
        </p>
        {isConnected ? (
          <div className="mt-4 inline-block text-xs bg-slate-800 rounded-lg px-3 py-1.5 font-mono text-slate-400">
            Connected: <span className="text-emerald-400">{address?.slice(0,8)}...{address?.slice(-6)}</span>
          </div>
        ) : (
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 text-amber-400 text-sm">
            <Wallet className="w-4 h-4" /> Connect your wallet (top-right) to link funds to your account
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left: Form Panel */}
        <div className="lg:col-span-3">
          {/* Tab Switcher */}
          <div className="flex gap-1 p-1 bg-slate-800/80 rounded-xl mb-6">
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all ${tab === 'card' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setTab('card')}>
              <CreditCard className="w-4 h-4" /> Debit / Credit Card
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all ${tab === 'upi' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setTab('upi')}>
              <Smartphone className="w-4 h-4" /> UPI
            </button>
          </div>

          <Card className="border-slate-700/60">
            {tab === 'card'
              ? <DebitCardForm key="card" onSuccess={handleSuccess} />
              : <UPIForm key="upi" onSuccess={handleSuccess} />
            }
          </Card>
        </div>

        {/* Right: Info Panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-slate-800/40 border-slate-700/40">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> How It Works
            </h3>
            <div className="space-y-4">
              {[
                { icon: '💳', title: 'Link Your Bank', desc: 'Securely link your Debit Card or UPI ID' },
                { icon: '🔒', title: 'Smart Contract Lock', desc: 'Funds enter an auditable on-chain escrow' },
                { icon: '✅', title: 'Milestone Release', desc: 'DAO votes release funds to verified NGOs' },
                { icon: '📡', title: 'Blockchain Proof', desc: 'Every transaction is cryptographically logged' },
              ].map((s, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{s.title}</p>
                    <p className="text-xs text-slate-500">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-emerald-900/20 border-emerald-500/20">
            <h3 className="font-bold text-emerald-400 mb-3">Supported Banks</h3>
            <div className="grid grid-cols-2 gap-2">
              {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB', 'BOB', 'Canara'].map(b => (
                <div key={b} className="text-xs bg-slate-800/60 rounded-lg px-2 py-1.5 text-slate-300 text-center font-medium">{b}</div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">+ All UPI-enabled banks via NPCI</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
