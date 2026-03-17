"use client";

import { useEffect, useRef, useState } from "react";

type AgentStatus = "idle" | "running" | "completed" | "error";

interface ActionStep {
  action: "addElement" | "setCondition" | "evaluate" | "useProduct" | "reset";
  element?: string;
  condition?: string;
  customCondition?: string;
  formula?: string;
  description?: string;
}

interface AIPlan {
  explanation: string;
  steps: ActionStep[];
}

const STATUS_MESSAGES: Record<string, string> = {
  idle: "Nhập lệnh để Agent thực thi...",
  running: "🤖 Agent đang làm việc...",
  completed: "✅ Hoàn tất!",
  error: "❌ Có lỗi xảy ra",
};

const CONDITION_MAP: Record<string, string> = {
  "nhiệt độ cao": "temperature",
  "đun nóng": "temperature",
  "heat": "temperature",
  "high temperature": "temperature",
  "áp suất cao": "pressure",
  "high pressure": "pressure",
  "xúc tác": "catalyst",
  "catalyst": "catalyst",
  "thường": "none",
  "normal": "none",
};

export default function ChemAgent() {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const addLog = (msg: string) => setLogs((prev) => [...prev, msg]);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const getAIPlan = async (userPrompt: string): Promise<AIPlan> => {
    const res = await fetch("/api/agent-proxy/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen/qwen3.5-9b",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a chemistry lab assistant AI for SOTA ChemWorks. Given a user's chemistry request, return a JSON action plan.

Available actions:
- {"action": "addElement", "element": "SYMBOL"} — add element (e.g. "H", "O", "Fe", "Ca", "Na")
- {"action": "setCondition", "condition": "TYPE"} — TYPE: "temperature", "pressure", "catalyst", "none", or "custom"  
- {"action": "evaluate"} — run the reaction
- {"action": "useProduct", "formula": "FORMULA"} — use a product from a previous reaction (e.g. "H2O", "Fe2O3")
- {"action": "reset"} — clear all elements and start fresh

IMPORTANT RULES:
1. For H2, add "H" twice. For O2, add "O" twice. For H2O molecule as starting material, use useProduct.
2. ALWAYS set condition BEFORE evaluate.
3. For chained reactions: evaluate first reaction → reset → useProduct for the product → add new elements → set condition → evaluate again.
4. Return ONLY valid JSON matching this schema:
{
  "explanation": "Brief explanation of what you'll do",
  "steps": [array of action objects]
}`,
          },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || `API error ${res.status}`);
    }

    const data = await res.json();
    let content = data.choices[0].message.content.trim();
    // Strip <think> tags if present (Qwen3)
    content = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    // Strip markdown code fences
    if (content.startsWith("```")) {
      content = content.replace(/```json\n?/g, "").replace(/```/g, "").trim();
    }
    return JSON.parse(content) as AIPlan;
  };

  const executeStep = async (step: ActionStep, index: number): Promise<boolean> => {
    const actions = window.__chemActions;
    if (!actions) {
      addLog("❌ ChemActions chưa sẵn sàng");
      return false;
    }

    switch (step.action) {
      case "addElement": {
        const ok = actions.addElement(step.element || "");
        addLog(ok ? `✅ Bước ${index + 1}: Thêm ${step.element}` : `❌ Bước ${index + 1}: Không tìm thấy ${step.element}`);
        return ok;
      }
      case "setCondition": {
        const mapped = CONDITION_MAP[step.condition?.toLowerCase() || ""] || step.condition || "none";
        actions.setCondition(mapped, step.customCondition);
        addLog(`✅ Bước ${index + 1}: Đặt điều kiện → ${step.condition}`);
        return true;
      }
      case "evaluate": {
        addLog(`⏳ Bước ${index + 1}: Đang chạy phản ứng...`);
        const result = await actions.evaluate();
        if (result?.isValid) {
          addLog(`✅ Phản ứng thành công: ${result.equation}`);
        } else {
          addLog(`⚠️ Phản ứng thất bại: ${result?.message || "Không xảy ra"}`);
        }
        return !!result?.isValid;
      }
      case "useProduct": {
        actions.useProduct(step.formula || "");
        addLog(`✅ Bước ${index + 1}: Sử dụng sản phẩm ${step.formula}`);
        return true;
      }
      case "reset": {
        actions.reset();
        addLog(`🔄 Bước ${index + 1}: Reset khu vực phản ứng`);
        return true;
      }
      default:
        addLog(`❌ Bước ${index + 1}: Hành động không hợp lệ: ${step.action}`);
        return false;
    }
  };

  const handleExecute = async () => {
    if (!prompt.trim() || status === "running") return;

    setStatus("running");
    setLogs([]);

    try {
      addLog("🧠 Đang phân tích yêu cầu...");
      const plan = await getAIPlan(prompt);
      addLog(`📋 Kế hoạch: ${plan.explanation}`);
      addLog(`📊 Tổng số bước: ${plan.steps.length}`);

      await sleep(500);

      for (let i = 0; i < plan.steps.length; i++) {
        await executeStep(plan.steps[i], i);
        await sleep(600); // delay for visual feedback
      }

      setStatus("completed");
      addLog("🎉 Hoàn tất tất cả các bước!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus("error");
      addLog(`❌ Lỗi: ${msg}`);
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setLogs([]);
    setPrompt("");
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-2xl shadow-xl hover:scale-110 transition-all flex items-center justify-center"
        title="Mở ChemAgent AI"
        aria-label="Toggle ChemAgent"
      >
        {isOpen ? "✕" : "🤖"}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700/80 to-indigo-700/80 px-4 py-3 flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <div>
              <p className="font-bold text-sm text-white">ChemAgent AI</p>
              <p className="text-xs text-blue-200">Custom Plan-Execute · OpenRouter</p>
            </div>
            <span
              className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${status === "running"
                ? "bg-yellow-500/20 text-yellow-300"
                : status === "completed"
                  ? "bg-green-500/20 text-green-300"
                  : status === "error"
                    ? "bg-red-500/20 text-red-300"
                    : "bg-zinc-600/40 text-zinc-300"
                }`}
            >
              {STATUS_MESSAGES[status]}
            </span>
          </div>

          {/* Activity + Log */}
          <div ref={logRef} className="flex-1 max-h-56 overflow-y-auto p-3 space-y-1.5 text-xs font-mono text-zinc-400">
            {logs.length === 0 && (
              <p className="text-zinc-500 italic">Ví dụ: &quot;Thêm Fe và O, chọn đun nóng rồi chạy phản ứng&quot;</p>
            )}
            {logs.map((log, i) => (
              <div key={i} className={log.startsWith("✅") ? "text-emerald-400" : log.startsWith("❌") ? "text-red-400" : log.startsWith("⏳") ? "text-yellow-300" : log.startsWith("🧠") || log.startsWith("📋") ? "text-blue-300" : "text-zinc-400"}>
                {log}
              </div>
            ))}
          </div>

          {/* Input area */}
          <div className="border-t border-white/10 p-3 flex flex-col gap-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleExecute();
                }
              }}
              placeholder="Nhập lệnh (VD: Thêm Fe và O, đun nóng, chạy phản ứng)..."
              className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/60"
              rows={2}
              disabled={status === "running"}
            />
            <div className="flex gap-2">
              <button
                onClick={handleExecute}
                disabled={!prompt.trim() || status === "running"}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold py-2 px-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {status === "running" ? "Đang chạy..." : "▶ Thực thi"}
              </button>
              {(status === "completed" || status === "error") && (
                <button
                  onClick={handleReset}
                  className="px-3 py-2 rounded-xl bg-zinc-700/50 text-zinc-300 hover:bg-zinc-600/50 text-sm font-semibold transition-colors"
                >
                  ↺ Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
