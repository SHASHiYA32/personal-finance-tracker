"use client";

import { useEffect, useMemo, useState } from "react";
import { useExpenses } from "@/hooks/use-expenses";
import { useIncome } from "@/hooks/use-income";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/helpers/currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

type FilterType = "all" | "income" | "expense";

export default function ExpenseCalendar() {
  const { expenses, fetchExpenses } = useExpenses();
  const { incomes, fetchIncomes } = useIncome();

  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    fetchExpenses(currentMonth + 1, currentYear);
    fetchIncomes(currentMonth + 1, currentYear);
  }, [currentMonth, currentYear, fetchExpenses, fetchIncomes]);

  const expenseMap = useMemo(() => {
    const map: Record<string, any[]> = {};

    expenses.forEach((exp) => {
      const key = new Date(exp.date).toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(exp);
    });

    return map;
  }, [expenses]);

  const incomeMap = useMemo(() => {
    const map: Record<string, any[]> = {};

    incomes.forEach((inc: any) => {
      const key = new Date(inc.date).toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(inc);
    });

    return map;
  }, [incomes]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const selectedKey = selectedDate?.toDateString();

  const selectedExpenses = selectedKey ? expenseMap[selectedKey] || [] : [];

  const selectedIncome = selectedKey ? incomeMap[selectedKey] || [] : [];

  const filteredExpenses =
    filter === "all" || filter === "expense" ? selectedExpenses : [];

  const filteredIncome =
    filter === "all" || filter === "income" ? selectedIncome : [];

  const totalExpense = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0,
  );

  const totalIncome = filteredIncome.reduce(
    (sum, i) => sum + Number(i.amount),
    0,
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 glass-panel p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth((m) => m - 1)}
            className="text-sm text-slate-400 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <h2 className="text-white font-bold">
            {format(new Date(currentYear, currentMonth), "MMMM yyyy")}
          </h2>

          <button
            onClick={() => setCurrentMonth((m) => m + 1)}
            className="text-sm text-slate-400 hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Week labels */}
        <div className="grid grid-cols-7 text-center text-xs text-slate-500 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={i} />
          ))}

          {daysArray.map((day) => {
            const date = new Date(currentYear, currentMonth, day);
            const key = date.toDateString();

            const hasExpense = !!expenseMap[key]?.length;
            const hasIncome = !!incomeMap[key]?.length;

            const isSelected = selectedKey === key;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(date)}
                className={`relative p-3 rounded-xl border transition-all
                  ${
                    isSelected
                      ? "bg-indigo-500/20 border-indigo-500/40 text-white"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  }`}
              >
                <span className="text-sm font-medium">{day}</span>

                {/* DOTS */}
                {(hasIncome || hasExpense) && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                    {hasIncome && (
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    )}
                    {hasExpense && (
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: DETAILS */}
      <div className="glass-panel p-4 lg:col-span-2">
        <div className="flex flex-row justify-between">
          <h3 className="text-white font-bold mb-2">
            {selectedDate?.toDateString()}
          </h3>

          {/* FIXED SELECT */}
          <div className="flex flex-row items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />

            <Select
              value={filter}
              onValueChange={(value: FilterType | null) => {
                if (!value) return;
                setFilter(value);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="expense">Expenses</SelectItem>
                <SelectItem value="income">Incomes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Expense:{" "}
          <span className="text-red-400 font-bold">
            {formatCurrency(totalExpense)}
          </span>{" "}
          | Income:{" "}
          <span className="text-green-400 font-bold">
            {formatCurrency(totalIncome)}
          </span>
        </p>

        {/* LIST */}
        {filteredExpenses.length === 0 && filteredIncome.length === 0 ? (
          <p className="text-sm text-slate-500">No transactions</p>
        ) : (
          <div className="space-y-2">
            {/* INCOME */}
            {filteredIncome.map((inc) => (
              <div
                key={inc.id}
                className="p-2 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex justify-between">
                  <p className="text-sm text-white">{inc.source}</p>
                  <p className="text-sm text-green-400">
                    +{formatCurrency(Number(inc.amount))}
                  </p>
                </div>
              </div>
            ))}

            {/* EXPENSE */}
            {filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-2 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex justify-between">
                  <p className="text-sm text-white">{exp.title}</p>
                  <p className="text-sm text-rose-400">
                    -{formatCurrency(Number(exp.amount))}
                  </p>
                </div>

                <p className="text-[10px] text-slate-400 uppercase">
                  {exp.category}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
