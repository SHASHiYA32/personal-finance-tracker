// components/PremiumModal.tsx
"use client";

import React, { useState } from "react";
import { X, Gem, Cpu, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  isPremiumInitial: boolean;
  onTierUpdated: (nextState: boolean) => void;
}

export function PremiumModal({
  isOpen,
  onClose,
  userId,
  isPremiumInitial,
  onTierUpdated,
}: PremiumModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleTogglePremium = async () => {
    if (!userId) {
      alert("Please authenticate to update your billing tier configuration.");
      return;
    }

    setLoading(true);
    try {
      const nextTierState = !isPremiumInitial;

      // 1. Get current auth user to fetch the email dynamically if it's an upsert fallback
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email || "";

      // 2. Use .upsert() instead of .update() so it creates the profile row if missing
      const { error } = await supabase
        .from("profiles")
        .upsert({ 
          id: userId,
          email: userEmail, // Required not-null field in your schema
          premium: nextTierState 
        }, { onConflict: 'id' });

      if (error) throw error;
      
      onTierUpdated(nextTierState);
      onClose(); // Auto-close modal window on successful execution
    } catch (err: any) {
      alert(err.message || "Plan conversion processing adjustment failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Darkened blur frosted glass backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Box Workspace Layout */}
      <div className="relative w-full max-w-lg overflow-hidden border border-amber-500/30 rounded-2xl bg-slate-900 shadow-2xl text-white z-10 animate-scaleUp">
        {/* Top subtle highlight layout glow banner */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-indigo-500 to-pink-500" />

        {/* Close Button Trigger Action */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl border border-white/5 bg-white/5 text-gray-400 hover:text-white transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Interior Container Wrapper */}
        <div className="p-6 md:p-8 text-center space-y-6">
          <div className="space-y-2">
            <Gem className="h-10 w-10 text-amber-400 mx-auto animate-pulse" />
            <h3 className="text-xl md:text-2xl font-black tracking-wide">
              Finance Pilot Premium
            </h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              Unlock conversational automation infrastructure parameters backed directly by advanced model insights.
            </p>
          </div>

          {/* Value Index Parameter Representation Row */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl max-w-xs mx-auto flex items-center justify-between">
            <div className="text-left">
              <p className="text-xs font-bold text-white">AI Processing Subscriptions</p>
              <p className="text-[10px] text-indigo-400 font-medium tracking-wide">Full Model Vector Scope</p>
            </div>
            <p className="text-base font-black text-amber-400">
              $9.99<span className="text-[10px] font-normal text-slate-400">/mo</span>
            </p>
          </div>

          {/* Premium Plan Features List */}
          <div className="space-y-2.5 text-left max-w-sm mx-auto pt-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Plan Features Matrix Allocation
            </p>
            
            {/* Feature 1: Live active model instance */}
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
              <Cpu className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  Natural Conversational AI 
                  <span className="text-[8px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 tracking-widest font-black uppercase">Live</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Parse composite transactional text phrases like "Spent 15 on lunch" seamlessly into structured DB entries.</p>
              </div>
            </div>

            {/* Feature 2: Predictive analytics placeholder (Not scheduled yet) */}
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.01] border border-white/5 opacity-40">
              <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-300">Predictive Budget Graphs</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Monthly trajectory vector mapping and spending trends variance engines are currently unmapped.</p>
              </div>
            </div>

            {/* Feature 3: Export matrix properties (Not scheduled yet) */}
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.01] border border-white/5 opacity-40">
              <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-300">Multi-Account CSV Import</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Bulk uploads tracking structure datasets are not yet mapped onto integration queues.</p>
              </div>
            </div>
          </div>

          {/* Action Trigger Footer Wrapper Button */}
          <div className="pt-4">
            <button
              onClick={handleTogglePremium}
              disabled={loading}
              className={`w-full max-w-xs py-2.5 rounded-xl font-bold tracking-wider text-xs uppercase transition-all transform active:scale-98 cursor-pointer ${
                isPremiumInitial
                  ? "bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/20"
                  : "bg-gradient-to-r from-amber-500 to-indigo-600 hover:opacity-95 text-white shadow-xl"
              } disabled:opacity-50`}
            >
              {loading 
                ? "Updating Plan Rows..." 
                : isPremiumInitial 
                ? "Revert to Free Basic Plan" 
                : "Activate Premium Access"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}