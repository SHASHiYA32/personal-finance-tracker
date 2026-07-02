"use client";

import { useState } from "react";
import { Bot } from "lucide-react";
import AssistantSheet from "./assistant-sheet";

export default function Assistant() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="
        fixed bottom-6 right-6 z-50
        h-14 w-14 rounded-full
        glass-panel
        border border-indigo-500/30
        bg-gradient-to-br
        from-indigo-500/20
        to-pink-500/20
        backdrop-blur-xl
        shadow-xl
        hover:scale-105
        transition-all
      "
      >
        <Bot className="h-6 w-6 text-white mx-auto" />
      </button>

      <AssistantSheet open={open} onOpenChange={setOpen} />
    </>
  );
}