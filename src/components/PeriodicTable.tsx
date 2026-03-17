"use client";

import DraggableElement from "./DraggableElement";
import elementsData from "@/data/periodicTable.json";
import { useMemo } from "react";

interface ElementData {
  atomicNumber: number;
  symbol: string;
  name: string;
  period: number;
  group: number;
  category: string;
}

interface PeriodicTableProps {
  onElementClick?: (element: ElementData) => void;
}

export default function PeriodicTable({ onElementClick }: PeriodicTableProps) {
  const elements = useMemo(() => elementsData, []);

  return (
    <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
      <div
        className="grid gap-[3px] p-2 min-w-[640px] bg-black/20 rounded-xl border border-white/5 backdrop-blur-sm"
        style={{
          gridTemplateColumns: "repeat(18, minmax(38px, 1fr))",
          gridTemplateRows: "repeat(9, minmax(44px, auto))",
        }}
      >
        {elements.map((el) => (
          <div
            key={el.symbol}
            onClick={() => onElementClick?.(el as ElementData)}
            className="cursor-pointer"
            title={`Click để thêm ${el.name} vào phản ứng`}
          >
            <DraggableElement element={el} />
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-white/30 mt-2">
        💡 Click nhanh hoặc kéo thả nguyên tố để thêm vào phản ứng
      </p>
    </div>
  );
}
