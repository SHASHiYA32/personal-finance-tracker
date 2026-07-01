'use client';

import { useEffect } from 'react';
import { useExpenses } from '@/hooks/use-expenses';
import ExpenseForm from '@/components/expenses/expense-form';
import ExpenseTable from '@/components/expenses/expense-table';
import { Sparkles, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/helpers/currency';

export default function ExpensesPage() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const { expenses, loading, fetchExpenses, addExpense, deleteExpense } = useExpenses();

  useEffect(() => {
    fetchExpenses(currentMonth, currentYear);
  }, [currentMonth, currentYear, fetchExpenses]);

  const totalExpense = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

  const handleAddExpense = async (data: {
    title: string;
    amount: number;
    category: string;
    date: string;
    note?: string | null;
  }) => {
    await addExpense(data);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
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
            Log your daily expenses, review historical logs, and filter transactions by spending categories.
          </p>
        </div>

        {/* Monthly total display */}
        <div className="glass-panel py-3 px-5 border-white/5 bg-white/[0.02] flex items-center gap-3 self-start md:self-auto shrink-0">
          <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Month Total</p>
            <p className="text-lg font-bold text-white mt-1.5 leading-none">
              {formatCurrency(totalExpense)}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Form and Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Expense recording form */}
        <div className="lg:col-span-1">
          <ExpenseForm onSubmit={handleAddExpense} />
        </div>

        {/* Expense logs and filter table */}
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
