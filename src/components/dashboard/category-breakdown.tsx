'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/helpers/currency';
import { createClient } from '@/lib/supabase/client';
import { Category } from '@/types/category';

interface CategoryData {
  name: string; // May contain category ID or category name
  value: number;
}

interface CategoryBreakdownProps {
  data: CategoryData[];
  categories?: Category[]; // Optional custom category database mapping
}

const COLORS = [
  '#6366f1', // Indigo (Food)
  '#ec4899', // Pink (Rent)
  '#14b8a6', // Teal (Transport)
  '#f59e0b', // Amber (Utilities)
  '#a855f7', // Purple (Entertainment)
  '#f43f5e', // Rose (Shopping)
  '#64748b', // Slate (Other)
];

export default function CategoryBreakdown({ data, categories: initialCategories }: CategoryBreakdownProps) {
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch categories to translate names if numerical IDs are supplied in data
  useEffect(() => {
    if (initialCategories) {
      setCategories(initialCategories);
      return;
    }

    async function getCategories() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("categories")
          .select("*")
          .eq("user_id", user.id);
        if (data) setCategories(data);
      }
    }
    getCategories();
  }, [supabase, initialCategories]);

  if (!mounted) {
    return (
      <div className="glass-panel p-6 h-[350px] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  // Helper to translate category ID to name
  const getCategoryName = (catId: string) => {
    const matched = categories.find((c) => String(c.id) === String(catId));
    return matched ? matched.category : catId;
  };

  // Convert raw data so both keys and labels display category names
  const resolvedData = data.map((item) => ({
    ...item,
    name: getCategoryName(item.name),
  }));

  const total = resolvedData.reduce((acc, curr) => acc + curr.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
      return (
        <div className="glass-panel p-3 border-white/10 bg-slate-950/80 shadow-2xl backdrop-blur-md text-xs">
          <p className="font-bold text-white mb-0.5">{payload[0].name}</p>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Amount:</span>
            <span className="font-semibold text-indigo-400">{formatCurrency(value)}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-slate-400">Share:</span>
            <span className="font-semibold text-slate-200">{percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6 h-[350px] w-full flex flex-col justify-between">
      <div>
        <h4 className="text-sm font-bold text-slate-200">Category Breakdown</h4>
        <p className="text-[11px] text-slate-400">Distribution of your spending this month</p>
      </div>

      {resolvedData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
          No expenses recorded for breakdown.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
          {/* Donut Chart */}
          <div className="h-[180px] w-[180px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resolvedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {resolvedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Total Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold z-[-1]">Total</span>
              <span className="text-lg font-bold text-white mt-0.5 z-[-1]">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Color Legend List */}
          <div className="flex-1 max-h-[180px] overflow-y-auto w-full space-y-1.5 px-2">
            {resolvedData.map((item, index) => {
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
              const color = COLORS[index % COLORS.length];

              return (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span 
                      className="h-2.5 w-2.5 rounded-full block shrink-0" 
                      style={{ backgroundColor: color }} 
                    />
                    <span className="text-slate-300 font-medium truncate max-w-[85px]">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-white">{formatCurrency(item.value)}</span>
                    <span className="text-slate-500 text-[10px] ml-1.5 font-medium">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}