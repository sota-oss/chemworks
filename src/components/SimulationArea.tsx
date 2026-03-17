"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface AnimationTrigger {
  type: "explode" | "bubbles" | "glow" | "precipitate" | "flash" | "heat";
  color?: string;
  intensity?: number;
}

interface SimulationAreaProps {
  reaction: { effects?: AnimationTrigger[] } | null;
}

export default function SimulationArea({ reaction }: SimulationAreaProps) {
  const particles = useMemo(() => {
    const bubblesTrigger = reaction?.effects?.find(e => e.type === "bubbles" || e.type === "precipitate");
    if (bubblesTrigger) {
      return Array.from({ length: 20 }).map((_, i) => {
        // Deterministic pseudo-randoms for absolute purity
        const rand1 = (i * 13) % 100;
        const rand2 = (i * 17) % 100;
        const rand3 = ((i * 19) % 20) - 10;
        const rand4 = 2 + ((i * 23) % 200) / 100;
        const rand5 = ((i * 29) % 200) / 100;
        return {
          id: i,
          x: rand1,
          y: rand2,
          drift: rand3,
          duration: rand4,
          delay: rand5,
          color: bubblesTrigger.color || "#ffffff"
        };
      });
    }
    return [];
  }, [reaction]);

  if (!reaction) {
    return (
      <div className="w-full max-w-2xl mx-auto h-[300px] bg-black/20 rounded-2xl border border-white/5 flex items-center justify-center mt-6">
        <p className="text-white/30 font-medium">Đang chờ phản ứng...</p>
      </div>
    );
  }

  const hasHeat = reaction.effects?.some(e => e.type === "heat" || e.type === "explode");
  const glowTrigger = reaction.effects?.find(e => e.type === "glow" || e.type === "explode");
  const hasFlash = reaction.effects?.some(e => e.type === "explode" || e.type === "flash");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative w-full max-w-2xl mx-auto h-[300px] rounded-2xl border mt-6 overflow-hidden transition-colors duration-1000
        ${hasHeat ? "bg-red-950/40 border-red-500/30" : "bg-black/40 border-white/10"}
      `}
    >
      {/* Background Glow */}
      {glowTrigger && (
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-yellow-500/20 blur-[100px] pointer-events-none"
        />
      )}

      {/* Flash Effect */}
      {hasFlash && (
        <motion.div
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-white z-10 pointer-events-none"
        />
      )}

      {/* Bubbles Simulation */}
      {particles.map((p: { id: number; x: number; y: number; drift: number; duration: number; delay: number }) => (
        <motion.div
          key={p.id}
          initial={{ y: "100%", x: `${p.x}%`, opacity: 0 }}
          animate={{
            y: "-100%",
            x: `${p.x + p.drift}%`,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
          }}
          className="absolute bottom-0 w-3 h-3 rounded-full border border-white/40 bg-white/10"
        />
      ))}
      
      {/* Centered Flask Icon or Representation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <motion.div
            animate={hasHeat ? { y: [0, -5, 0] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-6xl"
         >
           ⚗️
         </motion.div>
      </div>
    </motion.div>
  );
}
