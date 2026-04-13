import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { ShieldCheck, HeartPulse, Globe2, ArrowRight, Zap, TrendingUp, Users } from 'lucide-react';
import api from '../services/api';

const STATS = [
  { label: 'Total Raised',  value: '₹14.8 Cr', icon: TrendingUp,   color: 'text-emerald-400' },
  { label: 'NGOs Verified', value: '127',        icon: ShieldCheck,  color: 'text-cyan-400' },
  { label: 'Beneficiaries', value: '48,200+',    icon: Users,        color: 'text-indigo-400' },
  { label: 'On-chain Votes', value: '324',         icon: Zap,          color: 'text-amber-400' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects')
      .then(res => { setProjects(res.data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in bg-mesh min-h-screen pb-24 relative">
      <div className="bg-grid"></div>

      {/* ───── Hero ───── */}
      <section className="relative pt-24 pb-32 overflow-hidden">

        {/* Decorative orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          <div className="absolute -top-32 left-[15%] w-[800px] h-[800px] rounded-full opacity-[0.10] animate-pulse-slow"
            style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 60%)', filter: 'blur(80px)' }} />
          <div className="absolute top-40 right-[15%] w-[600px] h-[600px] rounded-full opacity-[0.08] animate-float"
            style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 60%)', filter: 'blur(80px)', animationDelay: '2s' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.3), transparent)' }} />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">

          <div className="inline-flex items-center gap-2 mb-8 bg-emerald-500/[0.08] border border-emerald-500/30 rounded-full px-5 py-2.5 animate-slide-up shadow-[0_0_20px_rgba(16,185,129,0.15)]" style={{ animationDelay: '0.1s' }}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="text-emerald-300 text-sm font-semibold tracking-wider">Decentralized Disaster Relief on-chain</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-[1.05] animate-slide-up drop-shadow-2xl" style={{ animationDelay: '0.2s' }}>
            Transparent{' '}
            <span className="text-gradient">Disaster Relief</span>
            <br />
            <span className="text-white/80 text-5xl md:text-7xl font-bold">for India</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400/90 max-w-3xl mx-auto mb-12 leading-relaxed animate-slide-up font-light" style={{ animationDelay: '0.3s' }}>
            A trustless platform where donations are escrowed in smart contracts and released only when NGOs provide verifiable on-chain proof of impact.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Button size="lg" className="gap-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 font-bold px-8 shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] transition-all duration-500 hover:scale-[1.05]" onClick={() => navigate('/explore')}>
              Donate Now <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="secondary" size="lg" className="px-8 font-semibold border-white/10 hover:bg-white/[0.05]" onClick={() => navigate('/ngo')}>
              NGO Operations Hub
            </Button>
          </div>

          {/* Stats Strip */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.6s' }}>
            {STATS.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center hover:bg-white/[0.05] transition-colors">
                <Icon className={`w-5 h-5 mx-auto mb-2 ${color}`} />
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Features ───── */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: ShieldCheck, title: '100% Transparent', desc: 'Every transaction and fund release is publicly verifiable on the blockchain. No black boxes.', grad: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20', color: 'text-emerald-400' },
            { icon: HeartPulse,  title: 'Milestone Based',  desc: 'Funds are escrowed in smart contracts and released in tranches — only after verified community approval.', grad: 'from-indigo-500/20 to-indigo-500/5', border: 'border-indigo-500/20', color: 'text-indigo-400' },
            { icon: Globe2,      title: 'DAO Governed',     desc: 'Token holders vote to approve NGO proofs and dictate how pooled relief funds are allocated.', grad: 'from-cyan-500/20 to-cyan-500/5', border: 'border-cyan-500/20', color: 'text-cyan-400' },
          ].map((f, i) => (
            <div key={i} className={`group relative rounded-2xl p-6 border ${f.border} bg-gradient-to-b ${f.grad} hover:-translate-y-1 transition-all duration-300 cursor-default`}>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)' }} />
              <div className={`w-12 h-12 rounded-2xl bg-black/20 border ${f.border} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── Live Campaigns ───── */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-xs text-emerald-400 uppercase tracking-widest font-semibold mb-1">Live &amp; Urgently Needed</p>
            <h2 className="text-3xl font-black tracking-tight">Urgent Campaigns</h2>
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5" onClick={() => navigate('/explore')}>
            View All <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] h-72 animate-shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => {
              const pct = Math.min(100, Math.round((project.raisedAmount / project.targetAmount) * 100));
              return (
                <Card key={project._id} glow className="flex flex-col group">

                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="text-4xl w-14 h-14 rounded-2xl flex items-center justify-center
                      bg-gradient-to-br from-slate-800 to-slate-900 border border-white/[0.08]
                      group-hover:scale-105 transition-transform shadow-inner">
                      {project.imageIcon || '🌍'}
                    </div>
                    <Badge variant={project.status === 'COMPLETED' ? 'warning' : 'success'} dot pulse={project.status !== 'COMPLETED'}>
                      {project.status}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold mb-1.5 line-clamp-1 text-white">{project.name}</h3>
                  <p className="text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">{project.description}</p>

                  {/* Progress */}
                  <div className="mt-auto">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-300 font-semibold">
                        ₹{project.raisedAmount.toLocaleString('en-IN')}
                        <span className="text-slate-500 font-normal ml-1">raised</span>
                      </span>
                      <span className="text-emerald-400 font-semibold">₹{project.targetAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="progress-bar mb-1.5">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-5">
                      <span>{pct}% funded</span>
                    </div>
                    <Button className="w-full" onClick={() => navigate(`/project/${project._id}`)}>
                      Support Campaign <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
