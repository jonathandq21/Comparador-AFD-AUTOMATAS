import type { DFA } from "./types";

export interface EquivalenceResult {
  equivalent: boolean;
  counterexample?: string;
  reason: string;
  sharedAlphabet: string[];
}

// BFS over product automaton to find a distinguishing string.
export function checkEquivalence(a: DFA, b: DFA): EquivalenceResult {
  // Alphabets must match for strict equivalence over same language.
  const alpha = Array.from(new Set([...a.alphabet, ...b.alphabet])).sort();
  if (
    a.alphabet.length !== b.alphabet.length ||
    !a.alphabet.every((s) => b.alphabet.includes(s))
  ) {
    return {
      equivalent: false,
      reason: "Los alfabetos son distintos. Se considera la unión para buscar contraejemplo.",
      sharedAlphabet: alpha,
      counterexample: findOnAlphabet(a, b, alpha),
    };
  }

  const visited = new Set<string>();
  const queue: { sa: string; sb: string; path: string }[] = [
    { sa: a.initial, sb: b.initial, path: "" },
  ];
  visited.add(`${a.initial}#${b.initial}`);

  while (queue.length) {
    const { sa, sb, path } = queue.shift()!;
    const aFinal = a.finals.includes(sa);
    const bFinal = b.finals.includes(sb);
    if (aFinal !== bFinal) {
      return {
        equivalent: false,
        reason: `Diferencia encontrada: en "${path || "ε"}" AFD1 ${aFinal ? "acepta" : "rechaza"} y AFD2 ${bFinal ? "acepta" : "rechaza"}.`,
        sharedAlphabet: alpha,
        counterexample: path,
      };
    }
    for (const sym of alpha) {
      const na = a.transitions[sa]?.[sym];
      const nb = b.transitions[sb]?.[sym];
      if (!na || !nb) continue;
      const key = `${na}#${nb}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ sa: na, sb: nb, path: path + sym });
      }
    }
  }
  return {
    equivalent: true,
    reason: "Los autómatas reconocen el mismo lenguaje (producto cartesiano sin estados distinguibles).",
    sharedAlphabet: alpha,
  };
}

function findOnAlphabet(a: DFA, b: DFA, alpha: string[]): string | undefined {
  const visited = new Set<string>([`${a.initial}#${b.initial}`]);
  const queue: { sa: string; sb: string; path: string }[] = [
    { sa: a.initial, sb: b.initial, path: "" },
  ];
  while (queue.length) {
    const { sa, sb, path } = queue.shift()!;
    const aFinal = a.finals.includes(sa);
    const bFinal = b.finals.includes(sb);
    if (aFinal !== bFinal) return path;
    for (const sym of alpha) {
      const na = a.transitions[sa]?.[sym];
      const nb = b.transitions[sb]?.[sym];
      if (!na || !nb) continue;
      const key = `${na}#${nb}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ sa: na, sb: nb, path: path + sym });
      }
    }
  }
  return undefined;
}
