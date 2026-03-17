"use client";

import { useState } from "react";
import { Send, FlaskConical } from "lucide-react";

interface InputPanelProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export default function InputPanel({ onSubmit, isLoading }: InputPanelProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <FlaskConical className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">SOTA Chemworks</h2>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor="prompt-input" className="sr-only">Chemical Reaction Prompt</label>
        <input
          id="prompt-input"
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. What happens when I mix Na and H2O?"
          className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-4 pr-14 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-white/30 text-white rounded-lg transition-all"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
      <div className="mt-3 flex gap-2 text-xs text-white/40">
        <span className="px-2 py-1 rounded bg-white/5 border border-white/5">Na + H2O</span>
        <span className="px-2 py-1 rounded bg-white/5 border border-white/5">H2 + O2</span>
        <span className="px-2 py-1 rounded bg-white/5 border border-white/5">HCl + NaOH</span>
      </div>
    </div>
  );
}
