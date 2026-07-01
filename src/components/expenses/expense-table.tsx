"use client";

import { useState } from "react";
import { Expense } from "@/types/expense";
import { formatCurrency } from "@/lib/helpers/currency";
import { formatDate } from "@/lib/helpers/date";
import {
  Trash2,
  Search,
  ArrowUpDown,
  Filter,
  Calendar,
  DollarSign,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "../ui/input";

interface ExpenseTableProps {
  expenses: Expense[];
  onDelete: (id: string) => Promise<void>;
  loading: boolean;
}

const CATEGORIES = [
  "All",
  "Food",
  "Rent/Housing",
  "Transport",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Other",
];

type SortKey = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

export default function ExpenseTable({
  expenses,
  onDelete,
  loading,
}: ExpenseTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortKey>("date-desc");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter & Search Logic
  const filteredExpenses = expenses
    .filter((exp) => {
      const matchesSearch =
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.note && exp.note.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory =
        selectedCategory === "All" || exp.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === "date-asc") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === "amount-desc") {
        return Number(b.amount) - Number(a.amount);
      }
      if (sortBy === "amount-asc") {
        return Number(a.amount) - Number(b.amount);
      }
      return 0;
    });

  return (
    <div className="glass-panel p-6 w-full space-y-6">
      {/* Controls Container */}
      <div className="flex flex-col gap-4">
        {/* Search and Sort controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-2 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search expenses description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 glass-input"
            />
          </div>

          <div className="flex flex-row items-center gap-2">
            <ArrowUpDown className="h-6 w-6 text-slate-500 z-10 pointer-events-none" />

            <Select
              value={sortBy}
              onValueChange={(value) => {
                if (value) {
                  setSortBy(value as SortKey);
                }
              }}
            >
              <SelectTrigger className="w-full pl-10 pr-8 py-3.5 glass-input bg-slate-900 font-medium text-xs uppercase tracking-wider">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>

              <SelectContent className="bg-slate-900 border-white/10 backdrop-blur-xl">
                <SelectItem value="date-desc">Latest Date</SelectItem>
                <SelectItem value="date-asc">Oldest Date</SelectItem>
                <SelectItem value="amount-desc">Highest Cost</SelectItem>
                <SelectItem value="amount-asc">Lowest Cost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Pills Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Filter className="h-4.5 w-4.5 text-slate-500 shrink-0 mr-1 hidden md:block" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expense List display */}
      <div className="space-y-3.5">
        {loading && expenses.length === 0 ? (
          <div className="py-12 flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No expenses found matching the criteria.
          </div>
        ) : (
          filteredExpenses.map((exp) => {
            const isDeleting = deletingId === exp.id;

            return (
              <div
                key={exp.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.03] hover:border-white/10 transition-all duration-200 gap-3 group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-sm font-semibold text-white truncate pr-4">
                      {exp.title}
                    </h5>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] text-slate-400">
                      <span className="font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {exp.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        {formatDate(exp.date)}
                      </span>
                    </div>
                    {exp.note && (
                      <p className="text-xs text-slate-400 mt-2 bg-white/5 border border-white/5 rounded-lg p-2 max-w-xl font-normal leading-relaxed">
                        {exp.note}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-white/5 sm:border-0 pt-3 sm:pt-0">
                  <span className="text-base font-bold text-white leading-none">
                    {formatCurrency(exp.amount)}
                  </span>

                  <button
                    onClick={() => handleDelete(exp.id)}
                    disabled={isDeleting}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50 cursor-pointer shrink-0"
                    title="Delete item"
                  >
                    {isDeleting ? (
                      <div className="h-4.5 w-4.5 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-4.5 w-4.5" />
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
