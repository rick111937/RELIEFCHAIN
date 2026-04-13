import React from 'react';
import { cn } from '../../utils/cn';

export default function Card({ children, className, hover = true, glow = false, ...props }) {
  return (
    <div 
      className={cn(
        // Base surface
        "rounded-2xl p-6 border transition-all duration-300",
        "bg-gradient-to-b from-[#0f1f35]/90 to-[#0a1628]/90",
        "border-white/[0.07]",
        "shadow-[0_4px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]",
        // Hover lift
        hover && [
          "hover:-translate-y-1",
          "hover:border-white/[0.12]",
          "hover:shadow-[0_8px_48px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)]",
        ],
        // Optional glow
        glow && "hover:border-emerald-500/20 hover:shadow-[0_8px_48px_rgba(0,0,0,0.5),0_0_0_1px_rgba(16,185,129,0.10),inset_0_1px_0_rgba(255,255,255,0.07)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
