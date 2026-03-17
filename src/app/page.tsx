"use client";

import { useState } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import PeriodicTable from "@/components/PeriodicTable";
import ReactionBuilder from "@/components/ReactionBuilder";
import SimulationArea from "@/components/SimulationArea";
import { OrchestrationResult } from "@/lib/llm";

interface ElementData {
  atomicNumber: number;
  symbol: string;
  name: string;
  period: number;
  group: number;
  category: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [orchestration, setOrchestration] = useState<OrchestrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedElements, setSelectedElements] = useState<ElementData[]>([]);
  const [catalystElements, setCatalystElements] = useState<ElementData[]>([]);
  const [conditionType, setConditionType] = useState<string>("none");
  const [customCondition, setCustomCondition] = useState<string>("");

  // DnD: drag from periodic table to builder or catalyst zone
  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    const element = active.data.current as ElementData;
    if (!element) return;
    if (over?.id === "reaction-builder-zone") {
      setSelectedElements((prev) => [...prev, element]);
    } else if (over?.id === "catalyst-zone") {
      setCatalystElements((prev) => [...prev, element]);
    }
  };

  // Single click: add element to reaction builder
  const handleElementClick = (element: ElementData) => {
    if (conditionType === "catalyst") {
      setCatalystElements((prev) => [...prev, element]);
    } else {
      setSelectedElements((prev) => [...prev, element]);
    }
  };

  const handleRemoveElement = (index: number) =>
    setSelectedElements((prev) => prev.filter((_, i) => i !== index));

  const handleRemoveCatalyst = (index: number) =>
    setCatalystElements((prev) => prev.filter((_, i) => i !== index));

  const handleEvaluate = async () => {
    if (selectedElements.length === 0) return;
    setIsLoading(true);
    setOrchestration(null);
    setError(null);

    await new Promise((res) => setTimeout(res, 600));

    try {
      const symbols = selectedElements.map((el) => el.symbol);
      const catSymbols = catalystElements.map((el) => el.symbol);

      let conditionDesc = "Điều kiện thường";
      if (conditionType === "temperature") conditionDesc = "Có đun nóng (Nhiệt độ cao)";
      else if (conditionType === "pressure") conditionDesc = "Áp suất cao";
      else if (conditionType === "light") conditionDesc = "Điều kiện ánh sáng / UV";
      else if (conditionType === "electric") conditionDesc = "Điều kiện tia lửa điện / mồi lửa";
      else if (conditionType === "catalyst") {
        conditionDesc =
          catSymbols.length > 0
            ? `Có chất xúc tác: ${catSymbols.join(", ")}`
            : "Có chất xúc tác (chưa xác định)";
      } else if (conditionType === "custom") conditionDesc = `Điều kiện đặc biệt: ${customCondition}`;

      const res = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elements: symbols, condition: conditionDesc }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze reaction.");
      setOrchestration(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const hasResult = orchestration !== null;
  const isValid = orchestration?.isValid;

  return (
    <main className="min-h-screen bg-zinc-950 overflow-x-hidden">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 py-6 flex flex-col gap-6">
        {/* ── Title ── */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 tracking-tight">
            ⚗️ Virtual Chemistry Lab
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Click hoặc kéo thả nguyên tố để xây dựng phản ứng hoá học
          </p>
        </div>

        {/* ── TOP ROW: Periodic Table (left) + Reaction Builder (right) ── */}
        <DndContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 items-start">
            {/* LEFT: Periodic Table */}
            <div className="bg-black/20 rounded-2xl border border-white/5 p-3">
              <PeriodicTable onElementClick={handleElementClick} />
            </div>

            {/* RIGHT: Reaction Builder */}
            <div className="bg-black/30 rounded-2xl border border-white/5 p-4 min-h-[380px] flex flex-col">
              <ReactionBuilder
                selectedElements={selectedElements}
                onRemoveElement={handleRemoveElement}
                onEvaluate={handleEvaluate}
                isLoading={isLoading}
                conditionType={conditionType}
                setConditionType={setConditionType}
                customCondition={customCondition}
                setCustomCondition={setCustomCondition}
                catalystElements={catalystElements}
                onRemoveCatalyst={handleRemoveCatalyst}
              />
            </div>
          </div>
        </DndContext>

        {/* ── Error ── */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* ── Invalid reaction notice ── */}
        {hasResult && !isValid && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 rounded-xl">
            <strong className="block text-base mb-1">⚠️ Không Thể Phản Ứng</strong>
            <p className="text-sm opacity-90">{orchestration.message}</p>
          </div>
        )}

        {/* ── BOTTOM ROW: Simulation (left) + Explanation (right) ── */}
        {hasResult && isValid && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* LEFT: Animation / Simulation */}
            <div className="bg-black/30 rounded-2xl border border-white/5 p-4 flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Mô phỏng phản ứng</h3>
              {orchestration.catalystsOrConditions && orchestration.catalystsOrConditions.length > 0 && (
                <div className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-lg p-2">
                  <strong>Điều kiện / Xúc tác:</strong> {orchestration.catalystsOrConditions.join(", ")}
                </div>
              )}
              <SimulationArea reaction={{ effects: orchestration.animationTriggers || [] }} />
            </div>

            {/* RIGHT: Explanation */}
            <div className="bg-black/30 rounded-2xl border border-white/5 p-5 flex flex-col gap-4">
              {/* Equation */}
              <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/5 border border-blue-500/20 rounded-xl p-4">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Phương trình</p>
                <p className="font-mono text-blue-300 text-lg font-bold">{orchestration.equation}</p>
              </div>

              {/* Explanation text */}
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Giải thích</p>
                <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {orchestration.explanation}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
