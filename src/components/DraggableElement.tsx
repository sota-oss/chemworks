"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { clsx } from "clsx";

interface ElementData {
  atomicNumber: number;
  symbol: string;
  name: string;
  period: number;
  group: number;
  category: string;
}

interface DraggableElementProps {
  element: ElementData;
}

const categoryColors: Record<string, string> = {
  "nonmetal": "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30",
  "alkali-metal": "bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30",
  "alkaline-earth": "bg-lime-500/20 text-lime-400 border-lime-500/50 hover:bg-lime-500/30",
  "transition-metal": "bg-yellow-500/20 text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/30",
  "post-transition": "bg-orange-500/20 text-orange-400 border-orange-500/50 hover:bg-orange-500/30",
  "metalloid": "bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30",
  "halogen": "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/30",
  "noble-gas": "bg-sky-500/20 text-sky-400 border-sky-500/50 hover:bg-sky-500/30",
  "lanthanide": "bg-stone-500/20 text-stone-400 border-stone-500/50 hover:bg-stone-500/30",
  "actinide": "bg-neutral-500/20 text-neutral-400 border-neutral-500/50 hover:bg-neutral-500/30",
};

export default function DraggableElement({ element }: DraggableElementProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `element-${element.symbol}`,
    data: element,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const gridArea = {
    gridColumn: element.group,
    gridRow: element.period,
  };

  const colorClass = categoryColors[element.category] || categoryColors["nonmetal"];

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...gridArea }}
      {...listeners}
      {...attributes}
      className={clsx(
        "relative flex flex-col items-center justify-center p-1 rounded border shadow-sm transition-opacity cursor-grab active:cursor-grabbing select-none hover:scale-105 z-10",
        colorClass,
        isDragging ? "opacity-50 scale-110 z-50 shadow-xl" : "opacity-100"
      )}
      title={element.name}
    >
      <span className="absolute top-0.5 left-1 text-[8px] font-mono opacity-60">
        {element.atomicNumber}
      </span>
      <strong className="text-xl font-bold leading-none mt-2">
        {element.symbol}
      </strong>
      <span className="text-[9px] truncate w-full text-center mt-0.5 opacity-80 max-w-[40px]">
        {element.name}
      </span>
    </div>
  );
}
