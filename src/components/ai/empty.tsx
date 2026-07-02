"use client";

import { Sparkles } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <div className="h-16 w-16 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-4">
        <Sparkles className="h-8 w-8 text-indigo-400" />
      </div>

      <h2 className="text-xl font-bold text-white">AI Finance Assistant</h2>

      <p className="text-slate-400 mt-3 max-w-sm">
        I can help manage your budgets, expenses, income, reports and answer
        questions about this application.
      </p>

      <div className="flex flex-wrap gap-2 mt-6 justify-center">
        <span className="glass-panel px-3 py-1 rounded-full text-xs">
          Add Budget
        </span>

        <span className="glass-panel px-3 py-1 rounded-full text-xs">
          Add Expense
        </span>

        <span className="glass-panel px-3 py-1 rounded-full text-xs">
          Monthly Report
        </span>

        <span className="glass-panel px-3 py-1 rounded-full text-xs">
          Calendar
        </span>
      </div>
    </div>
  );
}
