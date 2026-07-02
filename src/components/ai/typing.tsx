"use client";

export default function Typing() {
  return (
    <div className="flex gap-2 items-center">
      <div className="h-10 w-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
        🤖
      </div>

      <div className="glass-panel px-4 py-3 flex gap-1 rounded-xl">
        <span className="h-2 w-2 rounded-full bg-white animate-bounce" />
        <span
          className="h-2 w-2 rounded-full bg-white animate-bounce"
          style={{ animationDelay: ".15s" }}
        />
        <span
          className="h-2 w-2 rounded-full bg-white animate-bounce"
          style={{ animationDelay: ".3s" }}
        />
      </div>
    </div>
  );
}
