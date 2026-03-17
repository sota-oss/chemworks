"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type AgentStatus = "idle" | "running" | "completed" | "error";

interface AgentActivity {
  type: "thinking" | "executing" | "executed" | "retrying" | "error";
  tool?: string;
  message?: string;
}

const STATUS_MESSAGES: Record<string, string> = {
  idle: "Nhập lệnh để Agent thực thi...",
  running: "🤖 Agent đang làm việc...",
  completed: "✅ Hoàn tất!",
  error: "❌ Có lỗi xảy ra",
};

export default function ChemAgent() {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [activity, setActivity] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const agentRef = useRef<{ execute: (task: string) => Promise<unknown>; stop: () => void; dispose: () => void } | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [history, activity]);

  const initAgent = useCallback(async () => {
    if (agentRef.current) return agentRef.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = await import("page-agent") as any;
    const PageAgent = mod.PageAgent;
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    const agent = new PageAgent({
      model: "meta-llama/llama-3.2-11b-vision-instruct:free",
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
      language: "en-US", // page-agent only supports en-US / zh-CN
      maxSteps: 20,
      instructions: {
        system: `You are an AI assistant controlling a Vietnamese chemistry lab web app (SOTA ChemWorks).
        The page has: 
        - A periodic table where you can click elements to add them to the reaction zone.
        - A reaction zone showing selected elements.
        - A conditions dropdown (select: "Điều kiện thường", "Đun nóng", "Áp suất cao", "Chất xúc tác", "Nhập tay điều kiện khác").
        - A "Thực hiện phản ứng" button to evaluate the reaction.
        - A search bar for finding elements.
        When user gives chemistry instructions (in Vietnamese or English), translate them to actions.
        For example: "Fe và O với đun nóng" → click Fe → click O → select "Đun nóng" in dropdown → click "Thực hiện phản ứng".
        `,
      },
      onAskUser: async (question: string) => {
        return window.prompt(question) || "";
      },
    } as Parameters<typeof PageAgent>[0]);

    // Listen to agent events
    agent.addEventListener("activity", (e: Event) => {
      const act = (e as CustomEvent<AgentActivity>).detail;
      if (act.type === "thinking") setActivity("🧠 Đang suy nghĩ...");
      else if (act.type === "executing") setActivity(`⚡ Đang thực thi: ${act.tool}`);
      else if (act.type === "executed") setActivity(`✔ Xong: ${act.tool}`);
      else if (act.type === "retrying") setActivity("🔄 Đang thử lại...");
      else if (act.type === "error") setActivity(`❌ Lỗi: ${act.message}`);
    });

    agent.addEventListener("historychange", () => {
      setHistory(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        agent.history
          .filter((h: any) => h.type === "step")
          .map((h: any) => {
            if (h.type === "step") return `[Bước ${h.stepIndex + 1}] ${h.action.name}: ${h.reflection.next_goal || ""}`;
            return "";
          })
          .filter(Boolean)
      );
    });

    agentRef.current = agent;
    return agent;
  }, []);

  const handleExecute = async () => {
    if (!prompt.trim() || status === "running") return;

    setStatus("running");
    setHistory([]);
    setActivity("");

    try {
      const agent = await initAgent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await agent.execute(prompt) as any;
      setStatus(result?.success ? "completed" : "error");
      setActivity(result?.success ? "✅ Hoàn tất thành công!" : `❌ ${result?.data}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus("error");
      setActivity(`❌ Lỗi: ${msg}`);
    }
  };

  const handleStop = () => {
    agentRef.current?.stop();
    setStatus("idle");
    setActivity("Đã dừng.");
  };

  const handleReset = () => {
    agentRef.current?.dispose();
    agentRef.current = null;
    setStatus("idle");
    setActivity("");
    setHistory([]);
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
              <p className="text-xs text-blue-200">Llama 3.2 Vision · OpenRouter</p>
            </div>
            <span
              className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${
                status === "running"
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
          <div ref={logRef} className="flex-1 max-h-48 overflow-y-auto p-3 space-y-1 text-xs font-mono text-zinc-400">
            {history.length === 0 && !activity && (
              <p className="text-zinc-500 italic">Ví dụ: &quot;Thêm Fe và O, chọn đun nóng rồi chạy phản ứng&quot;</p>
            )}
            {history.map((h, i) => (
              <div key={i} className="text-zinc-400">{h}</div>
            ))}
            {activity && <div className="text-blue-300 font-semibold">{activity}</div>}
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
              placeholder="Nhập lệnh (VD: Thêm Na và H2O, đun nóng, chạy phản ứng)..."
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
              {status === "running" && (
                <button
                  onClick={handleStop}
                  className="px-3 py-2 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600/30 text-sm font-semibold transition-colors"
                >
                  ■ Stop
                </button>
              )}
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
