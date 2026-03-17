import { NextResponse } from "next/server";
import { explainReaction } from "@/lib/llm";
import { Reaction } from "@/lib/chemistry";

export async function POST(req: Request) {
  try {
    const { reaction }: { reaction: Reaction } = await req.json();

    if (!reaction || !reaction.equation) {
      return NextResponse.json({ error: "Reaction is required" }, { status: 400 });
    }

    // Attempt to explain using LLM (will fallback if no key or fails)
    const openRouterApiKey = process.env.OPENROUTER_API_KEY || "";
    const explanation = await explainReaction(reaction, openRouterApiKey);

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("Explain API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
