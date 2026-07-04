// components/FinanceAssistant.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, DollarSign, Trash2, Calendar, User, Bot } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useExpenses } from "@/hooks/use-expenses";
import { useIncome } from "@/hooks/use-income";
import { useBudget } from "@/hooks/use-budget";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/helpers/currency";
import { formatDate } from "@/lib/helpers/date";
import { PremiumModal } from "./PremiumModal";

interface PendingDelete {
  id?: string;
  type: "expense" | "income" | "budget";
  description: string;
}

interface Message {
  role: "user" | "assistant";
  text: string;
  renderCustomList?: "expense" | "income" | null;
}

const SUGGESTION_PROMPTS = [
  { label: "📊 Recent Expenses", text: "show me latest 3 expenses" },
  { label: "💰 Recent Income", text: "show recent income entries" },
  { label: "🍔 Spent 15 on Food", text: "I spent 15 on Food for lunch" },
  { label: "🏠 Spent 1200 on Rent", text: "I spent 1200 on Rent/Housing" },
];

export function FinanceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false); // Track premium database flag
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false); // Modal control state
  const [loadingUser, setLoadingUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();
  const { expenses, fetchExpenses, addExpense, deleteExpense } = useExpenses();
  const { incomes, fetchIncomes, addIncome, deleteIncome } = useIncome();
  const { deleteBudget } = useBudget();

  useEffect(() => {
    fetchExpenses();
    fetchIncomes();
  }, [fetchExpenses, fetchIncomes]);

  useEffect(() => {
    async function getUserDetails() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);

          // Fetch explicit premium flag status directly from public.profiles table schema
          const { data: profile } = await supabase
            .from("profiles")
            .select("premium")
            .eq("id", user.id)
            .single();

          const premiumState = !!profile?.premium;
          setIsPremium(premiumState);

          const name =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "there";
          
          setMessages([
            {
              role: "assistant",
              text: `Hello ${name}! 👋 I'm your AI budget co-pilot. ${
                premiumState 
                  ? 'You can add transactions or type "show recent expenses" to inspect records inline!'
                  : 'Upgrade to our Premium Plan to unlock complete conversational budgeting automation layers!'
              }`,
            },
          ]);
        } else {
          setMessages([
            {
              role: "assistant",
              text: "Hello! 👋 I'm your AI budget co-pilot. Please log in to view active features.",
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to parse user session:", err);
      } finally {
        setLoadingUser(false);
      }
    }
    getUserDetails();
  }, [supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (explicitText?: string) => {
    const textToSend = explicitText || input;
    if (!textToSend.trim() || isSubmitting) return;

    const userMessage = textToSend;
    setInput("");

    if (!isPremium) {
      setMessages((prev) => [
        ...prev,
        { role: "user", text: userMessage },
        { 
          role: "assistant", 
          text: "🔒 You are not a premium user. The conversational AI Assistant dashboard capabilities require an active Premium Membership tier." 
        }
      ]);
      
      // Delay opening popup modal slightly so the user reads the restriction text reply first
      setTimeout(() => {
        setIsPremiumModalOpen(true);
      }, 800);
      return;
    }

    const updatedMessages = [
      ...messages,
      { role: "user" as const, text: userMessage },
    ];

    setMessages(updatedMessages);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await response.json();

      let customListTarget: "expense" | "income" | null = null;

      if (data.toolCall) {
        const { name, arguments: args } = data.toolCall;

        if (name === "showRecent") {
          customListTarget = args.itemType === "income" ? "income" : "expense";
        } else if (name === "addExpense") {
          const displayTitle = args.title || "Untitled Expense";
          await addExpense({
            title: displayTitle,
            amount: args.amount || 0,
            category: args.category || "Other",
            date: args.date || new Date().toISOString().split("T")[0],
            note: args.note,
          });
        } else if (name === "addIncome") {
          const displaySource = args.source || "Income Stream";
          await addIncome({
            source: displaySource,
            amount: args.amount || 0,
            date: args.date || new Date().toISOString().split("T")[0],
          });
        } else if (name === "requestDelete") {
          setPendingDelete({
            id: args.itemId,
            type: args.itemType,
            description: args.descriptionText || "Selected Record",
          });
        }
      }

      if (data.replyText) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: data.replyText,
            renderCustomList: customListTarget,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "❌ System error parsing chat request." },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeletion = async () => {
    if (!pendingDelete) return;
    try {
      if (pendingDelete.type === "expense" && pendingDelete.id) {
        await deleteExpense(pendingDelete.id);
      } else if (pendingDelete.type === "income" && pendingDelete.id) {
        await deleteIncome(pendingDelete.id);
      } else if (pendingDelete.type === "budget" && pendingDelete.id) {
        await deleteBudget(pendingDelete.id);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `🗑️ Successfully deleted the ${pendingDelete.type}: "${pendingDelete.description}".`,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `❌ Could not complete file deletion.` },
      ]);
    } finally {
      setPendingDelete(null);
    }
  };

  if (loadingUser) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger>
            <div
              className="flex h-12 w-12 cursor-pointer items-center justify-center border-t-2 border-white/20 rounded-full bg-blue-600/70 text-white shadow-2xl hover:bg-blue-700/70 transition-transform active:scale-95 duration-200"
              aria-label="Open AI Assistant"
            >
              {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
            </div>
          </PopoverTrigger>

          <PopoverContent
            side="top"
            align="end"
            sideOffset={16}
            className="w-96 h-[540px] p-0 flex flex-col border border-white/10 rounded-2xl bg-slate-900/75 backdrop-blur-xl shadow-2xl overflow-hidden text-white"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <DollarSign className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-wide">Finance Pilot</h3>
                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${isPremium ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                  {isPremium ? "Live Client Syncing" : "Base Account Tier"}
                </p>
              </div>
            </div>

            {/* Message Feed Wrapper */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 style-scrollbar">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-3 items-start max-w-[90%] ${
                    m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 border text-[10px] ${
                      m.role === "user"
                        ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    }`}
                  >
                    {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>

                  <div className="space-y-2 flex-1 min-w-0">
                    <div
                      className={`p-3 rounded-2xl text-sm border shadow-sm ${
                        m.role === "user"
                          ? "bg-blue-600 border-blue-500/50 text-white rounded-tr-none"
                          : "bg-white/5 border-white/5 text-gray-100 rounded-tl-none"
                      }`}
                    >
                      {m.text}
                    </div>

                    {/* Render custom lists if user is premium */}
                    {isPremium && m.renderCustomList === "expense" && (
                      <div className="w-full space-y-1.5 animate-fadeIn">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-1">
                          Recent Expenses (Latest 3)
                        </p>
                        {expenses.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm group hover:bg-white/10 transition">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-white truncate">{item.title}</p>
                              <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <Calendar className="h-2.5 w-2.5" /> {formatDate(item.date)} • <span className="capitalize">{item.category}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-3">
                              <span className="text-xs font-semibold text-red-400">{formatCurrency(item.amount)}</span>
                              <button onClick={() => setPendingDelete({ id: item.id, type: "expense", description: item.title })} className="p-1.5 rounded-md hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {isPremium && m.renderCustomList === "income" && (
                      <div className="w-full space-y-1.5 animate-fadeIn">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-1">Recent Income Entries</p>
                        {incomes.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-white truncate">{item.source}</p>
                              <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5"><Calendar className="h-2.5 w-2.5" /> {formatDate(item.date)}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-3">
                              <span className="text-xs font-semibold text-emerald-400">{formatCurrency(item.amount)}</span>
                              <button onClick={() => setPendingDelete({ id: item.id, type: "income", description: item.source })} className="p-1.5 rounded-md hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isSubmitting && (
                <div className="flex gap-3 items-start max-w-[90%] mr-auto">
                  <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="bg-white/5 border border-white/5 text-gray-400 text-xs p-3 rounded-2xl rounded-tl-none w-16 flex justify-center gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Deletion Confirmation Overlays */}
            {pendingDelete && (
              <div className="mx-4 mb-4 p-4 rounded-xl border border-red-500/30 bg-red-950/50 backdrop-blur-md text-xs space-y-2 animate-fadeIn">
                <p className="font-bold text-red-400 uppercase tracking-wider text-[10px]">Action Required</p>
                <p className="text-gray-300">Are you sure you want to delete <span className="text-white font-medium">"{pendingDelete.description}"</span>?</p>
                <div className="flex gap-2 pt-1">
                  <button onClick={confirmDeletion} className="bg-red-600 hover:bg-red-700 transition px-3 py-1.5 rounded-md font-semibold text-white">Yes, Remove Item</button>
                  <button onClick={() => setPendingDelete(null)} className="bg-white/10 hover:bg-white/15 transition px-3 py-1.5 rounded-md font-medium text-gray-300">Cancel</button>
                </div>
              </div>
            )}

            {/* Bottom Form Box */}
            <div className="border-t border-white/10 bg-white/5 p-4 space-y-3">
              {!input.trim() && !isSubmitting && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 style-scrollbar mask-gradient -mx-1 px-1">
                  {SUGGESTION_PROMPTS.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(prompt.text)}
                      className="shrink-0 text-[11px] font-medium bg-white/5 hover:bg-white/15 border border-white/10 text-gray-200 px-3 py-1.5 rounded-full transition active:scale-95 whitespace-nowrap shadow-sm"
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isPremium ? "Type something or use a shortcut..." : "Upgrade to unlock AI Budget Pilot..."}
                  className="flex-1 min-w-0 border border-white/10 rounded-xl bg-black/40 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={isSubmitting}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isSubmitting || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg"
                >
                  Send
                </button>
              </div>
            </div>

          </PopoverContent>
        </Popover>
      </div>

      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        userId={userId}
        isPremiumInitial={isPremium}
        onTierUpdated={(nextState) => {
          setIsPremium(nextState);
          setMessages((prev) => [
            ...prev,
            { role: "assistant", text: "💎 Premium subscription activated successfully! You can now use all conversational AI co-pilot capabilities." }
          ]);
        }}
      />
    </>
  );
}