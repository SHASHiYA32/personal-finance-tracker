"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  Shield,
  Target,
  Plus,
  Users,
  UserPlus,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Trophy,
  Activity,
  UserMinus,
  BarChart3,
  CircleCheckIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  createVault,
  joinVault,
  Vault,
} from "@/types/vaults";

export default function FamilyVaultPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeVault, setActiveVault] = useState<
    (Vault & { vault_members: any[] }) | null
  >(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [vaultName, setVaultName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [sharedTransactions, setSharedTransactions] = useState<any[]>([]);
  const [totalVaultIncome, setTotalVaultIncome] = useState<number>(0);
  const [totalVaultExpense, setTotalVaultExpense] = useState<number>(0);

  useEffect(() => {
    loadVaultData();
  }, []);

  useEffect(() => {
    if (!activeVault?.id) return;

    const channel = supabase
      .channel(`live-vault-mutations-${activeVault.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
          filter: `vault_id=eq.${activeVault.id}`,
        },
        () => loadVaultTransactions(activeVault.id),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "income",
          filter: `vault_id=eq.${activeVault.id}`,
        },
        () => loadVaultTransactions(activeVault.id),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vault_members",
          filter: `vault_id=eq.${activeVault.id}`,
        },
        () => loadVaultData(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeVault?.id]);

  async function loadVaultData() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const { data: myMemberships, error: membershipError } = await supabase
        .from("vault_members")
        .select("vault_id")
        .eq("user_id", user.id);

      if (membershipError) throw membershipError;

      if (!myMemberships || myMemberships.length === 0) {
        setActiveVault(null);
        setLoading(false);
        return;
      }

      const myVaultIds = myMemberships.map((m) => m.vault_id);

      const { data: vaults, error: vaultError } = await supabase
        .from("vaults")
        .select(
          `
          *,
          vault_members (
            id,
            user_id,
            role,
            joined_at
          )
        `,
        )
        .in("id", myVaultIds);

      if (vaultError) throw vaultError;

      if (vaults && vaults.length > 0) {
        const targetVault = vaults[0];

        const userIds = targetVault.vault_members.map((m: any) => m.user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, display_name, email")
          .in("id", userIds);

        const profileMap = new Map();
        profilesData?.forEach((p) => profileMap.set(p.id, p));

        const combinedMembers = targetVault.vault_members.map((member: any) => {
          const profile = profileMap.get(member.user_id);
          let resolvedName = "";

          if (profile) {
            if (profile.display_name && profile.display_name.trim() !== "") {
              resolvedName = profile.display_name;
            } else if (profile.email && profile.email.trim() !== "") {
              resolvedName = profile.email.split("@")[0];
            }
          }

          if (!resolvedName) {
            if (member.user_id === currentUserId) {
              supabase.auth.getUser().then(({ data: { user } }) => {
                const metaName =
                  user?.user_metadata?.full_name ||
                  user?.user_metadata?.name ||
                  user?.email?.split("@")[0];
                if (metaName) {
                  member.resolvedName = metaName;
                }
              });
            }
            resolvedName = `User_${member.user_id.slice(0, 5)}`;
          }

          return {
            ...member,
            resolvedName: resolvedName,
            profiles: profile || null,
          };
        });

        setActiveVault({
          ...targetVault,
          vault_members: combinedMembers,
        });

        await loadVaultTransactions(targetVault.id);
      } else {
        setActiveVault(null);
      }
    } catch (err) {
      console.error("Failed to load family vaults", err);
      toast.error("Failed to load shared alliance vault arrays.", {
        className: "toast-glass",
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadVaultTransactions(vaultId: string) {
    try {
      const { data: expenses, error: expError } = await supabase
        .from("expenses")
        .select("id, title, amount, category, date, user_id")
        .eq("vault_id", vaultId);

      if (expError) console.error("Error fetching expenses:", expError);

      const { data: incomeData, error: incError } = await supabase
        .from("income")
        .select("id, source, amount, date, user_id")
        .eq("vault_id", vaultId);

      if (incError) console.error("Error fetching income:", incError);

      const totalInc =
        incomeData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const totalExp =
        expenses?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;

      setTotalVaultIncome(totalInc);
      setTotalVaultExpense(totalExp);

      const combined = [
        ...(expenses?.map((e) => ({
          ...e,
          flow: "expense",
        })) || []),
        ...(incomeData?.map((i) => ({
          id: i.id,
          title: i.source || "Income Stream",
          amount: i.amount,
          date: i.date,
          user_id: i.user_id,
          category: "Income Stream",
          flow: "income",
        })) || []),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const userIds = Array.from(new Set(combined.map((tx) => tx.user_id)));

      if (userIds.length > 0) {
        const { data: txProfiles } = await supabase
          .from("profiles")
          .select("id, display_name, email")
          .in("id", userIds);

        const txProfileMap = new Map();
        txProfiles?.forEach((p) => txProfileMap.set(p.id, p));

        const enrichedTransactions = combined.map((tx) => {
          const profile = txProfileMap.get(tx.user_id);
          let resolvedName = "";

          if (profile) {
            if (profile.display_name && profile.display_name.trim() !== "") {
              resolvedName = profile.display_name;
            } else if (profile.email && profile.email.trim() !== "") {
              resolvedName = profile.email.split("@")[0];
            }
          }

          if (!resolvedName) {
            resolvedName =
              tx.user_id === currentUserId
                ? "You"
                : `User_${tx.user_id.slice(0, 5)}`;
          }

          const displayCategory =
            typeof tx.category === "object" && tx.category !== null
              ? (tx.category as any).category
              : tx.category;

          return {
            ...tx,
            category: displayCategory,
            resolvedName,
            profiles: profile || null,
          };
        });

        setSharedTransactions(enrichedTransactions);
      } else {
        setSharedTransactions([]);
      }
    } catch (err) {
      console.error("Failed loading vault transactions:", err);
    }
  }

  const handleRemoveMember = async (
    memberId: string,
    displayName: string,
    userId: string,
  ) => {
    if (userId === currentUserId) {
      toast.error(
        "As the owner, you cannot remove yourself from the vault directly.",
        {
          className: "toast-glass",
        },
      );
      return;
    }

    // Instead of window.confirm, trigger an interactive toast
    toast(`Remove "${displayName}"?`, {
      description:
        "This will remove them from the Family Alliance immediately.",
      className: "toast-glass",
      action: {
        label: "Confirm Removal",
        onClick: async () => {
          try {
            setActionLoading(true);
            const { error } = await supabase
              .from("vault_members")
              .delete()
              .eq("id", memberId);

            if (error) throw error;

            toast.success(`"${displayName}" was successfully removed.`, {
              className: "toast-glass",
            });
            await loadVaultData();
          } catch (err) {
            console.error(err);
            toast.error("Failed to remove member.", {
              className: "toast-glass",
            });
          } finally {
            setActionLoading(false);
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => console.log("Removal cancelled"),
      },
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await createVault(vaultName, Number(targetAmount), targetDate);
      setVaultName("");
      setTargetAmount("");
      setTargetDate("");
      setIsCreating(false);

      toast.success(
        "Vault Established: Your family safe network is now completely active.",
        {
          className: "toast-glass",
        },
      );
      await loadVaultData();
    } catch (err) {
      toast.error("Failed to build your cooperative vault matrix.", {
        className: "toast-glass",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await joinVault(joinCode);
      setJoinCode("");
      setIsJoining(false);

      toast.success(
        "Syndicate Synced: Successfully authenticated entry to the household safe.",
        {
          className: "toast-glass",
        },
      );
      await loadVaultData();
    } catch (err) {
      toast.error(
        "Invalid Vault Token or you are already a member of this network.",
        {
          className: "toast-glass",
        },
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Compute pooled dynamic savings
  const currentSavings = totalVaultIncome - totalVaultExpense;

  const progressPercent = activeVault
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round((currentSavings / activeVault.target_amount) * 100),
        ),
      )
    : 0;

  const isCurrentUserOwner = activeVault?.vault_members.some(
    (m) => m.user_id === currentUserId && m.role === "owner",
  );

  // Compute scale heights dynamically for the comparison visual bars
  const maxFlowValue = Math.max(totalVaultIncome, totalVaultExpense, 1);
  const incomeBarHeight = `${Math.max(12, (totalVaultIncome / maxFlowValue) * 100)}%`;
  const expenseBarHeight = `${Math.max(12, (totalVaultExpense / maxFlowValue) * 100)}%`;

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 selection:bg-indigo-500 selection:text-white">
      <div className="absolute top-10 left-10 -z-10 w-[400px] h-[400px] rounded-full blur-[150px] opacity-10 bg-indigo-500" />
      <div className="absolute bottom-10 right-10 -z-10 w-[400px] h-[400px] rounded-full blur-[150px] opacity-10 bg-pink-500" />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-3">
            <Trophy className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 font-mono">
              Cooperative Raid Engine
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Family Wealth Vaults
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pool savings goals, leverage mutual streak score rules, and conquer
            overhead loops together.
          </p>
        </div>

        {activeVault && (
          <div className="flex gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(activeVault.id);
                toast("Invitation Key added to clipboard buffer.", {
                  className: "toast-glass",
                  icon: <CircleCheckIcon className="size-4 text-emerald-400" />,
                });
              }}
              className="glass-button-secondary py-2.5 text-xs font-semibold gap-1.5"
            >
              <UserPlus className="h-4 w-4 text-indigo-400" /> Invite Member
            </button>
          </div>
        )}
      </div>

      {!activeVault && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto py-12">
          <div className="glass-panel p-8 flex flex-col justify-between hover:border-indigo-500/30 transition-all group">
            <div>
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-all">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Create Family Alliance
              </h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Establish a new collective safe. Set a core goal limit and
                orchestrate your shared household economy.
              </p>
            </div>
            <button
              onClick={() => {
                setIsCreating(true);
                setIsJoining(false);
              }}
              className="glass-button-primary w-full mt-8 py-2.5 text-xs font-bold"
            >
              Establish New Vault
            </button>
          </div>

          <div className="glass-panel p-8 flex flex-col justify-between hover:border-pink-500/30 transition-all group">
            <div>
              <div className="h-12 w-12 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-all">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Join Household Hub
              </h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Enter their secure invitation key to link your profiles, share
                ledgers, and synchronize streams.
              </p>
            </div>
            <button
              onClick={() => {
                setIsJoining(true);
                setIsCreating(false);
              }}
              className="glass-button-secondary w-full mt-8 py-2.5 text-xs font-semibold"
            >
              Enter Invitation Key
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {(isCreating || isJoining) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-xl mx-auto glass-panel p-6 border-indigo-500/30 bg-slate-950/80"
          >
            {isCreating ? (
              <form onSubmit={handleCreate} className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-400" /> Form
                  Cooperative Savings Vault
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Vault Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dream House"
                    value={vaultName}
                    onChange={(e) => setVaultName(e.target.value)}
                    className="w-full glass-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Target Goal ($)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 15000"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      className="w-full glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Target Date
                    </label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full glass-input"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="glass-button-primary px-5 py-2 text-xs font-bold"
                  >
                    {actionLoading ? "Deploying..." : "Launch Vault"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleJoin} className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-pink-400" /> Align With
                  Existing Safe
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Vault Secure Key
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Paste the unique vault UUID"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="w-full glass-input font-mono"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsJoining(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="glass-button-primary px-5 py-2 text-xs font-bold"
                  >
                    {actionLoading ? "Linking..." : "Synchronize Safe"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {activeVault && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Main Visual Mountain Progress Tracker */}
            <div className="glass-panel p-8 relative overflow-hidden bg-slate-950/40">
              <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-indigo-400/60 font-bold uppercase tracking-wider">
                Elevation Progress
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
                  // GOAL MOUNTAIN: {activeVault.name}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">
                    ${currentSavings.toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-500 font-medium">
                    saved of ${activeVault.target_amount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="relative mt-12 h-44 border-b border-white/10 flex items-end justify-between px-4">
                <svg
                  className="absolute inset-x-0 bottom-0 h-36 w-full text-indigo-500/5"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <polygon
                    points="0,100 30,20 60,80 80,40 100,100"
                    fill="currentColor"
                  />
                </svg>

                <div className="text-left z-10">
                  <p className="text-[10px] font-mono text-slate-500">
                    BASE CAMP
                  </p>
                  <p className="text-xs font-bold text-white">$0</p>
                </div>

                <motion.div
                  className="absolute bottom-0 z-20 flex flex-col items-center"
                  style={{
                    left: `${Math.max(10, Math.min(85, progressPercent))}%`,
                  }}
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                >
                  <div className="bg-indigo-500 text-white font-mono text-[10px] font-extrabold px-2 py-1 rounded-md shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-indigo-400 relative mb-1 shrink-0">
                    {progressPercent}% Peak
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-500 rotate-45" />
                  </div>
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 border-2 border-slate-900 flex items-center justify-center font-black text-[10px] text-white">
                    ▲
                  </div>
                </motion.div>

                <div className="text-right z-10">
                  <p className="text-[10px] font-mono text-indigo-400 font-bold flex items-center gap-1">
                    SUMMIT <Target className="h-3 w-3" />
                  </p>
                  <p className="text-xs font-bold text-white">
                    ${activeVault.target_amount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-2">
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Income Streams & Comparison Flow Visual Chart */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Income Summary Card */}
              <div className="glass-panel p-5 bg-emerald-500/[0.02] border-emerald-500/10 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                    Total Joint Income
                  </p>
                  <h4 className="text-xl font-black text-emerald-400 mt-0.5">
                    ${totalVaultIncome.toLocaleString()}
                  </h4>
                </div>
              </div>

              {/* Expense Summary Card */}
              <div className="glass-panel p-5 bg-rose-500/[0.02] border-rose-500/10 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <ArrowDownRight className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                    Total Joint Expenses
                  </p>
                  <h4 className="text-xl font-black text-rose-400 mt-0.5">
                    ${totalVaultExpense.toLocaleString()}
                  </h4>
                </div>
              </div>

              {/* Net Delta Dynamic Analytics Card */}
              <div className="glass-panel p-5 bg-white/[0.01] flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                    Net Flow Balance
                  </p>
                  <h4
                    className={`text-xl font-black mt-0.5 ${totalVaultIncome - totalVaultExpense >= 0 ? "text-indigo-400" : "text-amber-500"}`}
                  >
                    ${(totalVaultIncome - totalVaultExpense).toLocaleString()}
                  </h4>
                </div>
              </div>
            </div>

            {/* Dynamic Analytical Comparison Flow Chart */}
            <div className="glass-panel p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-indigo-400" /> Cash Flow
                  Analytics Chart
                </h3>
                <span className="text-[10px] font-mono text-slate-500">
                  PROPORTIONAL RATIO MATRIX
                </span>
              </div>

              <div className="h-48 flex items-end justify-center gap-16 px-8 border-b border-white/5 pb-2">
                {/* Income Flow Bar Column */}
                <div className="flex flex-col items-center gap-3 w-20 h-full justify-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: incomeBarHeight }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl shadow-[0_0_20px_rgba(16,185,129,0.15)] relative group"
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-900 border border-white/10 text-[9px] font-mono px-1.5 py-0.5 rounded text-white transition-opacity whitespace-nowrap z-30">
                      ${totalVaultIncome.toLocaleString()}
                    </div>
                  </motion.div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Incomes
                  </span>
                </div>

                {/* Expense Flow Bar Column */}
                <div className="flex flex-col items-center gap-3 w-20 h-full justify-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: expenseBarHeight }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-xl shadow-[0_0_20px_rgba(244,63,94,0.15)] relative group"
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-900 border border-white/10 text-[9px] font-mono px-1.5 py-0.5 rounded text-white transition-opacity whitespace-nowrap z-30">
                      ${totalVaultExpense.toLocaleString()}
                    </div>
                  </motion.div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Expenses
                  </span>
                </div>
              </div>
            </div>

            {/* Shared Family Transaction Log */}
            <div className="glass-panel p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo-400" /> Recent Joint
                  Flow
                </h3>
                <span className="text-[10px] font-mono text-slate-500">
                  LATEST COOPERATIVE ENTRIES
                </span>
              </div>

              {sharedTransactions.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-white/5 rounded-xl">
                  <p className="text-xs text-slate-500">
                    No collaborative transactions linked yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 selection:bg-indigo-500">
                  {sharedTransactions.map((tx) => {
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                              tx.flow === "income"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-rose-500/10 text-rose-400"
                            }`}
                          >
                            {tx.flow === "income" ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">
                              {tx.title}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono capitalize">
                              {tx.category} • by{" "}
                              <span className="text-indigo-400 font-medium">
                                {tx.resolvedName}
                              </span>
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-mono font-black ${tx.flow === "income" ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {tx.flow === "income" ? "+" : "-"}$
                          {Number(tx.amount).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Columns: Stats, Multipliers, Active Members */}
          <div className="space-y-8">
            <div className="glass-panel p-6 space-y-6 relative overflow-hidden bg-gradient-to-br from-indigo-950/10 to-pink-950/10 border-indigo-500/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-indigo-400 tracking-wider uppercase">
                  // COMBAT STATS
                </span>
                <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none">
                    Vault Streak
                  </span>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-2xl font-black text-amber-500">
                      x{activeVault.streak_multiplier.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-2">
                    Active savings rate multiplier.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none">
                    Safe Shields
                  </span>
                  <div className="flex items-center gap-2 mt-3">
                    <Shield className="h-5 w-5 text-indigo-400 animate-bounce duration-[4000ms]" />
                    <span className="text-2xl font-black text-white">
                      {activeVault.active_shields}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-2">
                    Absorbs budget leaks.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                <Users className="h-4 w-4 text-pink-400" /> Current Syndicate (
                {activeVault.vault_members.length})
              </h3>

              <div className="space-y-3">
                {activeVault.vault_members.map((member: any) => {
                  const avatarFallback = member.resolvedName
                    .slice(0, 2)
                    .toUpperCase();
                  const isSelf = member.user_id === currentUserId;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center font-black text-xs text-white uppercase shadow">
                          {avatarFallback}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            {member.resolvedName}
                            {isSelf && (
                              <span className="text-[8px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded font-mono font-bold">
                                YOU
                              </span>
                            )}
                          </p>
                          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                            {member.role}
                          </p>
                        </div>
                      </div>

                      {isCurrentUserOwner && !isSelf ? (
                        <button
                          onClick={() =>
                            handleRemoveMember(
                              member.id,
                              member.resolvedName,
                              member.user_id,
                            )
                          }
                          disabled={actionLoading}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-500/20"
                          title={`Remove ${member.resolvedName}`}
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono font-medium text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/10">
                          Ready
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
