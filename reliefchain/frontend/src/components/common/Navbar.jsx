import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Layers, Menu, X, Zap, Shield, Brain, LogOut, LogIn, User, Cpu, ChevronDown, ShieldAlert, Compass, Building2, Vote } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { href: '/explore',  label: 'Explore',      icon: Compass, accent: 'emerald' },
  { href: '/predict',  label: 'Prediction AI',icon: Brain,   accent: 'violet' },
  { href: '/ngo',      label: 'NGO Portal',   icon: Building2, accent: 'cyan' },
  { href: '/dao',      label: 'Governance',   icon: Vote,    accent: 'indigo' },
];

const AI_LINKS = [
  { href: '/fraud',   label: 'Fraud Sentinel',   desc: 'Detect fake campaigns', icon: ShieldAlert, theme: 'rose' },
];

const SSI_LINKS = [
  { href: '/authority',   label: 'State Authority', color: 'indigo' },
  { href: '/beneficiary', label: 'Worker SSI',      color: 'emerald' },
];

const ACCENT_MAP = {
  violet: {
    pill:  'bg-violet-500/10 border-violet-500/30 text-violet-300',
    dot:   'bg-violet-400',
    glow:  'shadow-[0_0_10px_rgba(139,92,246,0.5)]',
  },
  rose: {
    pill:  'bg-rose-500/10 border-rose-500/30 text-rose-300',
    dot:   'bg-rose-400',
    glow:  'shadow-[0_0_10px_rgba(244,63,94,0.5)]',
  },
  indigo: {
    pill:  'bg-indigo-500/[0.08] hover:bg-indigo-500/20 border-indigo-500/25 text-indigo-300 hover:text-indigo-100',
    dot:   'bg-indigo-400',
    glow:  'shadow-[0_0_10px_rgba(99,102,241,0.5)]',
    active:'bg-indigo-500/20 text-white border-indigo-400/40',
  },
  emerald: {
    pill:  'bg-emerald-500/[0.08] hover:bg-emerald-500/20 border-emerald-500/25 text-emerald-300 hover:text-emerald-100',
    dot:   'bg-emerald-400',
    glow:  'shadow-[0_0_10px_rgba(16,185,129,0.5)]',
    active:'bg-emerald-500/20 text-white border-emerald-400/40',
  },
  cyan: {
    pill:  'bg-cyan-500/[0.08] hover:bg-cyan-500/20 border-cyan-500/25 text-cyan-300 hover:text-cyan-100',
    dot:   'bg-cyan-400',
    glow:  'shadow-[0_0_10px_rgba(6,182,212,0.5)]',
    active:'bg-cyan-500/20 text-white border-cyan-400/40',
  },
};

/* ---------- animated underline indicator ---------- */
function NavIndicator({ links, pathname }) {
  const containerRef = useRef(null);
  const [style, setStyle] = useState({ opacity: 0, left: 0, width: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const activeLink = containerRef.current.querySelector('[data-active="true"]');
    if (activeLink) {
      const { offsetLeft, offsetWidth } = activeLink;
      setStyle({ opacity: 1, left: offsetLeft, width: offsetWidth });
    } else {
      setStyle(s => ({ ...s, opacity: 0 }));
    }
  }, [pathname]);

  return (
    <div ref={containerRef} className="relative flex items-center gap-0.5">
      {/* sliding pill indicator */}
      <span
        className="absolute bottom-0 h-[2px] rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 pointer-events-none transition-all duration-300 ease-out"
        style={style}
      />

      {links.map(link => {
        const active = pathname === link.href || pathname.startsWith(link.href + '/');
        const Icon = link.icon;
        const acc = link.accent ? ACCENT_MAP[link.accent] : null;

        return (
          <a
            key={link.href}
            href={link.href}
            data-active={active ? 'true' : 'false'}
            className={`
              relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 select-none group
              ${active ? 'text-white' : 'text-slate-400 hover:text-white'}
            `}
          >
            {/* active bg flash */}
            {active && (
              <span className="absolute inset-0 rounded-lg bg-white/[0.055] pointer-events-none" />
            )}

            {/* hover bg */}
            <span className="absolute inset-0 rounded-lg bg-white/0 group-hover:bg-white/[0.04] transition-colors pointer-events-none" />

            {Icon && acc ? (
              <span className={`relative flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-bold tracking-wide ${acc.pill} ${active ? acc.glow : ''} transition-all duration-200`}>
                <Icon className="w-3 h-3" />
                {link.label}
                {active && <span className={`w-1.5 h-1.5 rounded-full ${acc.dot} animate-pulse`} />}
              </span>
            ) : (
              <span className="relative">{link.label}</span>
            )}
          </a>
        );
      })}
    </div>
  );
}

const ROLE_LABEL = { admin: '🛡 Admin', ngo: '🏢 NGO' };
const ROLE_COLOR = { admin: 'text-indigo-300 border-indigo-500/30 bg-indigo-500/10', ngo: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' };

/* ---------- AI Tools Dropdown ---------- */
function AIToolsDropdown({ pathname }) {
  return (
    <div className="relative group/dropdown">
      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-violet-500/20 bg-violet-500/[0.04] text-violet-300 hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-100 transition-all text-[11px] font-bold">
        <Cpu className="w-3.5 h-3.5" />
        AI Tools
        <ChevronDown className="w-3 h-3 opacity-70 group-hover/dropdown:rotate-180 transition-transform duration-300" />
      </button>

      {/* dropdown panel */}
      <div className="absolute top-full right-0 mt-3 w-56 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible translate-y-2 group-hover/dropdown:translate-y-0 transition-all duration-300 z-50">
        <div className="p-2 rounded-2xl bg-[#081221]/95 backdrop-blur-3xl border border-white/10 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
          
          <div className="flex flex-col gap-1">
            {AI_LINKS.map(link => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`flex items-start gap-3 p-2.5 rounded-xl transition-all group/item ${
                    active ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                    link.theme === 'violet' 
                      ? 'bg-violet-500/10 border-violet-500/20 group-hover/item:bg-violet-500/20'
                      : 'bg-rose-500/10 border-rose-500/20 group-hover/item:bg-rose-500/20'
                  }`}>
                    <Icon className={`w-4 h-4 transition-all ${
                      link.theme === 'violet' ? 'text-violet-400 group-hover/item:text-violet-300' : 'text-rose-400 group-hover/item:text-rose-300'
                    }`} />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold transition-colors ${active ? 'text-white' : 'text-slate-200 group-hover/item:text-white'}`}>
                      {link.label}
                    </span>
                    <span className="text-[10px] text-slate-500 leading-tight mt-0.5">{link.desc}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================= */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      {/* ── Main nav bar ── */}
      <div className="fixed top-0 left-0 w-full z-50 transition-all duration-500">
        <nav className={`
          w-full relative transition-all duration-500 border-b box-border
          ${scrolled
            ? 'bg-[#050f1d]/90 backdrop-blur-3xl border-white/[0.1] shadow-[0_10px_40px_rgba(0,0,0,0.8)]'
            : 'bg-[#050f1d]/60 backdrop-blur-xl border-white/[0.05] shadow-[0_4px_20px_rgba(0,0,0,0.4)]'}
        `}>

          {/* top accent line */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500/80 via-cyan-500/80 to-indigo-500/80 pointer-events-none z-10" />

          <div className={`px-6 mx-auto max-w-[1800px] flex items-center gap-4 transition-all duration-500 ${scrolled ? 'h-[64px]' : 'h-[76px]'}`}>

          {/* ── Logo ── */}
          <a href="/" className="flex items-center gap-2.5 group flex-shrink-0 mr-2">
            <div className="relative">
              {/* glow */}
              <div className="absolute inset-0 bg-emerald-500/40 rounded-xl blur-lg scale-125 group-hover:scale-150 group-hover:bg-emerald-400/50 transition-all duration-500" />
              {/* icon box */}
              <div className="relative bg-gradient-to-br from-emerald-400 via-emerald-500 to-cyan-500 p-[7px] rounded-xl group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.40)]">
                <Layers className="text-white w-[18px] h-[18px]" strokeWidth={2.2} />
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[17px] font-black tracking-tight bg-gradient-to-r from-emerald-300 via-cyan-300 to-white bg-clip-text text-transparent">
                ReliefChain
              </span>
              <span className="text-[9px] font-semibold text-slate-500 tracking-[0.12em] uppercase">
                Disaster DAO
              </span>
            </div>
          </a>

          {/* ── Desktop nav links ── */}
          <div className="hidden md:flex items-center flex-1">
            <NavIndicator links={NAV_LINKS} pathname={pathname} />
          </div>

          {/* ── Right section ── */}
          <div className="hidden md:flex items-center gap-2 ml-auto">

            {/* AI Tools Dropdown */}
            <AIToolsDropdown pathname={pathname} />

            <div className="w-px h-5 bg-white/10 mx-1" />

            {/* SSI Portals pill group */}
            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] rounded-xl px-1.5 py-1 backdrop-blur-sm">
              {SSI_LINKS.map(link => {
                const active = pathname === link.href;
                const acc = ACCENT_MAP[link.color];
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`
                      text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all duration-200
                      ${active ? acc.active : acc.pill}
                    `}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>

            {/* Fund Wallet CTA */}
            <a
              href="/fund"
              className="relative flex items-center gap-1.5 text-[11px] font-bold px-4 py-2 rounded-xl overflow-hidden group transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
              style={{ background: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)' }}
            >
              {/* shimmer overlay */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%)',
                  backgroundSize: '200% 100%',
                }}
              />
              <Zap className="w-3.5 h-3.5 relative" strokeWidth={2.5} />
              <span className="relative text-white">Fund Wallet</span>
            </a>

            {/* Rainbow wallet button */}
            <ConnectButton showBalance={false} />

            {/* User session */}
            {user ? (
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-1.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-900 font-black text-xs">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-xs font-bold text-white">{user.name}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border mt-0.5 ${ROLE_COLOR[user.role]}`}>{ROLE_LABEL[user.role]}</span>
                </div>
                <button onClick={handleLogout} title="Sign out" className="ml-1 text-slate-500 hover:text-red-400 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <a href="/login" className="flex items-center gap-1.5 text-[11px] font-bold px-4 py-2 rounded-xl border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-400/50 transition-all">
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </a>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="md:hidden ml-auto flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06] transition-all"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span className={`transition-all duration-300 ${mobileOpen ? 'rotate-90 opacity-0 absolute' : 'rotate-0 opacity-100'}`}>
              <Menu className="w-4.5 h-4.5" />
            </span>
            <span className={`transition-all duration-300 ${mobileOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0 absolute'}`}>
              <X className="w-4.5 h-4.5" />
            </span>
          </button>
        </div>
      </nav>
      </div>

      {/* ── Mobile drawer ── */}
      <div
        className={`md:hidden fixed inset-0 z-40 top-[68px] transition-all duration-300 ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        {/* backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)}
        />

        {/* drawer panel */}
        <div className={`
          relative bg-[#080f1d]/95 backdrop-blur-2xl border-b border-white/[0.07]
          px-4 pt-4 pb-6 space-y-1 shadow-[0_20px_60px_rgba(0,0,0,0.8)]
          transition-all duration-300 ease-out
          ${mobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}
        `}>
          {/* top gradient accent */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

          {/* nav links */}
          {NAV_LINKS.map(link => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/');
            const Icon = link.icon;
            const acc = link.accent ? ACCENT_MAP[link.accent] : null;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`
                  flex items-center gap-2.5 py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-200
                  ${active ? 'bg-white/[0.07] text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}
                `}
                onClick={() => setMobileOpen(false)}
              >
                {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                {link.label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </a>
            );
          })}

          <div className="pt-1 border-t border-white/[0.06]" />

          {/* AI links (Mobile) */}
          <div className="px-4 py-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">AI Tools</span>
            <div className="space-y-1">
              {AI_LINKS.map(link => {
                const active = pathname === link.href;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 py-2.5 px-3 rounded-xl transition-all ${
                      active ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <link.icon className={`w-4 h-4 ${link.theme === 'violet' ? 'text-violet-400' : 'text-rose-400'}`} />
                    <span className="text-sm font-semibold">{link.label}</span>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="pt-1 border-t border-white/[0.06]" />

          {/* SSI links */}
          {SSI_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="block py-3 px-4 text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/[0.04] rounded-xl transition-all"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}

          {/* Fund Wallet */}
          <a
            href="/fund"
            className="flex items-center gap-2 py-3 px-4 text-sm font-bold text-emerald-300 hover:bg-emerald-500/10 rounded-xl transition-all"
            onClick={() => setMobileOpen(false)}
          >
            <Zap className="w-4 h-4" />
            Fund Wallet
          </a>

          <div className="pt-3 px-4">
            <ConnectButton showBalance={false} />
          </div>

          {/* Mobile user session */}
          {user ? (
            <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] rounded-xl border border-white/[0.06] mt-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-900 font-black text-sm">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{user.name}</p>
                  <p className={`text-[11px] font-semibold ${ROLE_COLOR[user.role]}`}>{ROLE_LABEL[user.role]}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-red-400 font-semibold hover:text-red-300 transition-colors">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          ) : (
            <a href="/login" className="flex items-center justify-center gap-2 mx-4 mt-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold rounded-xl text-sm">
              <LogIn className="w-4 h-4" /> Sign In
            </a>
          )}
        </div>
      </div>
    </>
  );
}
