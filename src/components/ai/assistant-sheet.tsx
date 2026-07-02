"use client";

import { useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import Message from "./message";
import EmptyState from "./empty";
import Typing from "./typing";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function AssistantSheet({ open, onOpenChange }: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai",
    }),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 bg-slate-950/70 backdrop-blur-2xl border-white/10 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="p-5 border-b border-white/10">
          <SheetTitle className="text-white">AI Finance Assistant</SheetTitle>
        </SheetHeader>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages
              .filter((m) => m.role === "user" || m.role === "assistant")
              .map((m) => {
                const text = m.parts
                  ?.filter((p) => p.type === "text")
                  .map((p) => p.text)
                  .join("");

                return (
                  <Message key={m.id} role={m.role} content={text || ""} />
                );
              })
          )}

          {status === "streaming" && <Typing />}
        </div>

        {/* Input */}
        <form
          className="p-4 border-t border-white/10 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();

            const form = e.currentTarget;
            const input = form.elements.namedItem(
              "message",
            ) as HTMLInputElement;

            const text = input.value.trim();

            if (!text) return;

            sendMessage({ text });

            input.value = "";
          }}
        >
          <input
            name="message"
            className="flex-1 glass-input bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            placeholder="Ask about budgets, expenses..."
          />

          <button
            type="submit"
            className="px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl"
          >
            Send
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
