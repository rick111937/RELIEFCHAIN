import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Shield, Building2, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/ui/GoogleSignInButton';

const ROLES = { ADMIN: 'admin', NGO: 'ngo' };

const DEMO = {
  admin: { email: 'admin@reliefchain.in', password: 'Admin@123' },
  ngo:   { email: 'ngo@reliefchain.in',   password: 'NGO@123'   },
};

export default function LoginPage() {
  const { login, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  const [role, setRole]         = useState(ROLES.ADMIN);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  if (user) return <Navigate to={user.role === ROLES.ADMIN ? '/authority' : '/ngo'} replace />;

  const fillDemo = () => {
    setEmail(DEMO[role].email);
    setPassword(DEMO[role].password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const session = await login(email, password, role);
      navigate(session.role === ROLES.ADMIN ? '/authority' : '/ngo', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (profile) => {
    try {
      const session = await loginWithGoogle(profile, role);
      navigate(session.role === ROLES.ADMIN ? '/authority' : '/ngo', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Animated Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px] animate-pulse-slow" />
        <div className="absolute -bottom-60 -right-60 w-[700px] h-[700px] rounded-full bg-indigo-500/5 blur-[140px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-500/4 blur-[100px] animate-pulse-slow" style={{ animationDelay: '3s' }} />
      </div>

      {/* Grid overlay */}
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
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-slate-400 text-sm">Sign in to access your dashboard</p>
        </div>

        {/* Card */}
        <div className="card-premium rounded-3xl p-8">

          {/* Role Toggle */}
          <div className="flex gap-2 p-1 bg-slate-900/80 rounded-2xl mb-6 border border-white/5">
            {[
              { key: ROLES.ADMIN, label: 'Admin',       Icon: Shield    },
              { key: ROLES.NGO,   label: 'NGO Partner', Icon: Building2 },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => { setRole(key); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  role === key
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* ── Google Sign-In Button ── */}
          <GoogleSignInButton
            label={`Continue with Google as ${role === ROLES.ADMIN ? 'Admin' : 'NGO'}`}
            onSuccess={handleGoogleSuccess}
            onError={(msg) => setError(msg)}
          />

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-slate-600 text-xs font-semibold uppercase tracking-wider">or sign in with email</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={`Enter your ${role === ROLES.ADMIN ? 'admin' : 'NGO'} email`}
                className="input-field text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field text-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-400 text-xs leading-relaxed">{error}</p>
              </div>
            )}

            {/* Demo fill */}
            <div
              onClick={fillDemo}
              className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/15 rounded-xl px-4 py-3 cursor-pointer hover:bg-emerald-500/10 hover:border-emerald-500/25 transition-all group"
            >
              <div>
                <p className="text-xs font-semibold text-emerald-400">Use demo credentials</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{DEMO[role].email}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-900 font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="divider my-6" />
          <p className="text-center text-slate-500 text-xs">
            New NGO partner?{' '}
            <Link to="/signup" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
              Register your organisation →
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
