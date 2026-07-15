"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Mail, Lock, User, ArrowRight, LockOpen } from "lucide-react";
import { motion } from "framer-motion";
import { getURL } from "@/lib/util/url";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [viewPass, setViewPass] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (signUpError) throw signUpError;

      setSuccess(true);

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthRegister = async (
    provider: "google" | "facebook" | "apple",
  ) => {
    setOauthLoading(provider);
    setError(null);

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${getURL()}auth/callback`,
        },
      });

      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(err.message || `Failed to connect with ${provider}`);
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md glass-panel p-8 relative overflow-hidden"
      >
        {/* Decorative Glow */}
        <div className="absolute -right-20 -top-20 w-44 h-44 rounded-full blur-3xl bg-indigo-500/20" />
        <div className="absolute -left-20 -bottom-20 w-44 h-44 rounded-full blur-3xl bg-pink-500/10" />

        <div className="flex flex-col items-center mb-8 relative">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-3">
            <Sparkles className="h-6 w-6 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Create Account
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Join AuraFinance to take control of your money
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
            Account created successfully! Redirecting to dashboard... (Check
            email if verification is required)
          </div>
        )}

        {!success && (
          <>
            {/* OAuth Buttons Section */}
            <div className="grid grid-cols-3 gap-3 mb-6 relative">
              <button
                type="button"
                disabled
                onClick={() => handleOAuthRegister("google")}
                className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-red-600/5 hover:bg-white/10 border border-white/10 text-white transition-all text-xs font-semibold"
                title="not active yet"
              >
                {oauthLoading === "google" ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Google</span>
                )}
              </button>
              <button
                type="button"
                disabled={oauthLoading !== null || loading}
                onClick={() => handleOAuthRegister("facebook")}
                className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all text-xs font-semibold"
              >
                {oauthLoading === "facebook" ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Facebook</span>
                )}
              </button>
              <button
                type="button"
                disabled
                onClick={() => handleOAuthRegister("apple")}
                className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-red-600/5 hover:bg-white/10 border border-white/10 text-white transition-all text-xs font-semibold"
                title="not active yet"
              >
                {oauthLoading === "apple" ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Apple</span>
                )}
              </button>
              <span className="text-center col-span-3 text-xs text-muted-foreground">
                Google and Apple login coming soon use facebook login instead
              </span>
            </div>

            {/* Divider Line */}
            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Or continue with
              </span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 relative">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 glass-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 glass-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative">
                  {viewPass ? (
                    <LockOpen
                      className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500 cursor-pointer"
                      onClick={() => setViewPass(false)}
                    />
                  ) : (
                    <Lock
                      className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500 cursor-pointer"
                      onClick={() => setViewPass(true)}
                    />
                  )}

                  <input
                    type={viewPass ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 glass-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || oauthLoading !== null}
                className="w-full glass-button-primary mt-4"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="h-4.5 w-4.5" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        <p className="text-center text-xs text-slate-400 mt-6 font-medium relative">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-400 hover:text-indigo-300 font-semibold transition-all"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}