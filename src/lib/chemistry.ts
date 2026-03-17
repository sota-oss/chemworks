import reactionsData from "../data/reactions.json";

export interface Reaction {
  reactants: string[];
  equation: string;
  type: string;
  effects: string[];
  energy: string;
  explanation: string;
}

export function parseUserIntent(prompt: string): string[] {
  // Simple extraction of elements from prompt as fallback
  const allElements = ["Na", "H2O", "H2", "O2", "HCl", "NaOH"];
  const foundElements = allElements.filter((el) =>
    prompt.toLowerCase().includes(el.toLowerCase())
  );
  return foundElements;
}

export function generateReaction(reactants: string[]): Reaction | null {
  // Find in local JSON
  const reaction = reactionsData.find((r) => {
    // Check if r.reactants is a subset of reactants and vice versa
    const hasAll = r.reactants.every((item) =>
      reactants.some((userItem) => userItem.toLowerCase() === item.toLowerCase())
    );
    const sameLength = r.reactants.length === reactants.length;
    return hasAll && sameLength;
  });

  return reaction || null;
}

export function simulateReaction(reaction: Reaction): string[] {
  // Map reaction effects directly to UI events
  return reaction.effects;
}
