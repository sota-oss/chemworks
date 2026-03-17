"use client";

import DraggableElement from "./DraggableElement";
import elementsData from "@/data/periodicTable.json";
import { useMemo, useState } from "react";

interface ElementData {
  atomicNumber: number;
  symbol: string;
  name: string;
  period: number;
  group: number;
  category: string;
}

interface PeriodicTableProps {
  onClickAdd?: (element: ElementData) => void;
}

/** Returns a similarity score: 0 = no match, higher = better match */
function similarity(el: ElementData, query: string): number {
  if (!query.trim()) return 1; // no query → all visible
  const q = query.toLowerCase();
  let score = 0;
  if (el.symbol.toLowerCase() === q) score += 10;
  else if (el.symbol.toLowerCase().startsWith(q)) score += 6;
  else if (el.symbol.toLowerCase().includes(q)) score += 3;
  if (el.name.toLowerCase().startsWith(q)) score += 5;
  else if (el.name.toLowerCase().includes(q)) score += 2;
  if (el.category.toLowerCase().includes(q)) score += 1;
  if (String(el.atomicNumber) === q) score += 8;
  return score;
}

export default function PeriodicTable({ onClickAdd }: PeriodicTableProps) {
  const [query, setQuery] = useState("");
  const elements = useMemo(() => elementsData as ElementData[], []);

  const scores = useMemo(
    () => elements.map((el) => similarity(el, query)),
    [elements, query]
  );

  const hasQuery = query.trim().length > 0;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Search bar */}
      <div className="relative max-w-sm mx-auto w-full">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
          🔍
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm nguyên tố: Fe, Oxygen, kim loại..."
          className="w-full pl-9 pr-9 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/40 transition-all"
        />
        {hasQuery && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Periodic Grid */}
      <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
        <div
          className="grid gap-1 p-2 md:p-4 min-w-[800px] bg-black/20 rounded-xl border border-white/5 backdrop-blur-sm"
          style={{
            gridTemplateColumns: "repeat(18, minmax(44px, 1fr))",
            gridTemplateRows: "repeat(9, minmax(52px, auto))",
          }}
        >
          {elements.map((el, i) => (
            <DraggableElement
              key={el.symbol}
              element={el}
              onClickAdd={onClickAdd}
              dimmed={hasQuery && scores[i] === 0}
              highlighted={hasQuery && scores[i] > 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
