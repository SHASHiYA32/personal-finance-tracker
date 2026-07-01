'use client';

import { useEffect, useState } from 'react';
import { useExpenses } from '@/hooks/use-expenses';
import { useIncome } from '@/hooks/use-income';
import { useBudget } from '@/hooks/use-budget';
import StatsCard from '@/components/dashboard/stats-card';
import IncomeVsExpense from '@/components/dashboard/income-vs-expense';
import CategoryBreakdown from '@/components/dashboard/category-breakdown';
import RecentTransactions, { UnifiedTransaction } from '@/components/dashboard/recent-transactions';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Percent,
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';
import { formatCurrency } from '@/lib/helpers/currency';
import Link from 'next/link';

export default function DashboardPage() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { expenses, fetchExpenses, deleteExpense, loading: expensesLoading } = useExpenses();
  const { incomes, fetchIncomes, deleteIncome, loading: incomesLoading } = useIncome();
  const { budgets, fetchBudgets, loading: budgetsLoading } = useBudget();

  useEffect(() => {
    fetchExpenses(currentMonth, currentYear);
    fetchIncomes(currentMonth, currentYear);
    fetchBudgets(currentMonth, currentYear);
  }, [currentMonth, currentYear, fetchExpenses, fetchIncomes, fetchBudgets]);

  // 1. Calculations for Stats Cards
  const totalIncome = incomes.reduce((acc, inc) => acc + Number(inc.amount), 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + Number(exp.amount), 0);
  
  const totalBudgetLimit = budgets.reduce((acc, b) => acc + Number(b.monthly_limit), 0);
  const remainingBudget = totalBudgetLimit > 0 ? totalBudgetLimit - totalExpenses : totalIncome - totalExpenses;

  const savingsPercent = totalIncome > 0 
    ? Math.max(0, ((totalIncome - totalExpenses) / totalIncome) * 100) 
    : 0;

  // 2. Format Data for Income vs Expense Chart (aggregated by day of the current month)
  const getChartData = () => {
    const dayMap: Record<number, { Income: number; Expenses: number }> = {};
    
    // Initialize standard days of month up to today
    const today = new Date().getDate();
    for (let i = 1; i <= today; i++) {
      dayMap[i] = { Income: 0, Expenses: 0 };
    }

    incomes.forEach((inc) => {
      const day = new Date(inc.date).getDate();
      if (dayMap[day]) {
        dayMap[day].Income += Number(inc.amount);
      }
    });

    expenses.forEach((exp) => {
      const day = new Date(exp.date).getDate();
      if (dayMap[day]) {
        dayMap[day].Expenses += Number(exp.amount);
      }
    });

    return Object.keys(dayMap).map((day) => ({
      name: `Day ${day}`,
      Income: dayMap[Number(day)].Income,
      Expenses: dayMap[Number(day)].Expenses,
    }));
  };

  // 3. Format Data for Category Breakdown Pie Chart
  const getCategoryData = () => {
    const categoryMap: Record<string, number> = {};
    expenses.forEach((exp) => {
      categoryMap[exp.category] = (categoryMap[exp.category] || 0) + Number(exp.amount);
    });

    return Object.keys(categoryMap).map((cat) => ({
      name: cat,
      value: categoryMap[cat],
    }));
  };

  // 4. Merge Incomes and Expenses into a single recent transactions array
  const getMergedTransactions = (): UnifiedTransaction[] => {
    const formattedIncomes = incomes.map((inc) => ({
      id: inc.id,
      type: 'income' as const,
      title: inc.source,
      category: 'Income',
      amount: Number(inc.amount),
      date: inc.date,
    }));

    const formattedExpenses = expenses.map((exp) => ({
      id: exp.id,
      type: 'expense' as const,
      title: exp.title,
      category: exp.category,
      amount: Number(exp.amount),
      date: exp.date,
    }));

    return [...formattedIncomes, ...formattedExpenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const handleTransactionDelete = async (id: string, type: 'income' | 'expense') => {
    if (type === 'income') {
      await deleteIncome(id);
    } else {
      await deleteExpense(id);
    }
  };

  const dashboardLoading = expensesLoading || incomesLoading || budgetsLoading;
  const mergedTransactions = getMergedTransactions();
  const recentTransactions = mergedTransactions.slice(0, 5); // top 5

  return (
    <div className="space-y-8">
      {/* Welcome Hero Panel */}
      <div className="glass-panel p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-indigo-900/10 via-slate-900/40 to-pink-900/5">
        <div className="absolute right-0 top-0 w-80 h-full bg-radial-gradient from-indigo-500/10 to-transparent blur-2xl pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="h-4.5 w-4.5" />
            <span>Financial Insights</span>
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold text-white mt-1.5">
            Your money at a glance.
          </h3>
          <p className="text-slate-400 text-xs mt-1 max-w-lg">
            AuraFinance keeps track of your expenditures, goals, and savings automatically. You are saving <span className="text-emerald-400 font-bold">{savingsPercent.toFixed(0)}%</span> of your monthly earnings.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/expenses" className="glass-button-primary">
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </Link>
          <Link href="/income" className="glass-button-secondary">
            <span>Add Income</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Income"
          value={formatCurrency(totalIncome)}
          icon={TrendingUp}
          iconColorClass="text-emerald-400 bg-emerald-500/5"
          glowColorClass="bg-emerald-500"
          subtext="Total earnings this month"
        />
        <StatsCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon={TrendingDown}
          iconColorClass="text-indigo-400 bg-indigo-500/5"
          glowColorClass="bg-indigo-500"
          subtext="Total outgoing this month"
        />
        <StatsCard
          title="Remaining"
          value={formatCurrency(remainingBudget)}
          icon={PiggyBank}
          iconColorClass="text-pink-400 bg-pink-500/5"
          glowColorClass="bg-pink-500"
          subtext={totalBudgetLimit > 0 ? "Under category budgets limit" : "Based on income vs expense"}
        />
        <StatsCard
          title="Savings Rate"
          value={`${savingsPercent.toFixed(1)}%`}
          icon={Percent}
          iconColorClass="text-amber-400 bg-amber-500/5"
          glowColorClass="bg-amber-500"
          subtext="Percentage of earnings saved"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IncomeVsExpense data={getChartData()} />
        </div>
        <div>
          <CategoryBreakdown data={getCategoryData()} />
        </div>
      </div>

      {/* Lower Section: Transactions Grid */}
      <div className="grid grid-cols-1 gap-6">
        <RecentTransactions
          transactions={recentTransactions}
          onDelete={handleTransactionDelete}
          loading={dashboardLoading}
        />
      </div>
    </div>
  );
}
