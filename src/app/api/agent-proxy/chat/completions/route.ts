import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy route for page-agent → Groq API
 * Groq has no data policy guardrails for free tier.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    // Groq doesn't need provider override — no guardrail restrictions
    const groqBody = {
      ...body,
      // Ensure vision model is used
      model: body.model || "meta-llama/llama-4-scout-17b-16e-instruct",
    };

    console.log("[agent-proxy/groq] model:", groqBody.model, "msgs:", groqBody.messages?.length);

    const orRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(groqBody),
    });

    const data = await orRes.json();
    if (!orRes.ok) {
      console.error("[agent-proxy/groq] error:", orRes.status, JSON.stringify(data).substring(0, 200));
    }
    return NextResponse.json(data, { status: orRes.status });
  } catch (err) {
    console.error("[agent-proxy] error:", err);
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}

