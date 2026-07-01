"use client";

import { useEffect } from "react";
import { useExpenses } from "@/hooks/use-expenses";
import { useBudget } from "@/hooks/use-budget";
import ExpenseForm from "@/components/expenses/expense-form";
import ExpenseTable from "@/components/expenses/expense-table";
import { Sparkles, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/helpers/currency";

export default function ExpensesPage() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const { expenses, loading, fetchExpenses, addExpense, deleteExpense } =
    useExpenses();

  const { budgets, fetchBudgets, loading: budgetLoading } = useBudget();

  useEffect(() => {
    fetchExpenses(currentMonth, currentYear);
    fetchBudgets(currentMonth, currentYear);
  }, [currentMonth, currentYear, fetchExpenses, fetchBudgets]);

  const totalExpense = expenses.reduce(
    (acc, curr) => acc + Number(curr.amount),
    0,
  );

  const totalBudget = budgets.reduce(
    (acc, curr) => acc + Number(curr.monthly_limit),
    0,
  );

  const handleAddExpense = async (data: {
    title: string;
    amount: number;
    category: string;
    date: string;
    note?: string | null;
  }) => {
    await addExpense(data);
  };

  const usagePercentage =
    totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0;

  const budgetStatus =
    totalBudget === 0
      ? "none"
      : usagePercentage >= 100
        ? "danger"
        : usagePercentage >= 60
          ? "warning"
          : "good";

  const glowColor =
    budgetStatus === "danger"
      ? "bg-red-400"
      : budgetStatus === "warning"
        ? "bg-yellow-400"
        : "bg-green-400";

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>Monthly Expenses</span>
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold text-white mt-1">
            Track your expenditures.
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Log your daily expenses, review historical logs, and filter
            transactions by spending categories.
          </p>
        </div>

        <div className="flex flex-col justify-end w-full lg:flex-row gap-2">
          <div className="glass-panel py-3 px-5 border-white/5 bg-white/[0.02] flex items-center gap-3 self-start md:self-auto shrink-0 relative overflow-hidden">
            <div
              className={`absolute -right-5 -top-10 w-16 h-16 rounded-full blur-xl opacity-70 ${glowColor}`}
            />
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                Month Total
              </p>
              <p className="text-lg font-bold text-white mt-1.5 leading-none">
                {formatCurrency(totalExpense)}
              </p>
            </div>
          </div>
          <div className="glass-panel py-3 px-5 border-white/5 bg-white/[0.02] flex items-center gap-3 self-start md:self-auto shrink-0 relative overflow-hidden">
            <div className="absolute -right-5 -top-10 w-16 h-16 rounded-full blur-xl opacity-70 transition-opacity duration-300 group-hover:opacity-40 bg-green-400"></div>
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                Budget Total
              </p>
              <p className="text-lg font-bold text-white mt-1.5 leading-none">
                {formatCurrency(totalBudget)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <ExpenseForm onSubmit={handleAddExpense} />
        </div>

        <div className="lg:col-span-2">
          <ExpenseTable
            expenses={expenses}
            onDelete={deleteExpense}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
