import { NextResponse } from "next/server";
import { parseUserIntent, generateReaction } from "@/lib/chemistry";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // 1. Parse text to extract reactants
    const reactants = parseUserIntent(prompt);

    if (reactants.length === 0) {
      return NextResponse.json(
        { error: "Could not identify any reactants in your prompt." },
        { status: 400 }
      );
    }

    // 2. Generate reaction from local mapping
    const reaction = generateReaction(reactants);

    if (!reaction) {
      return NextResponse.json(
        { error: `No reaction found for: ${reactants.join(", ")}` },
        { status: 404 }
      );
    }

    return NextResponse.json({ reactants, reaction });
  } catch (error) {
    console.error("Parse API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
