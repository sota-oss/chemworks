import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy route for page-agent → OpenRouter
 * Injects provider overrides to bypass data policy guardrails.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    // Force data_collection=allow to bypass account-level privacy restrictions
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
      console.error("[agent-proxy] OpenRouter error:", orRes.status, JSON.stringify(data).substring(0, 200));
    }
    return NextResponse.json(data, { status: orRes.status });
  } catch (err) {
    console.error("[agent-proxy] error:", err);
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}
