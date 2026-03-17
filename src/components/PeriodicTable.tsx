"use client";

import DraggableElement from "./DraggableElement";
import elementsData from "@/data/periodicTable.json";
import { useMemo } from "react";

export default function PeriodicTable() {
  // Ensure we sort or prep them if needed, but the JSON is already structured.
  const elements = useMemo(() => elementsData, []);

  return (
    <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
      <div 
        className="grid gap-1 p-2 md:p-4 min-w-[800px] bg-black/20 rounded-xl border border-white/5 backdrop-blur-sm"
        style={{
          gridTemplateColumns: "repeat(18, minmax(44px, 1fr))",
          gridTemplateRows: "repeat(9, minmax(52px, auto))",
        }}
      >
        {elements.map((el) => (
          <DraggableElement key={el.symbol} element={el} />
        ))}
      </div>
    </div>
  );
}
