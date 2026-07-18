"use client";

import { useState, useEffect } from "react";
import { Plus, User, Users } from "lucide-react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/types/category";
import { getUserVaults, Vault } from "@/types/vaults";

interface ExpenseFormProps {
  onSubmit: (data: {
    title: string;
    amount: number;
    category: string;
    date: string;
    note?: string | null;
    vault_id?: string | null;
  }) => Promise<void>;
  categories: Category[];
  categoriesLoading?: boolean;
}

export default function ExpenseForm({
  onSubmit,
  categories,
  categoriesLoading,
}: ExpenseFormProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vault state engine
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [selectedVaultId, setSelectedVaultId] = useState<string>("personal");

  useEffect(() => {
    async function fetchVaultOptions() {
      try {
        const userVaults = await getUserVaults();
        if (userVaults) setVaults(userVaults);
      } catch (err) {
        console.error("Failed to load vault drop options:", err);
      }
    }
    fetchVaultOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !category || !date) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        title,
        amount: parseFloat(amount),
        category,
        date,
        note: note.trim() || null,
        vault_id: selectedVaultId === "personal" ? null : selectedVaultId,
      });

      // Reset Form fields safely
      setTitle("");
      setAmount("");
      setCategory("");
      setNote("");
      setSelectedVaultId("personal");
    } catch (err: any) {
      setError(err.message || "Failed to create expense entry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <h2 className="text-sm font-bold text-white tracking-wide">
          Record Expense
        </h2>
        <span className="text-[10px] font-mono text-slate-500">
          * Required fields
        </span>
      </div>

      {error && (
        <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
          {error}
        </div>
      )}

      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Expense Title / Item <span className="text-red-400">*</span>
        </label>
        <Input
          type="text"
          required
          placeholder="e.g. Weekly Groceries, Server Costs"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full glass-input"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Amount ($) <span className="text-red-400">*</span>
          </label>
          <Input
            type="number"
            step="0.01"
            required
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full glass-input"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Category <span className="text-red-400">*</span>
          </label>
          <Select
            value={category}
            onValueChange={(val) => setCategory(val || "")}
            disabled={categoriesLoading}
          >
            <SelectTrigger className="w-full glass-input">
              <SelectValue placeholder="Select category">
                {category
                  ? categories.find((c) => String(c.id) === category)?.category
                  : "Select category"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-white/10 text-white">
              {categories.map((cat) => (
                <SelectItem
                  key={cat.id}
                  value={String(cat.id)}
                  className="focus:bg-white/10 text-xs"
                >
                  {cat.category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {vaults.length > 0 && (
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Users className="h-3 w-3 text-indigo-400" /> Account Context /
            Allocation Pool
          </label>
          <Select
            value={selectedVaultId}
            onValueChange={(val) => setSelectedVaultId(val || "")}
          >
            <SelectTrigger className="w-full glass-input">
              <SelectValue placeholder="Select Allocation Target">
                {/* Dynamic Label Translator */}
                {selectedVaultId === "personal" || selectedVaultId === ""
                  ? "Personal Account Balance"
                  : `Collaborative Vault: ${vaults.find((v) => v.id === selectedVaultId)?.name || "Loading Vault..."}`}
              </SelectValue>
            </SelectTrigger>

            <SelectContent className="bg-slate-950 border-white/10 text-white">
              <SelectItem
                value="personal"
                className="focus:bg-white/10 text-xs"
              >
                <User /> Personal Account Balance
              </SelectItem>
              {vaults.map((vault) => (
                <SelectItem
                  key={vault.id}
                  value={vault.id}
                  className="focus:bg-white/10 text-xs"
                >
                  <Users /> Collaborative Vault: {vault.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Transaction Date <span className="text-red-400">*</span>
        </label>
        <Input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full glass-input"
        />
      </div>

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
        disabled={submitting || categories.length === 0}
        className="w-full glass-button-primary mt-2"
      >
        {submitting ? (
          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Plus className="h-4.5 w-4.5" />
            <span>Record Expense</span>
          </>
        )}
      </button>
    </form>
  );
}
