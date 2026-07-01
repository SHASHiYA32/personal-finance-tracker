'use client';

import { useEffect, useState } from 'react';
import { useExpenses } from '@/hooks/use-expenses';
import { useBudget } from '@/hooks/use-budget';
import { formatCurrency } from '@/lib/helpers/currency';
import { 
  Sparkles, 
  BarChart2, 
  LineChart as LineIcon,
  TrendingUp, 
  DollarSign 
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';

const CATEGORIES = [
  'Food',
  'Rent/Housing',
  'Transport',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Other',
];

export default function AnalyticsPage() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [mounted, setMounted] = useState(false);

  const { expenses, fetchExpenses, loading: expensesLoading } = useExpenses();
  const { budgets, fetchBudgets, loading: budgetsLoading } = useBudget();

  useEffect(() => {
    setMounted(true);
    fetchExpenses(currentMonth, currentYear);
    fetchBudgets(currentMonth, currentYear);
  }, [currentMonth, currentYear, fetchExpenses, fetchBudgets]);

  if (!mounted) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Aggregate actual spend per category
  const categorySpending = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {} as Record<string, number>);

  // 1. Budget vs. Spend Comparison Data
  const budgetVsSpendData = CATEGORIES.map((cat) => {
    const budgetItem = budgets.find((b) => b.category === cat);
    return {
      name: cat,
      Budget: budgetItem ? Number(budgetItem.monthly_limit) : 0,
      Actual: categorySpending[cat] || 0,
    };
  });

  // 2. Cumulative and Daily Spend Trend
  const today = new Date().getDate();
  const dailySpends: Record<number, number> = {};
  for (let i = 1; i <= today; i++) {
    dailySpends[i] = 0;
  }
  expenses.forEach((exp) => {
    const day = new Date(exp.date).getDate();
    if (day <= today) {
      dailySpends[day] = (dailySpends[day] || 0) + Number(exp.amount);
    }
  });

  let cumulativeSum = 0;
  const trendData = Object.keys(dailySpends).map((dayStr) => {
    const day = Number(dayStr);
    cumulativeSum += dailySpends[day];
    return {
      name: `${day}`,
      Daily: dailySpends[day],
      Cumulative: cumulativeSum,
    };
  });

  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.monthly_limit), 0);
  const budgetUtilization = totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 border-white/10 bg-slate-950/85 shadow-2xl backdrop-blur-md text-xs space-y-1">
          <p className="font-bold text-slate-300 mb-1">Day {label}</p>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <span className="text-slate-400 font-medium">{entry.name}:</span>
              <span className="font-semibold text-white">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    };
    return null;
  };

  const CustomCategoryTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 border-white/10 bg-slate-950/85 shadow-2xl backdrop-blur-md text-xs space-y-1">
          <p className="font-bold text-slate-300 mb-1">{label}</p>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <span className="text-slate-400 font-medium">{entry.name}:</span>
              <span className="font-semibold text-white">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    };
    return null;
  };

  const loading = expensesLoading || budgetsLoading;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>Visual Analytics</span>
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold text-white mt-1">
            Data Insights
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Examine your cash burn rates, cumulative daily trends, and verify budget limits allocations.
          </p>
        </div>

        {/* Total stats */}
        <div className="flex items-center gap-4">
          <div className="glass-panel py-3 px-5 border-white/5 bg-white/[0.02] flex items-center gap-3 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Utilization Rate</p>
              <p className="text-lg font-bold text-white mt-1.5 leading-none">
                {totalBudget > 0 ? `${budgetUtilization.toFixed(0)}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Cumulative & Daily Spend Curve */}
        <div className="glass-panel p-6 h-[400px] flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <LineIcon className="h-4.5 w-4.5 text-indigo-400" />
              <span>Cumulative Spending Curve</span>
            </h4>
            <p className="text-[11px] text-slate-400">Daily cost accumulation this month</p>
          </div>

          <div className="h-[300px] w-full mt-4">
            {expenses.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No transactions recorded for trend mapping.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  <Line name="Cumulative Spend" type="monotone" dataKey="Cumulative" stroke="#6366f1" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  <Line name="Daily Spike" type="monotone" dataKey="Daily" stroke="#ec4899" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Budget vs Spend Bars */}
        <div className="glass-panel p-6 h-[400px] flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <BarChart2 className="h-4.5 w-4.5 text-pink-400" />
              <span>Budget Allocation vs. Actual Spending</span>
            </h4>
            <p className="text-[11px] text-slate-400">Category thresholds comparison</p>
          </div>

          <div className="h-[300px] w-full mt-4">
            {expenses.length === 0 && budgets.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No budget entries or expense logs found.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetVsSpendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip content={<CustomCategoryTooltip />} />
                  <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  <Bar name="Budget Limit" dataKey="Budget" fill="#38bdf8" radius={[4, 4, 0, 0]} opacity={0.6} />
                  <Bar name="Actual Spend" dataKey="Actual" fill="#ec4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
