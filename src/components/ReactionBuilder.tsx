"use client";

import { useDroppable } from "@dnd-kit/core";
import { clsx } from "clsx";
import { BeakerIcon, XMarkIcon, FireIcon } from "@heroicons/react/24/outline";

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
  // chained reaction props
  selectedCompounds: string[];
  onRemoveCompound: (index: number) => void;
  productHistory: string[];
  onUseProduct: (formula: string) => void;
}

export default function ReactionBuilder({ 
  selectedElements, onRemoveElement, onEvaluate, isLoading,
  conditionType, setConditionType, customCondition, setCustomCondition, catalystElements, onRemoveCatalyst,
  selectedCompounds, onRemoveCompound, productHistory, onUseProduct
}: ReactionBuilderProps) {
  const { setNodeRef: setReactionRef, isOver: isReactionOver } = useDroppable({
    id: "reaction-builder-zone",
  });

  const { setNodeRef: setCatalystRef, isOver: isCatalystOver } = useDroppable({
    id: "catalyst-zone",
  });

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <BeakerIcon className="w-6 h-6 text-blue-400" />
        Khu Vực Phản Ứng (Kéo thả chất tham gia vào đây)
      </h2>
      
      <div 
        ref={setReactionRef}
        className={clsx(
          "min-h-[120px] w-full p-4 rounded-xl border-2 border-dashed transition-colors flex flex-wrap gap-4 items-center justify-start",
          isReactionOver ? "border-blue-500 bg-blue-500/10" : "border-white/20 bg-black/40",
          selectedElements.length === 0 ? "justify-center" : ""
        )}
      >
        {selectedElements.length === 0 && selectedCompounds.length === 0 ? (
          <p className="text-white/40 italic flex items-center gap-2">
            <BeakerIcon className="w-5 h-5" />
            Bắt đầu bằng cách kéo/click nguyên tố từ bảng ở trên...
          </p>
        ) : (
          <>
            {selectedElements.map((el, idx) => (
              <div key={`${el.symbol}-${idx}`} className="relative flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/20">
                <span className="text-2xl font-bold">{el.symbol}</span>
                <span className="text-sm opacity-80">{el.name}</span>
                <button 
                  onClick={() => onRemoveElement(idx)}
                  className="absolute -top-2 -right-2 bg-red-500/80 rounded-full p-0.5 hover:bg-red-500 transition-colors"
                  title="Remove"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
                {(idx < selectedElements.length - 1 || selectedCompounds.length > 0) && (
                  <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-xl font-bold text-white/50">+</span>
                )}
              </div>
            ))}

            {/* Compound chips from previous reactions */}
            {selectedCompounds.map((formula, idx) => (
              <div key={`compound-${formula}-${idx}`} className="relative flex items-center gap-2 bg-blue-500/15 px-4 py-2 rounded-lg border border-blue-400/40 shadow-sm shadow-blue-500/20">
                <span className="text-xs text-blue-300 absolute -top-2 left-2 bg-zinc-900 px-1 rounded">hợp chất</span>
                <span className="text-2xl font-bold text-blue-200">⚗️</span>
                <span className="text-lg font-mono font-semibold text-blue-200">{formula}</span>
                <button
                  onClick={() => onRemoveCompound(idx)}
                  className="absolute -top-2 -right-2 bg-red-500/80 rounded-full p-0.5 hover:bg-red-500 transition-colors"
                  title="Remove compound"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
                {idx < selectedCompounds.length - 1 && (
                  <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-xl font-bold text-white/50">+</span>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      <div className="flex justify-between items-end mt-2 gap-4">
        {/* Conditions Component */}
        <div className="flex-1 bg-black/30 border border-white/10 p-4 rounded-xl shadow-inner">
          <label className="text-sm text-white/70 mb-2 flex items-center gap-2 font-semibold">
            <FireIcon className="w-4 h-4 text-orange-400" /> Điều kiện phản ứng
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={conditionType}
              onChange={(e) => setConditionType(e.target.value)}
              className="bg-[#1a1b1e] text-white border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors w-full sm:w-auto"
            >
              <option value="none">Điều kiện thường (Không có)</option>
              <option value="temperature">Đun nóng (Nhiệt độ t°)</option>
              <option value="pressure">Áp suất cao (p)</option>
              <option value="catalyst">Chất xúc tác (Kéo thả nguyên tố)</option>
              <option value="custom">Nhập tay điều kiện khác</option>
            </select>

            {conditionType === "custom" && (
              <input 
                type="text" 
                placeholder="Ví dụ: Tia lửa điện, ánh sáng..." 
                value={customCondition}
                onChange={(e) => setCustomCondition(e.target.value)}
                className="bg-[#1a1b1e] text-white border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-blue-500 w-full flex-1"
              />
            )}

            {conditionType === "catalyst" && (
              <div 
                ref={setCatalystRef}
                className={clsx(
                  "flex-1 min-h-[42px] rounded-lg border border-dashed flex items-center justify-start gap-2 px-3 py-1 transition-colors relative",
                  isCatalystOver ? "border-orange-500 bg-orange-500/10" : "border-white/30 bg-black/20"
                )}
              >
                {catalystElements.length === 0 ? (
                  <span className="text-white/40 text-sm whitespace-nowrap">Kéo xúc tác vào đây...</span>
                ) : (
                  catalystElements.map((el, i) => (
                    <div key={`cat-${el.symbol}-${i}`} className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-sm border border-white/20">
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

        <button
          onClick={onEvaluate}
          disabled={(selectedElements.length === 0 && selectedCompounds.length === 0) || isLoading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-8 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-lg whitespace-nowrap h-fit"
        >
          {isLoading ? "Đang phân tích..." : "Thực hiện phản ứng"}
        </button>
      </div>

      {/* Product History Panel */}
      {productHistory.length > 0 && (
        <div className="mt-2 p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-xl">
          <p className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2">
            ⚗️ Hợp chất đã tạo ra — click để dùng cho phản ứng kế tiếp:
          </p>
          <div className="flex flex-wrap gap-2">
            {productHistory.map((formula) => {
              const alreadySelected = selectedCompounds.includes(formula);
              return (
                <button
                  key={formula}
                  onClick={() => onUseProduct(formula)}
                  disabled={alreadySelected}
                  className={clsx(
                    "px-4 py-2 rounded-lg border font-mono text-sm font-bold transition-all",
                    alreadySelected
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400/50 cursor-default"
                      : "border-emerald-400/50 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/30 hover:border-emerald-400 hover:scale-105 shadow-sm shadow-emerald-500/20 cursor-pointer"
                  )}
                  title={alreadySelected ? "Đã thêm vào phản ứng" : `Thêm ${formula} vào phản ứng kế tiếp`}
                >
                  {alreadySelected ? "✓ " : "+ "}{formula}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
