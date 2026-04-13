import React from 'react';
import { cn } from '../../utils/cn';

const VARIANTS = {
  success: {
    base: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
    dot: "bg-emerald-400",
  },
  warning: {
    base: "bg-amber-500/10 text-amber-300 border-amber-500/25",
    dot: "bg-amber-400",
  },
  danger: {
    base: "bg-red-500/10 text-red-300 border-red-500/25",
    dot: "bg-red-400",
  },
  info: {
    base: "bg-indigo-500/10 text-indigo-300 border-indigo-500/25",
    dot: "bg-indigo-400",
  },
  cyan: {
    base: "bg-cyan-500/10 text-cyan-300 border-cyan-500/25",
    dot: "bg-cyan-400",
  },
  neutral: {
    base: "bg-white/[0.05] text-slate-300 border-white/[0.08]",
    dot: "bg-slate-400",
  },
};

export default function Badge({ children, variant = 'success', dot = false, pulse = false, className }) {
  const v = VARIANTS[variant] || VARIANTS.neutral;
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase border",
      "shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]",
      v.base,
      className
    )}>
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", v.dot, pulse && "animate-pulse")} />
      )}
      {children}
    </span>
  );
}
