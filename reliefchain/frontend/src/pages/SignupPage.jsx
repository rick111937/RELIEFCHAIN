import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import {
  Shield, Building2, Eye, EyeOff, ArrowRight, AlertCircle,
  Loader2, User, Mail, Lock, Globe, Phone, FileText, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/ui/GoogleSignInButton';

const ROLES = { ADMIN: 'admin', NGO: 'ngo' };

const STEPS = ['Role & Credentials', 'Personal Details', 'Confirm'];

export default function SignupPage() {
  const { register, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]           = useState(0);
  const [role, setRole]           = useState(ROLES.NGO);
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [done, setDone]           = useState(false);

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    name: '', org: '', phone: '', website: '', about: '',
  });

  if (user) return <Navigate to={user.role === ROLES.ADMIN ? '/authority' : '/ngo'} replace />;

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const nextStep = (e) => {
    e.preventDefault();
    setError('');
    if (step === 0) {
      if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
      if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register({ email: form.email, name: form.name, role, org: form.org });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (profile) => {
    try {
      const session = await loginWithGoogle(profile, role);
      navigate(session.role === 'admin' ? '/authority' : '/ngo', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  if (done) return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center animate-scale-in">
        <div className="card-premium rounded-3xl p-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mx-auto mb-6 glow-emerald">
            <CheckCircle2 className="w-10 h-10 text-slate-900" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Account Created!</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            {role === ROLES.NGO
              ? 'Your NGO registration is submitted for DAO review. You\'ll be notified once verified.'
              : 'Your admin account is ready. You can now access the dashboard.'}
          </p>
          <button
            onClick={() => navigate(role === ROLES.ADMIN ? '/authority' : '/ngo')}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 active:scale-95 text-sm"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Animated Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px] animate-pulse-slow" />
        <div className="absolute -bottom-60 -left-60 w-[700px] h-[700px] rounded-full bg-emerald-500/5 blur-[140px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="w-full max-w-md relative z-10 animate-slide-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center glow-emerald">
              <Shield className="w-7 h-7 text-slate-900" />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold text-white tracking-tight">ReliefChain</div>
              <div className="text-xs text-slate-400 font-medium tracking-widest uppercase">Disaster DAO</div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
          <p className="text-slate-400 text-sm">Join the decentralized relief network</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                  i < step  ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-slate-900 shadow-md shadow-emerald-500/30' :
                  i === step ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-slate-900 shadow-lg shadow-emerald-500/40 scale-110' :
                               'bg-slate-800 text-slate-500'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wide ${i === step ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mb-4 rounded-full transition-all duration-500 ${i < step ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-slate-800'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="card-premium rounded-3xl p-8">

          {/* Step 0 – Role + Credentials */}
          {step === 0 && (
            <form onSubmit={nextStep} className="space-y-5 animate-fade-in">
              {/* Role picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Register as</label>
                <div className="flex gap-2 p-1 bg-slate-900/80 rounded-2xl border border-white/5">
                  {[
                    { key: ROLES.ADMIN, label: 'Admin',       Icon: Shield    },
                    { key: ROLES.NGO,   label: 'NGO Partner', Icon: Building2 },
                  ].map(({ key, label, Icon }) => (
                    <button
                      key={key} type="button"
                      onClick={() => setRole(key)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        role === key
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 shadow-lg shadow-emerald-500/20'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />{label}
                    </button>
                  ))}
                </div>
                {role === ROLES.ADMIN && (
                  <div className="mt-2 flex items-start gap-2 text-amber-400/80 bg-amber-500/5 border border-amber-500/15 rounded-xl p-3">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-xs">Admin accounts require DAO approval. Contact the core team to whitelist your email first.</p>
                  </div>
                )}
              </div>

              {/* ── Google Sign-Up ── */}
              <GoogleSignInButton
                label={`Sign up with Google as ${role === 'admin' ? 'Admin' : 'NGO'}`}
                onSuccess={handleGoogleSuccess}
                onError={(msg) => setError(msg)}
              />

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/[0.07]" />
                <span className="text-slate-600 text-xs font-semibold uppercase tracking-wider">or with email</span>
                <div className="flex-1 h-px bg-white/[0.07]" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="email" required value={form.email} onChange={set('email')} placeholder="you@organisation.in" className="input-field text-sm pl-10" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={set('password')} placeholder="Min. 6 characters" className="input-field text-sm pl-10 pr-12" />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type={showPass ? 'text' : 'password'} required value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat password" className="input-field text-sm pl-10" />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              )}

              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-900 font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 active:scale-95 text-sm mt-2">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Step 1 – Personal / Org Details */}
          {step === 1 && (
            <form onSubmit={nextStep} className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" required value={form.name} onChange={set('name')} placeholder="Your full name" className="input-field text-sm pl-10" />
                </div>
              </div>

              {role === ROLES.NGO && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Organisation Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="text" required value={form.org} onChange={set('org')} placeholder="E.g. Asha Foundation" className="input-field text-sm pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="url" value={form.website} onChange={set('website')} placeholder="https://yourorg.in" className="input-field text-sm pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">About Organisation</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                      <textarea rows={3} value={form.about} onChange={set('about')} placeholder="Brief description of your NGO's mission..." className="input-field text-sm pl-10 resize-none" />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" className="input-field text-sm pl-10" />
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setStep(0)} className="flex-1 py-3.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:border-white/20 font-semibold text-sm transition-all">
                  ← Back
                </button>
                <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-900 font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 active:scale-95 text-sm">
                  Review <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 2 – Confirm */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="animate-fade-in">
              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Review your details</h3>
                {[
                  { label: 'Role',         value: role === ROLES.ADMIN ? '🛡 Admin' : '🏢 NGO Partner' },
                  { label: 'Email',        value: form.email },
                  { label: 'Name',         value: form.name },
                  ...(role === ROLES.NGO && form.org ? [{ label: 'Organisation', value: form.org }] : []),
                  ...(form.phone ? [{ label: 'Phone', value: form.phone }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</span>
                    <span className="text-slate-200 text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:border-white/20 font-semibold text-sm transition-all">
                  ← Back
                </button>
                <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-900 font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 active:scale-95 text-sm disabled:opacity-60">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating…</> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="divider my-6" />
          <p className="text-center text-slate-500 text-xs">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
              Sign in →
            </Link>
          </p>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Protected by ReliefChain DAO · © 2025
        </p>
      </div>
    </div>
  );
}
