"use client";

import { useState, useEffect } from "react";
import { useIncome } from "@/hooks/use-income";
import { formatCurrency } from "@/lib/helpers/currency";
import { formatDate } from "@/lib/helpers/date";
import { createClient } from "@/lib/supabase/client";
import {
  Sparkles,
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  Search,
  ArrowUpDown,
  Wallet,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortKey = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

export default function IncomePage() {
  const supabase = createClient();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const { incomes, loading, fetchIncomes, addIncome, deleteIncome } =
    useIncome();

  // Vault Selection States
  const [vaults, setVaults] = useState<any[]>([]);
  const [vaultsLoading, setVaultsLoading] = useState(true);

  // Form State
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [vaultId, setVaultId] = useState<string>("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Table State
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("date-desc");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch Available Vaults for Selector
  useEffect(() => {
    async function loadUserVaults() {
      try {
        setVaultsLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch user memberships to restrict to shared family vaults
        const { data: memberships } = await supabase
          .from("vault_members")
          .select("vault_id")
          .eq("user_id", user.id);

        if (memberships && memberships.length > 0) {
          const ids = memberships.map((m) => m.vault_id);
          const { data: vaultsData } = await supabase
            .from("vaults")
            .select("id, name")
            .in("id", ids);

          if (vaultsData) setVaults(vaultsData);
        }
      } catch (err) {
        console.error("Failed to load vaults for selection menu:", err);
      } finally {
        setVaultsLoading(false);
      }
    }
    loadUserVaults();
  }, [supabase]);

  useEffect(() => {
    fetchIncomes(currentMonth, currentYear);
  }, [currentMonth, currentYear, fetchIncomes]);

  const totalIncome = incomes.reduce(
    (acc, curr) => acc + Number(curr.amount),
    0,
  );

  // Handlers
  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !amount || !date) {
      setFormError("Please fill in all required fields.");
      return;
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setFormError("Amount must be a positive number.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await addIncome({
        source,
        amount: numericAmount,
        date: new Date(date).toISOString(),
        vault_id: vaultId && vaultId !== "none" ? vaultId : null, // Connects income directly to chosen Vault
      });

      // Reset Form
      setSource("");
      setAmount("");
      setVaultId("");
      setDate(new Date().toISOString().split("T")[0]);
    } catch (err: any) {
      setFormError(err.message || "Failed to add income entry.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteIncome(id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredIncomes = incomes
    .filter((inc) =>
      inc.source.toLowerCase().includes(searchTerm.toLowerCase()),
    )
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
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>Income Streams</span>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-xl md:text-2xl font-extrabold text-white mt-1">
              Manage your earnings.
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Log your salaries, side hustles, investment payouts, and keep your
              incoming cash flow history clean.
            </p>
          </div>
        </div>

        <div className="glass-panel py-3 px-5 border-white/5 bg-white/[0.02] flex items-center gap-3 self-start md:self-auto shrink-0">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Month Income
            </p>
            <p className="text-lg font-bold text-white mt-1.5 leading-none">
              {formatCurrency(totalIncome)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 gap-3">
          <div className="glass-panel p-6 w-full relative overflow-hidden">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-emerald-400" />
              <span>Record New Income</span>
            </h3>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddIncome} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Income Source *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Salary, Freelance project, Dividends"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full glass-input"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Amount Earned (LKR) *
                </label>
                <Input
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

              {/* Dynamic Vault Selection Menu */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Link to Family Vault (Optional)
                </label>
                <Select
                  value={vaultId}
                  onValueChange={(val) => setVaultId(val || "none")}
                  disabled={vaultsLoading}
                >
                  <SelectTrigger className="w-full glass-input text-left text-xs text-white">
                    <SelectValue>
                      {vaultsLoading
                        ? "Loading Vaults..."
                        : vaults.find((v) => v.id === vaultId)?.name ||
                          "Personal Income (No Vault)"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent className="bg-slate-950 border-white/10 text-white font-medium text-xs">
                    <SelectItem
                      value="none"
                      className="focus:bg-white/10 text-slate-400"
                    >
                      Personal Income (No Vault)
                    </SelectItem>
                    {vaults.map((v) => (
                      <SelectItem
                        key={v.id}
                        value={v.id}
                        className="focus:bg-white/10 text-white"
                      >
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Receipt Date *
                </label>
                <Input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full glass-input"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full glass-button-primary bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/20 hover:shadow-emerald-500/35 border-none mt-2"
              >
                {submitting ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 text-white" />
                    <span className="text-white">Add Income Entry</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass-panel p-6 w-full space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-2 h-4 w-4 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Search income sources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 glass-input"
                />
              </div>

              <div className="flex flex-row items-center gap-2">
                <ArrowUpDown className="h-5 w-5 text-slate-500" />
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as SortKey)}
                >
                  <SelectTrigger className="pl-10 pr-8 py-3.5 glass-input bg-slate-900 font-medium text-xs uppercase tracking-wider">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>

                  <SelectContent className="bg-slate-900 border-white/10 backdrop-blur-xl">
                    <SelectItem value="date-desc">Latest Date</SelectItem>
                    <SelectItem value="date-asc">Oldest Date</SelectItem>
                    <SelectItem value="amount-desc">Highest Amount</SelectItem>
                    <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Income List */}
            <div className="space-y-3.5">
              {loading && incomes.length === 0 ? (
                <div className="py-12 flex items-center justify-center">
                  <div className="h-8 w-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              ) : filteredIncomes.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  No income history recorded for this month.
                </div>
              ) : (
                filteredIncomes.map((inc) => {
                  const isDeleting = deletingId === inc.id;

                  return (
                    <div
                      key={inc.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.03] hover:border-white/10 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <Wallet className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-sm font-semibold text-white truncate pr-4">
                            {inc.source}
                          </h5>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            <span className="font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              Income
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-slate-500" />
                              {formatDate(inc.date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-base font-bold text-emerald-400">
                          +{formatCurrency(inc.amount)}
                        </span>

                        <button
                          onClick={() => handleDelete(inc.id)}
                          disabled={isDeleting}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all group-hover:opacity-100 focus:opacity-100 disabled:opacity-50 cursor-pointer shrink-0"
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
        </div>
      </div>
    </div>
  );
}
