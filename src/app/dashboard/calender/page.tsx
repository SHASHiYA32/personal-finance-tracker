import { Sparkles } from "lucide-react";

import ExpensesCalendarPage from "@/components/expenses/calander";

export default function calander() {
  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-yellow-500 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>Expense Calendar</span>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xl md:text-2xl font-extrabold text-white mt-1">
              Track your expences in by Date.
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Visualize your daily spending patterns, review past transactions,
              and quickly identify high-spend days with a calendar-based view.
            </p>
          </div>
        </div>
      </div>
      <ExpensesCalendarPage />
    </div>
  );
}
