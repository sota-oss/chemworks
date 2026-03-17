import { NextRequest, NextResponse } from "next/server";
import { orchestrateReaction } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const { elements, condition } = await req.json();

    if (!elements || !Array.isArray(elements) || elements.length === 0) {
      return NextResponse.json({ error: "Missing elements array" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
    console.log("Calling orchestrate with key:", apiKey ? apiKey.substring(0, 10) + "..." : "NONE", elements, condition);
    const result = await orchestrateReaction(elements, condition, apiKey);
    console.log("Orchestrate returned:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Parse API Error:", error);
    return NextResponse.json(
      { error: "Internal server error analyzing reaction.", details: error },
      { status: 500 }
    );
  }
}
