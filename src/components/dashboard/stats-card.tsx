'use client';

import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  iconColorClass: string;
  glowColorClass: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function StatsCard({
  title,
  value,
  subtext,
  icon: Icon,
  iconColorClass,
  glowColorClass,
  trend,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="glass-panel glass-panel-hover p-6 relative overflow-hidden"
    >
      <div className={`absolute -right-10 -top-10 w-24 h-24 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 ${glowColorClass}`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl md:text-3xl font-bold mt-2 text-white tracking-tight">
            {value}
          </h3>
          {trend && (
            <div className="flex items-center gap-1 mt-1.5">
              <span className={`text-xs font-semibold ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">vs last month</span>
            </div>
          )}
          {subtext && !trend && (
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              {subtext}
            </p>
          )}
        </div>

        <div className={`h-11 w-11 rounded-xl flex items-center justify-center border border-white/5 bg-white/[0.03] shadow-inner ${iconColorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
