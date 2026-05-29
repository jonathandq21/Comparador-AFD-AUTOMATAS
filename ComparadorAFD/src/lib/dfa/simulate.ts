import type { DFA, SimulationResult, SimulationStep } from "./types";

export function simulate(dfa: DFA, input: string): SimulationResult {
  const steps: SimulationStep[] = [];
  let current = dfa.initial;
  for (let i = 0; i < input.length; i++) {
    const sym = input[i];
    if (!dfa.alphabet.includes(sym)) {
      return {
        accepted: false,
        steps,
        error: `Símbolo "${sym}" no está en el alfabeto.`,
      };
    }
    const next = dfa.transitions[current]?.[sym];
    if (!next) {
      return {
        accepted: false,
        steps,
        error: `Transición indefinida δ(${current}, ${sym}).`,
      };
    }
    steps.push({ state: current, symbol: sym, next, index: i });
    current = next;
  }
  return {
    accepted: dfa.finals.includes(current),
    steps,
    finalState: current,
  };
}
