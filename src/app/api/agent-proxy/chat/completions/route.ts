import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy route for page-agent → OpenRouter
 * page-agent calls this endpoint client-side; we forward server-side
 * so browser guardrail/data-policy restrictions don't apply.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://sota-oss.github.io/chemworks",
        "X-Title": "SOTA ChemWorks",
      },
      body: JSON.stringify(body),
    });

    const data = await orRes.json();
    return NextResponse.json(data, { status: orRes.status });
  } catch (err) {
    console.error("[agent-proxy] error:", err);
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}
