import { Reaction } from "./chemistry";

export async function explainReaction(reaction: Reaction, openRouterApiKey?: string): Promise<string> {
  // If no API key or OpenRouter is unavailable, use fallback
  if (!openRouterApiKey || openRouterApiKey === "") {
    return reaction.explanation;
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free", // or a suitable free model
        messages: [
          {
            role: "system",
            content: "You are a helpful high school chemistry teacher. Explain the following chemical reaction briefly but clearly. Mention energy changes and key observations.",
          },
          {
            role: "user",
            content: `Explain the reaction: ${reaction.equation}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.warn("OpenRouter API failed, using fallback explanation");
      return reaction.explanation;
    }

    const data = await response.json();
    return data.choices[0].message.content || reaction.explanation;
  } catch (error) {
    console.error("LLM Error:", error);
    return reaction.explanation;
  }
}

export interface OrchestrationResult {
  isValid: boolean;
  message?: string; // If no reaction
  equation?: string;
  catalystsOrConditions?: string[];
  animationTriggers?: { type: "explode" | "bubbles" | "glow" | "precipitate", color: string, intensity: number }[];
  explanation?: string;
}

export async function orchestrateReaction(elements: string[], condition: string, openRouterApiKey?: string): Promise<OrchestrationResult> {
  const defaultFail: OrchestrationResult = { isValid: false, message: "Không có phản ứng hóa học nào xảy ra giữa các chất này trong điều kiện được cho." };

  const finalApiKey = openRouterApiKey || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;

  if (!finalApiKey || finalApiKey === "") {
    // Fallback logic for demo if no API key
    const combo = elements.sort().join("");
    if (combo === "HNaO" || combo === "H2ONa") {
      return {
        isValid: true,
        equation: "2Na + 2H2O -> 2NaOH + H2",
        catalystsOrConditions: ["Nước (H2O)"],
        animationTriggers: [{ type: "explode", color: "#facc15", intensity: 0.8 }, { type: "bubbles", color: "#ffffff", intensity: 0.5 }],
        explanation: "Phản ứng mãnh liệt tỏa nhiều nhiệt, sinh ra khí Hidro dễ cháy và dung dịch kiềm Natri Hidroxit."
      };
    }
    return defaultFail;
  }

  try {
    const prompt = `You are a helpful, expert AI Chemistry Teacher for a high school application.
    The student has dragged the following raw chemical symbols into the reaction builder: [${elements.join(", ")}].
    They have selected these reaction conditions: ${condition || "Điều kiện thường"}.
    
    YOUR MAIN DIRECTIVE:
    1. If the combination of elements corresponds to a WELL-KNOWN INORGANIC OR ORGANIC REACTION (even if they dragged single atoms like 'O' instead of 'O2', or 'H' instead of 'H2'), YOU MUST ASSUME THEY MEANT THE STABLE MOLECULE AND APPROVE THE REACTION.
    2. Example: Fe + O (w/ heat) -> Fe3O4. You MUST mark isValid: true.
    3. Example: Na + H2O -> NaOH + H2. You MUST mark isValid: true.
    4. Example: H + O + Heat -> H2O. You MUST mark isValid: true.
    5. ONLY fail the reaction if it is truly scientifically nonsensical (e.g. He + Ne) or if it strictly requires a condition that is missing (e.g. Cu + HCl -> NO REACTION).
    6. If a reaction usually needs heat, but the condition is 'Điều kiện thường', respond isValid: false and explain why it needs heat.

    Respond ONLY with a valid JSON object matching this exact schema. No extra markdown, no text before or after.
    {
      "isValid": boolean, // True if a reaction is scientifically plausible under these conditions
      "message": "Reason why it fails (if isValid is false, e.g., 'Cần đun nóng để xảy ra', 'Thiếu xúc tác', etc.)",
      "equation": "Balanced chemical equation (if isValid is true, e.g. '3Fe + 2O2 -> Fe3O4')",
      "catalystsOrConditions": ["List of catalysts or conditions needed/provided"],
      "animationTriggers": [{"type": "explode"|"bubbles"|"glow"|"precipitate"|"heat", "color": "#hexcode", "intensity": 0.0-1.0}],
      "explanation": "Detailed explanation of the reaction in Vietnamese, including energy and observations."
    }`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${finalApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: prompt }]
      }),
    });

    if (!response.ok) {
      console.error("OpenRouter response not ok:", response.status, response.statusText);
      return defaultFail;
    }

    const data = await response.json();
    console.log("Raw LLM response:", JSON.stringify(data.choices[0].message.content));

    let content = data.choices[0].message.content.trim();
    if (content.startsWith("\`\`\`json")) {
      content = content.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    }

    return JSON.parse(content) as OrchestrationResult;
  } catch (err) {
    console.error("Orchestration LLM error:", err);
    return defaultFail;
  }
}

