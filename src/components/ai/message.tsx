"use client";

import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageProps {
  role: "user" | "assistant" | "system"
  content: string;
}

export default function Message({ role, content }: MessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-3",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <div className="h-10 w-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
          <Bot className="h-5 w-5 text-indigo-400" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 backdrop-blur-xl border",
          isUser
            ? "bg-indigo-500/20 border-indigo-500/30 text-white"
            : "bg-white/5 border-white/10 text-slate-200",
        )}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
      </div>

      {isUser && (
        <div className="h-10 w-10 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center shrink-0">
          <User className="h-5 w-5 text-pink-400" />
        </div>
      )}
    </div>
  );
}
