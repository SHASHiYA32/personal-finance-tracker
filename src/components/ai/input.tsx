"use client";

import { SendHorizontal } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

export default function ChatInput({ value, onChange, onSend }: Props) {
  return (
    <div className="border-t border-white/10 p-4">
      <div className="flex gap-2">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ask your finance assistant..."
          className="
            glass-input
            resize-none
            min-h-[60px]
            bg-white/5
          "
        />

        <button
          onClick={onSend}
          className="
          h-14 w-14
          rounded-xl
          bg-indigo-500
          hover:bg-indigo-600
          flex items-center justify-center
          transition
        "
        >
          <SendHorizontal className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );
}
