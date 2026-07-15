"use client";

import { useState, useEffect } from "react";
import { useBudget } from "@/hooks/use-budget";
import { useExpenses } from "@/hooks/use-expenses";
import { formatCurrency } from "@/lib/helpers/currency";
import {
  Sparkles,
  PiggyBank,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  CirclePlus,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddCategory from "@/components/category/add-category-form";
import { createClient } from "@/lib/supabase/client";
import { Category } from "@/types/category";

export default function BudgetPage() {
  const supabase = createClient();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const {
    budgets,
    fetchBudgets,
    setBudget,
    deleteBudget,
    loading: budgetsLoading,
  } = useBudget();
  const { expenses, fetchExpenses, loading: expensesLoading } = useExpenses();

  // Dynamic state to hold user categories from the database
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);

  // Form State
  const [category, setCategory] = useState(""); // Default to empty string initially
  const [limit, setLimit] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // 1. Fetch Auth Profile
  useEffect(() => {
    async function getProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        console.log("User Found: ", user);
      }
    }
    getProfile();
  }, [supabase]);

  // 2. Fetch User-Specific Categories from DB
  const fetchCategories = async () => {
    if (!userId) return;
    setCategoriesLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId)
        .order("category", { ascending: true });

      if (error) throw error;
      setCategories(data || []);

      // Auto-select the first available category if form category is currently blank
      if (data && data.length > 0 && !category) {
        setCategory(data[0].category);
      }
    } catch (err: any) {
      console.error("Error fetching categories:", err.message);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Re-fetch category lists whenever the user shifts or closes the add-category modal sheet
  useEffect(() => {
    if (userId) {
      fetchCategories();
    }
  }, [userId, isPremiumModalOpen]);

  useEffect(() => {
    fetchBudgets(currentMonth, currentYear);
    fetchExpenses(currentMonth, currentYear);
  }, [currentMonth, currentYear, fetchBudgets, fetchExpenses]);

  // Aggregate Expenses by Category Textual Name (Resolves ID -> Text Name)
  const categorySpending = expenses.reduce(
    (acc, exp) => {
      // Look up the database category matching the expense category ID
      const matchedCategory = categories.find(
        (c) => String(c.id) === String(exp.category),
      );

      // If a match is found, use its text name (e.g., "Food"), otherwise fall back to raw field value
      const keyName = matchedCategory ? matchedCategory.category : exp.category;

      acc[keyName] = (acc[keyName] || 0) + Number(exp.amount);
      return acc;
    },
    {} as Record<string, number>,
  );

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !limit) {
      setError("Please fill in all fields.");
      return;
    }

    const numericLimit = Number(limit);
    if (isNaN(numericLimit) || numericLimit <= 0) {
      setError("Budget limit must be a positive number.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await setBudget(category, numericLimit, currentMonth, currentYear);
      setLimit("");
    } catch (err: any) {
      setError(err.message || "Failed to configure budget.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickSet = (cat: string) => {
    setCategory(cat);
    const limitInput = document.getElementById("budget-limit-input");
    if (limitInput) limitInput.focus();
  };

  const loading = budgetsLoading || expensesLoading || categoriesLoading;

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-pink-400 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>Budget Management</span>
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold text-white mt-1">
            Category Limits
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Configure monthly targets per category and monitor your spending
            thresholds to prevent overspending.
          </p>
        </div>

        <div className="glass-panel py-3 px-5 border-white/5 bg-white/[0.02] flex items-center gap-3 self-start md:self-auto shrink-0">
          <div className="h-9 w-9 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center">
            <PiggyBank className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Total Limit
            </p>
            <p className="text-lg font-bold text-white mt-1.5 leading-none">
              {formatCurrency(
                budgets.reduce((sum, b) => sum + Number(b.monthly_limit), 0),
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form to set budget */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 w-full relative overflow-hidden">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-pink-400" />
              <span>Configure Target Limit</span>
            </h3>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSetBudget} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Budget Category
                </label>
                <Select
                  value={category}
                  onValueChange={(value) => {
                    if (value) {
                      setCategory(value);
                    }
                  }}
                >
                  <SelectTrigger className="w-full glass-input border-white/10 bg-white/5 backdrop-blur-md">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>

                  <SelectContent className="border-white/10 bg-slate-900/95 backdrop-blur-xl">
                    {categories.length === 0 ? (
                      <div className="text-xs text-slate-400 p-2 text-center">
                        No categories found. Click 'Add Category' to make one.
                      </div>
                    ) : (
                      categories.map((cat) => (
                        <SelectItem
                          key={cat.id}
                          value={cat.category}
                          className="focus:bg-white/10"
                        >
                          {cat.category}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Monthly Limit Amount (USD)
                </label>
                <input
                  id="budget-limit-input"
                  type="number"
                  step="1"
                  min="1"
                  required
                  placeholder="e.g. 500, 1000"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full glass-input"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || categories.length === 0}
                className="w-full glass-button-primary bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 shadow-pink-500/20 hover:shadow-pink-500/35 border-none mt-2"
              >
                {submitting ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 text-white" />
                    <span className="text-white">Save Category Budget</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Budget lists & progress bars */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 w-full space-y-6">
            <div className="w-full flex flex-row justify-between items-center">
              <h4 className="text-sm font-bold text-slate-200">
                Budget Progress Tracker
              </h4>
              <button
                onClick={() => setIsPremiumModalOpen(true)}
                className="px-4 glass-button-primary text-sm flex flex-row justify-between items-center gap-2"
              >
                <CirclePlus className="h-4 w-4" />
                <span>Add Category</span>
              </button>

              <AddCategory
                isOpen={isPremiumModalOpen}
                onClose={() => setIsPremiumModalOpen(false)}
                userId={userId}
              />
            </div>

            <div className="space-y-6">
              {loading && budgets.length === 0 ? (
                <div className="py-12 flex items-center justify-center">
                  <div className="h-8 w-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-500 border border-dashed border-white/5 rounded-xl">
                  Please add some categories first to configure and track
                  budgets.
                </div>
              ) : (
                categories.map((catItem) => {
                  const cat = catItem.category;
                  const budgetItem = budgets.find((b) => b.category === cat);
                  const spend = categorySpending[cat] || 0;
                  const hasBudget = !!budgetItem;
                  const limitVal = budgetItem
                    ? Number(budgetItem.monthly_limit)
                    : 0;

                  const percent = limitVal > 0 ? (spend / limitVal) * 100 : 0;

                  let barColor = "bg-emerald-500";
                  let textColor = "text-emerald-400";
                  let bgGlow = "rgba(16, 185, 129, 0.15)";
                  let statusIcon = (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  );

                  if (percent >= 100) {
                    barColor = "bg-rose-500";
                    textColor = "text-rose-400";
                    bgGlow = "rgba(239, 68, 68, 0.15)";
                    statusIcon = (
                      <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                    );
                  } else if (percent >= 75) {
                    barColor = "bg-amber-500";
                    textColor = "text-amber-400";
                    bgGlow = "rgba(245, 158, 11, 0.15)";
                    statusIcon = (
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                    );
                  }

                  return (
                    <div
                      key={catItem.id}
                      className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] hover:border-white/10 transition-all duration-200 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          {hasBudget ? (
                            statusIcon
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-slate-600 shrink-0" />
                          )}
                          <span className="text-sm font-semibold text-white truncate">
                            {cat}
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          {hasBudget ? (
                            <span className="text-xs font-semibold text-slate-300">
                              <span className="text-white font-bold">
                                {formatCurrency(spend)}
                              </span>
                              <span className="text-slate-500 font-medium">
                                {" "}
                                / {formatCurrency(limitVal)}
                              </span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleQuickSet(cat)}
                              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-1 rounded-lg transition-all"
                            >
                              Setup Budget
                            </button>
                          )}
                        </div>
                      </div>

                      {hasBudget && (
                        <div className="space-y-1.5">
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, percent)}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className={`h-full ${barColor} rounded-full`}
                              style={{ boxShadow: `0 0 8px ${bgGlow}` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500 font-semibold uppercase tracking-wider">
                              Usage: {percent.toFixed(0)}%
                            </span>

                            <div className="flex items-center gap-2">
                              {percent >= 100 ? (
                                <span className="text-rose-400 font-semibold uppercase tracking-wider">
                                  Over Budget
                                </span>
                              ) : percent >= 75 ? (
                                <span className="text-amber-400 font-semibold uppercase tracking-wider">
                                  Approaching Limit
                                </span>
                              ) : (
                                <span className="text-emerald-400 font-semibold uppercase tracking-wider">
                                  On Track
                                </span>
                              )}

                              <button
                                onClick={() => deleteBudget(budgetItem.id)}
                                className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                                title="Remove budget category"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
