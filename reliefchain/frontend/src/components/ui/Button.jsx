import React from 'react';
import { cn } from '../../utils/cn';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  ...props 
}) {
  const base = [
    "inline-flex items-center justify-center font-semibold tracking-tight",
    "rounded-xl transition-all duration-200 cursor-pointer",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020b12]",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
    "active:scale-[0.97] select-none",
  ].join(' ');

  const variants = {
    primary: [
      "text-white font-bold",
      "bg-gradient-to-r from-emerald-500 via-emerald-500 to-cyan-500",
      "hover:from-emerald-400 hover:to-cyan-400",
      "shadow-[0_4px_20px_rgba(16,185,129,0.30)]",
      "hover:shadow-[0_4px_32px_rgba(16,185,129,0.50)]",
      "focus-visible:ring-emerald-500",
      "border border-emerald-400/20",
      "relative overflow-hidden",
      "before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none",
    ].join(' '),

    secondary: [
      "text-slate-200 font-semibold",
      "bg-white/[0.05] hover:bg-white/[0.09]",
      "border border-white/[0.08] hover:border-white/[0.14]",
      "shadow-[0_2px_12px_rgba(0,0,0,0.3)]",
      "focus-visible:ring-slate-500",
      "hover:text-white",
    ].join(' '),

    outline: [
      "text-emerald-400 hover:text-emerald-300 font-semibold",
      "border border-emerald-500/40 hover:border-emerald-400/70",
      "hover:bg-emerald-500/[0.08]",
      "focus-visible:ring-emerald-500",
    ].join(' '),

    ghost: [
      "text-slate-400 hover:text-white",
      "hover:bg-white/[0.06]",
      "focus-visible:ring-slate-500",
    ].join(' '),

    danger: [
      "text-white font-bold",
      "bg-gradient-to-r from-red-600 to-rose-600",
      "hover:from-red-500 hover:to-rose-500",
      "shadow-[0_4px_16px_rgba(220,38,38,0.25)]",
      "focus-visible:ring-red-500",
    ].join(' '),
  };

  const sizes = {
    xs: "text-xs px-3 py-1.5 gap-1.5",
    sm: "text-sm px-4 py-2 gap-1.5",
    md: "text-sm px-5 py-2.5 gap-2",
    lg: "text-base px-7 py-3.5 gap-2.5",
    xl: "text-lg px-9 py-4 gap-3",
  };

  return (
    <button 
      className={cn(base, variants[variant] || variants.primary, sizes[size] || sizes.md, className)}
      {...props}
    >
      {children}
    </button>
  );
}
