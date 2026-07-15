"use client";

import { useState } from "react";
import { Expense } from "@/types/expense";
import { Category } from "@/types/category";
import { formatCurrency } from "@/lib/helpers/currency";
import { formatDate } from "@/lib/helpers/date";
import {
  Trash2,
  Search,
  ArrowUpDown,
  Calendar,
  DollarSign,
  Users,
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
  categories: Category[];
  onDelete: (id: string) => Promise<void>;
  loading: boolean;
}

type SortKey = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

export default function ExpenseTable({
  expenses,
  categories,
  onDelete,
  loading,
}: ExpenseTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  // "All" keeps its string value, otherwise holds the string ID of the category
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

  // Helper to translate a category ID to its readable string label name
  const getCategoryName = (catId: string) => {
    const matched = categories.find((c) => String(c.id) === String(catId));
    return matched ? matched.category : "Other";
  };

  // Filter & Search Logic
  const filteredExpenses = expenses
    .filter((exp) => {
      const matchesSearch =
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.note && exp.note.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === "All" || String(exp.category) === selectedCategory;

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
                if (value) setSortBy(value as SortKey);
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

        {/* Dynamic Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === "All"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200"
            }`}
          >
            All
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(String(cat.id))}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === String(cat.id)
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat.category}
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
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-white tracking-wide group-hover:text-indigo-400 transition-colors">
                        {exp.title}
                      </h4>
                      <span className="text-[10px] font-mono text-indigo-400 font-semibold uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">
                        {getCategoryName(exp.category)}
                      </span>

                      {/* NEW: Shared Family Tag Pill */}
                      {exp.vault_id && (
                        <span className="text-[10px] font-sans text-pink-400 font-bold bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/10 flex items-center gap-1">
                          <Users className="h-2.5 w-2.5" /> Shared Vault
                        </span>
                      )}
                    </div>
                    {exp.note && (
                      <p className="text-xs text-slate-400 py-1 max-w-xl font-normal italic leading-relaxed">
                        <span>note: </span>
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
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all opacity-50 group-hover:opacity-100 focus:opacity-100 disabled:opacity-30 cursor-pointer shrink-0"
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
