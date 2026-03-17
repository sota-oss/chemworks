"use client";

import { useDroppable } from "@dnd-kit/core";
import { clsx } from "clsx";
import { BeakerIcon, XMarkIcon, FireIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

interface ElementData {
  atomicNumber: number;
  symbol: string;
  name: string;
  period: number;
  group: number;
  category: string;
}

interface ReactionBuilderProps {
  selectedElements: ElementData[];
  onRemoveElement: (index: number) => void;
  onEvaluate: () => void;
  isLoading: boolean;
  conditionType: string;
  setConditionType: (type: string) => void;
  customCondition: string;
  setCustomCondition: (val: string) => void;
  catalystElements: ElementData[];
  onRemoveCatalyst: (index: number) => void;
}

export default function ReactionBuilder({
  selectedElements, onRemoveElement, onEvaluate, isLoading,
  conditionType, setConditionType, customCondition, setCustomCondition,
  catalystElements, onRemoveCatalyst
}: ReactionBuilderProps) {
  const { setNodeRef: setReactionRef, isOver: isReactionOver } = useDroppable({ id: "reaction-builder-zone" });
  const { setNodeRef: setCatalystRef, isOver: isCatalystOver } = useDroppable({ id: "catalyst-zone" });

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Header */}
      <h2 className="text-base font-bold flex items-center gap-2 text-white/80">
        <BeakerIcon className="w-5 h-5 text-blue-400" />
        Chất tham gia phản ứng
      </h2>

      {/* Drop zone */}
      <div
        ref={setReactionRef}
        className={clsx(
          "flex-1 min-h-[100px] w-full p-3 rounded-xl border-2 border-dashed transition-all flex flex-wrap gap-3 items-start content-start",
          isReactionOver ? "border-blue-500 bg-blue-500/10 scale-[1.01]" : "border-white/20 bg-black/30",
          selectedElements.length === 0 ? "items-center justify-center" : ""
        )}
      >
        {selectedElements.length === 0 ? (
          <p className="text-white/35 italic text-sm flex items-center gap-2">
            <PlusCircleIcon className="w-4 h-4" />
            Click hoặc kéo thả nguyên tố từ bảng bên trái
          </p>
        ) : (
          selectedElements.map((el, idx) => (
            <div key={`${el.symbol}-${idx}`} className="relative flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 group hover:border-white/40 transition-colors">
              <span className="text-xl font-bold">{el.symbol}</span>
              <span className="text-xs opacity-70 hidden sm:block">{el.name}</span>
              <button
                onClick={() => onRemoveElement(idx)}
                className="absolute -top-1.5 -right-1.5 bg-red-500/80 rounded-full p-0.5 hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                title="Xoá"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
              {idx < selectedElements.length - 1 && (
                <span className="absolute -right-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-white/40">+</span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Conditions */}
      <div className="bg-black/30 border border-white/10 p-3 rounded-xl">
        <label className="text-xs text-white/60 mb-2 flex items-center gap-1.5 font-semibold uppercase tracking-wider">
          <FireIcon className="w-3.5 h-3.5 text-orange-400" /> Điều kiện phản ứng
        </label>
        <div className="flex flex-col gap-2">
          <select
            value={conditionType}
            onChange={(e) => setConditionType(e.target.value)}
            className="bg-[#1a1b1e] text-white border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors w-full"
          >
            <option value="none">Điều kiện thường</option>
            <option value="temperature">Đun nóng (nhiệt độ t°)</option>
            <option value="pressure">Áp suất cao (p)</option>
            <option value="light">Ánh sáng / UV</option>
            <option value="electric">Tia lửa điện</option>
            <option value="catalyst">Chất xúc tác (kéo thả)</option>
            <option value="custom">Nhập tay điều kiện khác...</option>
          </select>

          {conditionType === "custom" && (
            <input
              type="text"
              placeholder="Ví dụ: Tia lửa điện, Điện phân, MnO2..."
              value={customCondition}
              onChange={(e) => setCustomCondition(e.target.value)}
              className="bg-[#1a1b1e] text-white border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 w-full"
            />
          )}

          {conditionType === "catalyst" && (
            <div
              ref={setCatalystRef}
              className={clsx(
                "min-h-[40px] rounded-lg border border-dashed flex items-center flex-wrap gap-2 px-3 py-1.5 transition-colors",
                isCatalystOver ? "border-orange-500 bg-orange-500/10" : "border-white/30 bg-black/20"
              )}
            >
              {catalystElements.length === 0 ? (
                <span className="text-white/35 text-xs">Kéo / click xúc tác vào đây...</span>
              ) : (
                catalystElements.map((el, i) => (
                  <div key={`cat-${el.symbol}-${i}`} className="flex items-center gap-1 bg-orange-500/20 px-2 py-0.5 rounded text-xs border border-orange-500/30">
                    <span className="font-bold">{el.symbol}</span>
                    <button onClick={() => onRemoveCatalyst(i)} className="text-red-400 hover:text-red-300">
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Evaluate Button */}
      <button
        onClick={onEvaluate}
        disabled={selectedElements.length === 0 || isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 text-sm"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Đang phân tích phản ứng...
          </span>
        ) : (
          "⚗️  Thực hiện phản ứng"
        )}
      </button>
    </div>
  );
}
