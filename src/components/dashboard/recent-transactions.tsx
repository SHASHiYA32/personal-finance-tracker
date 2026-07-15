'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Trash2, 
  Calendar,
  Layers
} from 'lucide-react';
import { formatCurrency } from '@/lib/helpers/currency';
import { formatDate } from '@/lib/helpers/date';
import { createClient } from '@/lib/supabase/client';
import { Category } from '@/types/category';

export interface UnifiedTransaction {
  id: string;
  type: 'income' | 'expense';
  title: string;
  category: string;
  amount: number;
  date: string;
}

interface RecentTransactionsProps {
  transactions: UnifiedTransaction[];
  onDelete: (id: string, type: 'income' | 'expense') => Promise<void>;
  loading?: boolean;
  categories?: Category[]; // Optional prop if parent already has categories
}

export default function RecentTransactions({
  transactions,
  onDelete,
  loading = false,
  categories: initialCategories,
}: RecentTransactionsProps) {
  const supabase = createClient();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);

  // Fetch custom categories to resolve numerical database IDs to text names
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

  // Helper to resolve raw category ID to text
  const getCategoryName = (catId: string, type: 'income' | 'expense') => {
    if (type === 'income') return 'Income';
    const matched = categories.find((c) => String(c.id) === String(catId));
    return matched ? matched.category : 'Other';
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const handleDelete = async (id: string, type: 'income' | 'expense') => {
    setDeletingId(id);
    try {
      await onDelete(id, type);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="glass-panel p-6 w-full flex flex-col justify-between">
      {/* Header and Filter Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h4 className="text-sm font-bold text-slate-200">Recent Transactions</h4>
          <p className="text-[11px] text-slate-400">Timeline of your latest cash flow activity</p>
        </div>

        {/* Filters */}
        <div className="flex bg-white/5 border border-white/5 rounded-xl p-1 self-start sm:self-center">
          {(['all', 'income', 'expense'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                filter === type
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
        {loading && transactions.length === 0 ? (
          <div className="h-40 flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-slate-500 gap-2">
            <Layers className="h-6 w-6 text-slate-600" />
            <p className="text-xs">No records matching the filter.</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isIncome = tx.type === 'income';
            const isDeleting = deletingId === tx.id;

            return (
              <div
                key={`${tx.type}-${tx.id}`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.03] hover:border-white/10 transition-all duration-200 group"
              >
                {/* Left Side: Icon & Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    isIncome 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                  }`}>
                    {isIncome ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate max-w-[150px] sm:max-w-[200px]">
                      {tx.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                      <span className="font-medium text-slate-500 uppercase tracking-wider bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                        {getCategoryName(tx.category, tx.type)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        {formatDate(tx.date)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Amount & Delete Button */}
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${
                    isIncome ? 'text-emerald-400' : 'text-slate-200'
                  }`}>
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                  
                  <button
                    onClick={() => handleDelete(tx.id, tx.type)}
                    disabled={isDeleting}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/25 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50 cursor-pointer shrink-0"
                    title="Delete record"
                  >
                    {isDeleting ? (
                      <div className="h-4 w-4 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}