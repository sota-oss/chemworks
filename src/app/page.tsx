"use client";

import { useState, useEffect, useCallback } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import PeriodicTable from "@/components/PeriodicTable";
import ReactionBuilder from "@/components/ReactionBuilder";
import SimulationArea from "@/components/SimulationArea";
import ChemAgent from "@/components/ChemAgent";
import { OrchestrationResult } from "@/lib/llm";
import elementsData from "@/data/periodicTable.json";

interface ElementData {
  atomicNumber: number;
  symbol: string;
  name: string;
  period: number;
  group: number;
  category: string;
}

// Type for exposed window actions
declare global {
  interface Window {
    __chemActions?: {
      addElement: (symbol: string) => boolean;
      setCondition: (type: string, custom?: string) => void;
      evaluate: () => Promise<OrchestrationResult | null>;
      useProduct: (formula: string) => void;
      reset: () => void;
      getState: () => { elements: string[]; compounds: string[]; condition: string; products: string[] };
    };
  }
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [orchestration, setOrchestration] = useState<OrchestrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedElements, setSelectedElements] = useState<ElementData[]>([]);
  const [selectedCompounds, setSelectedCompounds] = useState<string[]>([]); // compounds from previous reactions
  const [productHistory, setProductHistory] = useState<string[]>([]); // all produced compounds
  const [catalystElements, setCatalystElements] = useState<ElementData[]>([]);
  const [conditionType, setConditionType] = useState<string>("none");
  const [customCondition, setCustomCondition] = useState<string>("");

  // Evaluate function as a callback for agent usage
  const evaluateForAgent = useCallback(async (): Promise<OrchestrationResult | null> => {
    setIsLoading(true);
    setOrchestration(null);
    setError(null);

    try {
      const symbols = selectedElements.map(el => el.symbol);
      const allReactants = [...symbols, ...selectedCompounds];
      const catSymbols = catalystElements.map(el => el.symbol);

      let conditionDesc = "Điều kiện thường";
      if (conditionType === "temperature") conditionDesc = "Có đun nóng (Nhiệt độ cao)";
      else if (conditionType === "pressure") conditionDesc = "Áp suất cao";
      else if (conditionType === "catalyst") {
        conditionDesc = catSymbols.length > 0
          ? `Có chất xúc tác: ${catSymbols.join(", ")}`
          : "Có chất xúc tác (chưa xác định)";
      }
      else if (conditionType === "custom") conditionDesc = `Điều kiện đặc biệt: ${customCondition}`;

      const res = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elements: allReactants, condition: conditionDesc }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setOrchestration(data);

      if (data.isValid && data.equation) {
        const newProducts = parseProducts(data.equation);
        setProductHistory((prev) => {
          const unique = newProducts.filter((p) => !prev.includes(p));
          return [...prev, ...unique];
        });
      }
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [selectedElements, selectedCompounds, catalystElements, conditionType, customCondition]);

  // Expose actions on window for ChemAgent to call programmatically
  useEffect(() => {
    window.__chemActions = {
      addElement: (symbol: string) => {
        const el = (elementsData as ElementData[]).find(
          (e) => e.symbol.toLowerCase() === symbol.toLowerCase()
        );
        if (!el) return false;
        setSelectedElements((prev) => [...prev, el]);
        return true;
      },
      setCondition: (type: string, custom?: string) => {
        setConditionType(type);
        if (custom) setCustomCondition(custom);
      },
      evaluate: evaluateForAgent,
      useProduct: (formula: string) => {
        setSelectedCompounds((prev) =>
          prev.includes(formula) ? prev : [...prev, formula]
        );
      },
      reset: () => {
        setSelectedElements([]);
        setSelectedCompounds([]);
        setCatalystElements([]);
        setConditionType("none");
        setCustomCondition("");
        setOrchestration(null);
        setError(null);
      },
      getState: () => ({
        elements: selectedElements.map((e) => e.symbol),
        compounds: selectedCompounds,
        condition: conditionType,
        products: productHistory,
      }),
    };
    return () => { delete window.__chemActions; };
  }, [selectedElements, selectedCompounds, conditionType, customCondition, catalystElements, productHistory, evaluateForAgent]);

  const parseProducts = (equation: string): string[] => {
    const sides = equation.split(/->/)[1] || equation.split(/→/)[1];
    if (!sides) return [];
    return sides
      .split("+")
      .map((p) => p.trim().replace(/^\d+\s*/, "").trim()) // strip coefficients
      .filter(Boolean);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    const element = active.data.current as ElementData;
    if (!element) return;

    if (over && over.id === "reaction-builder-zone") {
      setSelectedElements((prev) => [...prev, element]);
    } else if (over && over.id === "catalyst-zone") {
      setCatalystElements((prev) => [...prev, element]);
    }
  };

  const handleRemoveElement = (index: number) => {
    setSelectedElements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveCatalyst = (index: number) => {
    setCatalystElements((prev) => prev.filter((_, i) => i !== index));
  };

  // Single-click to add element to reaction zone
  const handleClickAdd = (element: ElementData) => {
    setSelectedElements((prev) => [...prev, element]);
  };

  // Use a previously produced compound in a new reaction
  const handleUseProduct = (formula: string) => {
    setSelectedCompounds((prev) =>
      prev.includes(formula) ? prev : [...prev, formula]
    );
  };

  const handleRemoveCompound = (index: number) => {
    setSelectedCompounds((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEvaluate = async () => {
    if (selectedElements.length === 0) return;
    
    setIsLoading(true);
    setOrchestration(null);
    setError(null);

    // Fake delay for demo "AI thinking"
    await new Promise((res) => setTimeout(res, 800));

    try {
      const symbols = selectedElements.map(el => el.symbol);
      const allReactants = [...symbols, ...selectedCompounds];
      const catSymbols = catalystElements.map(el => el.symbol);

      let conditionDesc = "Điều kiện thường";
      if (conditionType === "temperature") conditionDesc = "Có đun nóng (Nhiệt độ cao)";
      else if (conditionType === "pressure") conditionDesc = "Áp suất cao";
      else if (conditionType === "catalyst") {
        conditionDesc = catSymbols.length > 0 
          ? `Có chất xúc tác: ${catSymbols.join(", ")}`
          : "Có chất xúc tác (chưa xác định)";
      }
      else if (conditionType === "custom") conditionDesc = `Điều kiện đặc biệt: ${customCondition}`;

      const res = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elements: allReactants, condition: conditionDesc }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze reaction.");
      }

      setOrchestration(data);

      // Store products from successful reactions
      if (data.isValid && data.equation) {
        const newProducts = parseProducts(data.equation);
        setProductHistory((prev) => {
          const unique = newProducts.filter((p) => !prev.includes(p));
          return [...prev, ...unique];
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(typeof err === "string" ? err : "An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 relative overflow-hidden flex flex-col items-center py-12 px-4 sm:px-6">
      <div className="absolute top-0 w-full h-96 bg-blue-500/5 blur-[150px] pointer-events-none rounded-full" />

      <div className="z-10 w-full max-w-2xl text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-4 tracking-tight">
          Virtual Chemistry Lab
        </h1>
        <p className="text-zinc-400 text-lg">
          Describe what you want to mix, and the AI will simulate the reaction.
        </p>
      </div>

      <div
        className="z-10 w-full max-w-6xl flex flex-col gap-6 items-center"
        aria-label="Reaction Form Area"
      >
        <DndContext onDragEnd={handleDragEnd}>
          <PeriodicTable onClickAdd={handleClickAdd} />
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
            selectedCompounds={selectedCompounds}
            onRemoveCompound={handleRemoveCompound}
            productHistory={productHistory}
            onUseProduct={handleUseProduct}
          />
        </DndContext>
        
        {error && (
          <div className="w-full max-w-2xl mx-auto p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl mt-4">
            {error}
          </div>
        )}

        {orchestration && !orchestration.isValid && (
          <div className="w-full max-w-2xl mx-auto p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl mt-4 whitespace-pre-wrap leading-relaxed">
            <strong className="block mb-2 text-xl">Không Thể Phản Ứng</strong>
            {orchestration.message}
          </div>
        )}

        {orchestration && orchestration.isValid && (
          <div className="w-full flex flex-col gap-6 items-center">
            {orchestration.catalystsOrConditions && orchestration.catalystsOrConditions.length > 0 && (
              <div className="w-full max-w-2xl mx-auto p-3 text-sm bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-lg whitespace-pre-wrap leading-relaxed">
                <strong>Điều kiện/Xúc tác cần thiết tự động thêm vào:</strong> {orchestration.catalystsOrConditions.join(", ")}
              </div>
            )}
            
            {/* SimulationArea expects reaction.effects */}
            <SimulationArea reaction={{ effects: orchestration.animationTriggers || [] }} />
            
            <div className="w-full max-w-4xl bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-blue-500/10 to-transparent p-6 border-b border-white/5 whitespace-pre-wrap leading-relaxed">
                <h3 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-tight">
                  <span className="font-mono text-blue-400 mr-3 opacity-80 select-all">{orchestration.equation}</span>
                </h3>
              </div>
              <div className="p-6 md:p-8 space-y-6">
                <div className="text-zinc-300 prose prose-invert prose-lg max-w-none prose-p:leading-relaxed whitespace-pre-wrap">
                  {orchestration.explanation}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* ChemAgent floating panel (page-agent + OpenRouter vision) */}
      <ChemAgent />
    </main>
  );
}
