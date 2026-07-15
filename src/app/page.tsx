import React from "react";
import { 
  Sparkles, 
  Shield, 
  Sword, 
  Users, 
  TrendingUp, 
  Bot, 
  ArrowRight,
  ChevronRight, 
  PiggyBank, 
  Target,
  Zap,
  Lock,
  Gamepad2
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen selection:bg-indigo-500 selection:text-white overflow-hidden relative">
      
      {/* Dynamic Background Mesh Gradients */}
      <div className="absolute top-0 left-1/4 -z-20 w-[500px] h-[500px] rounded-full blur-[160px] opacity-20 bg-indigo-600 animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-10 right-10 -z-20 w-[600px] h-[600px] rounded-full blur-[180px] opacity-15 bg-pink-600 animate-pulse duration-[8000ms]" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/40 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-indigo-500/50 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <Sparkles className="h-5 w-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div>
              <span className="text-base font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-400">
                AURAFINANCE
              </span>
              <p className="text-[9px] text-indigo-400/80 font-mono tracking-widest leading-none">
                BY DEVDYNAMO
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors duration-200 relative group py-1">
              Core Engine
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#gamification" className="hover:text-white transition-colors duration-200 relative group py-1">
              Aura Battles
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#wargames" className="hover:text-white transition-colors duration-200 relative group py-1">
              Social Combat
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        {/* Entrance Chip */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8 animate-in fade-in zoom-in-95 duration-700 delay-100">
          <Bot className="h-3.5 w-3.5 text-indigo-400 animate-bounce duration-[3000ms]" />
          <span className="text-[10px] font-bold tracking-widest text-indigo-300 uppercase font-mono">
            Next-Gen Autonomous Wealth Engine
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="relative text-4xl sm:text-6xl lg:text-8xl font-black tracking-tight text-white max-w-5xl leading-[1.05] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          Stop Tracking Expenses. <br/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 relative">
            Gamify Your Financial Aura.
          </span>
            <span className="absolute w-full -bottom-4 left-0 right-0 h-0.5 bg-indigo-500/20 blur-[1px]" />
        </h1>

        {/* Subtitle */}
        <p className="mt-8 text-base sm:text-lg text-slate-400 max-w-2xl font-normal leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          An AI-powered tactical budget sandbox that transforms standard asset tracking into collaborative multiplayer savings wars. Defeat bad spending loops with friends.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-400">
          <Link href="/login" className="glass-button-primary w-full sm:w-auto px-8 py-3.5 font-bold text-sm tracking-wide gap-2 group hover:scale-[1.02] active:scale-[0.98] transition-all">
            Deploy Free Core 
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <a href="#gamification" className="glass-button-secondary w-full sm:w-auto px-8 py-3.5 font-semibold text-sm hover:bg-white/10 active:scale-[0.98] transition-all">
            Explore Aura Battles
          </a>
        </div>

        {/* Floating Mockup Preview Grid */}
        <div className="w-full mt-20 glass-panel p-4 bg-slate-900/20 max-w-5xl shadow-[0_0_50px_rgba(0,0,0,0.6)] border-white/10 animate-in fade-in zoom-in-95 duration-1000 delay-500 hover:shadow-[0_0_60px_rgba(99,102,241,0.15)] transition-all">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 text-xs text-slate-500">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/40 hover:bg-red-500 transition-colors cursor-pointer" />
              <span className="w-3 h-3 rounded-full bg-amber-500/40 hover:bg-amber-500 transition-colors cursor-pointer" />
              <span className="w-3 h-3 rounded-full bg-green-500/40 hover:bg-green-500 transition-colors cursor-pointer" />
            </div>
            <span className="font-mono text-[10px] tracking-widest bg-white/5 px-2.5 py-1 rounded text-indigo-300 border border-indigo-500/10">
              console.aurafinance.dev
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            
            <div className="p-5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 flex items-center justify-between group">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aura Savings Rate</p>
                <p className="text-2xl font-black text-white mt-1 group-hover:text-indigo-400 transition-colors">+84.2%</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-400 animate-pulse" />
              </div>
            </div>

            <div className="p-5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 flex items-center justify-between group">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Combat Duels</p>
                <p className="text-2xl font-black text-white mt-1 group-hover:text-pink-400 transition-colors">3 Wins / 0 Loss</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Sword className="h-5 w-5 text-indigo-400 group-hover:rotate-12 transition-all duration-300" />
              </div>
            </div>

            <div className="p-5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 flex items-center justify-between group">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Agent Status</p>
                <p className="text-2xl font-black text-indigo-300 mt-1 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> Intercepting
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-purple-400" />
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Core Engine Pillars */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Designed to Protect Your Financial Sovereignty
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-4 leading-relaxed">
            Engineered by team DevDynamo to strip out administrative boredom and replace it with extreme tactical feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-panel glass-panel-hover p-8 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all duration-300" />
            <div>
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:border-indigo-500/40">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white transition-colors group-hover:text-indigo-300">Natural Chat Extraction</h3>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                Talk to the core ledger exactly like an administrative teammate. AI maps unstructured lines like "spent 15 on lunch" directly to verified database entities.
              </p>
            </div>
            <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-widest mt-8 block">
              Gemini 2.5 Flash Layer
            </span>
          </div>

          <div className="glass-panel glass-panel-hover p-8 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-pink-500/5 rounded-full blur-xl group-hover:bg-pink-500/10 transition-all duration-300" />
            <div>
              <div className="h-12 w-12 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:border-pink-500/40">
                <Sword className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white transition-colors group-hover:text-pink-300">Financial Wargames</h3>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                Form savings syndicates with friends. Stake targets on micro-budgets: the user with the lowest unnecessary overhead leaks takes the group yield share pool.
              </p>
            </div>
            <span className="text-[10px] font-mono text-pink-400 font-bold uppercase tracking-widest mt-8 block">
              Social Combat Matrix
            </span>
          </div>

          <div className="glass-panel glass-panel-hover p-8 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all duration-300" />
            <div>
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:border-purple-400/40">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white transition-colors group-hover:text-purple-300">Anti-Impulse Lock</h3>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                AI notices systemic shopping escalation patterns before they impact your thresholds, instantly triggering confirmation friction warnings.
              </p>
            </div>
            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-widest mt-8 block">
              Real-time Interception
            </span>
          </div>

        </div>
      </section>

      {/* Social Savings Feature Spotlight */}
      <section id="gamification" className="py-24 border-t border-white/5 bg-slate-950/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20">
              <Gamepad2 className="h-3.5 w-3.5 text-pink-400 animate-spin duration-[5000ms]" />
              <span className="text-[10px] font-bold uppercase text-pink-300 tracking-wider font-mono">Upcoming Variant v2.0</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.1]">
              Weaponize Mutual Accountability. <br/>
              Fight Bad Debt Together.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Tracking personal wealth numbers is hard alone. AuraFinance lets you add friends into shared vaults where automated rules match and weigh savings metrics.
            </p>
            
            <div className="space-y-4 pt-2">
              <div className="flex gap-4 items-start group">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Daily Multipliers</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Lock grocery targets consecutively to level up squad score multipliers.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start group">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <PiggyBank className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Mutual Strike Pools</h4>
                  <p className="text-xs text-slate-400 mt-0.5">If a squad mate fails an optional spending cap, their penalty yields automatically split among survivors.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 bg-slate-950/60 max-w-md mx-auto w-full relative overflow-hidden group hover:border-white/20 transition-all duration-500 shadow-2xl">
            <div className="absolute right-0 top-0 text-[100px] font-black text-white/[0.01] pointer-events-none select-none font-mono">VS</div>
            <p className="text-[10px] font-mono font-bold text-indigo-400 tracking-widest mb-4">// SAVINGS DUEL ACTIVE</p>
            
            {/* Player 1 */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 mb-3 group/row hover:bg-white/[0.08] transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-300 group-hover/row:scale-105 transition-transform">
                  U1
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Alex (You)</p>
                  <p className="text-[10px] text-slate-400">Impulse Score: 98% Clear</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                +120 Aura
              </span>
            </div>

            {/* VS divider */}
            <div className="h-px bg-white/5 my-5 relative flex items-center justify-center">
              <span className="absolute bg-slate-900 px-3 text-[10px] text-slate-500 font-mono font-bold tracking-widest">
                CROSSOVER DATA LINK
              </span>
            </div>

            {/* Player 2 */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 group/row hover:bg-white/[0.08] transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center font-bold text-xs text-pink-300 group-hover/row:scale-105 transition-transform">
                  U2
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Marcus</p>
                  <p className="text-[10px] text-slate-400">Failed Threshold (Bought Coffee)</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20 animate-pulse">
                -45 Aura
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Footer / CTA */}
      <footer className="border-t border-white/5 py-16 text-center text-xs text-slate-500 font-mono relative">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-indigo-500" />
          </div>
          <p>© {new Date().getFullYear()} AURAFINANCE Engine. All Rights Reserved.</p>
          <p className="text-slate-600 max-w-md leading-relaxed">
            Architected by team DEVDYNAMO with deep AI abstraction models. Secure encryption keys managed at rest.
          </p>
        </div>
      </footer>
    </div>
  );
}