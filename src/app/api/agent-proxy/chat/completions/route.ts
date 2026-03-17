import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy route for page-agent → OpenRouter
 * - Injects provider overrides to bypass data policy guardrails.
 * - Transforms response: parses tool_calls arguments from string→object
 *   (OpenAI format → DashScope format expected by page-agent)
 * - Strips Qwen3 <think> tags from content
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformResponse(data: any): any {
  if (!data?.choices) return data;

  for (const choice of data.choices) {
    const msg = choice.message || choice.delta;
    if (!msg) continue;

    // Strip <think>...</think> reasoning tags from content
    if (typeof msg.content === "string") {
      msg.content = msg.content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    }

    // Parse tool_calls arguments: string → object
    if (Array.isArray(msg.tool_calls)) {
      for (const tc of msg.tool_calls) {
        if (tc.function && typeof tc.function.arguments === "string") {
          try {
            tc.function.arguments = JSON.parse(tc.function.arguments);
          } catch {
            // If parsing fails, leave as string
            console.warn("[agent-proxy] Failed to parse tool_call arguments:", tc.function.arguments.substring(0, 100));
          }
        }
      }
    }
  }

  return data;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;

    const enrichedBody = {
      ...body,
      provider: {
        ...(body.provider || {}),
        data_collection: "allow",
        allow_fallbacks: true,
      },
    };

    console.log("[agent-proxy] model:", enrichedBody.model, "msgs:", enrichedBody.messages?.length);

    const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://sota-oss.github.io/chemworks",
        "X-Title": "SOTA ChemWorks",
      },
      body: JSON.stringify(enrichedBody),
    });

    const data = await orRes.json();
    if (!orRes.ok) {
      console.error("[agent-proxy] error:", orRes.status, JSON.stringify(data).substring(0, 200));
      return NextResponse.json(data, { status: orRes.status });
    }

    // Transform: parse tool_call args string→object for page-agent compatibility
    const transformed = transformResponse(data);
    return NextResponse.json(transformed, { status: orRes.status });
  } catch (err) {
    console.error("[agent-proxy] error:", err);
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}
