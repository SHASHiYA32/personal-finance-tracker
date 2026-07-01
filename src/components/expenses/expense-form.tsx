'use client';

import { useState } from 'react';
import { Plus, HelpCircle } from 'lucide-react';

interface ExpenseFormProps {
  onSubmit: (data: {
    title: string;
    amount: number;
    category: string;
    date: string;
    note?: string | null;
  }) => Promise<void>;
}

const CATEGORIES = [
  'Food',
  'Rent/Housing',
  'Transport',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Other',
];

export default function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !category || !date) {
      setError('Please fill in all required fields.');
      return;
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        title,
        amount: numericAmount,
        category,
        date: new Date(date).toISOString(),
        note: note ? note : null,
      });

      // Reset Form
      setTitle('');
      setAmount('');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit expense');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-panel p-6 w-full relative overflow-hidden">
      <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
        <Plus className="h-4.5 w-4.5 text-indigo-400" />
        <span>Record New Expense</span>
      </h3>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Expense Description *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Grocery Store, Rent, Uber"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full glass-input"
          />
        </div>

        {/* Grid for Amount & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Amount (USD) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full glass-input"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full glass-input appearance-none bg-slate-900"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date picker */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Transaction Date *
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full glass-input"
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Additional Notes (Optional)
          </label>
          <textarea
            placeholder="Add brief details..."
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full glass-input resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full glass-button-primary mt-2"
        >
          {submitting ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Plus className="h-4 w-4" />
              <span>Add Expense Entry</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
