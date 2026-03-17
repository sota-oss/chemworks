"use client";

import { Reaction } from "@/lib/chemistry";
import { Info, Zap, FlaskRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ResultPanelProps {
  reaction: Reaction | null;
  explanation: string | null;
  isLoadingExplanation: boolean;
}

export default function ResultPanel({ reaction, explanation, isLoadingExplanation }: ResultPanelProps) {
  if (!reaction) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl mt-6 font-sans space-y-6"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-blue-400">
          <FlaskRound className="w-5 h-5" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">Reaction Discovered</h3>
        </div>
        <div className="p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-xl sm:text-2xl text-center text-white">
          {reaction.equation}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
          <div className="text-xs text-white/40 mb-1 uppercase font-semibold">Type</div>
          <div className="text-white font-medium">{reaction.type.split(" (")[0]}</div>
        </div>
        <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-white/40 mb-1 uppercase font-semibold">Energy</div>
            <div className="text-white font-medium capitalize">{reaction.energy}</div>
          </div>
          {reaction.energy === "exothermic" && <Zap className="w-5 h-5 text-yellow-500" />}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-emerald-400">
          <Info className="w-5 h-5" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">AI Explanation</h3>
        </div>
        <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-50/80 leading-relaxed text-sm sm:text-base">
          <AnimatePresence mode="wait">
            {isLoadingExplanation ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-400/50 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-emerald-400/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-emerald-400/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-emerald-400/60 animate-pulse">AI is writing explanation...</span>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {explanation}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
