import type { DFA } from "./types";

// Remove unreachable states
function reachable(dfa: DFA): Set<string> {
  const visited = new Set<string>([dfa.initial]);
  const stack = [dfa.initial];
  while (stack.length) {
    const s = stack.pop()!;
    for (const sym of dfa.alphabet) {
      const t = dfa.transitions[s]?.[sym];
      if (t && !visited.has(t)) {
        visited.add(t);
        stack.push(t);
      }
    }
  }
  return visited;
}

// Hopcroft-style partition refinement (table-filling variant).
export function minimize(dfa: DFA): DFA {
  const reach = reachable(dfa);
  const states = dfa.states.filter((s) => reach.has(s));
  const finals = new Set(dfa.finals.filter((s) => reach.has(s)));

  // Initial partition: finals vs non-finals
  let partitions: string[][] = [];
  const f = states.filter((s) => finals.has(s));
  const nf = states.filter((s) => !finals.has(s));
  if (f.length) partitions.push(f);
  if (nf.length) partitions.push(nf);

  const stateGroup = (s: string, parts: string[][]) =>
    parts.findIndex((p) => p.includes(s));

  let changed = true;
  while (changed) {
    changed = false;
    const newParts: string[][] = [];
    for (const group of partitions) {
      const signatures = new Map<string, string[]>();
      for (const s of group) {
        const sig = dfa.alphabet
          .map((sym) => {
            const t = dfa.transitions[s]?.[sym];
            return t ? stateGroup(t, partitions) : -1;
          })
          .join("|");
        if (!signatures.has(sig)) signatures.set(sig, []);
        signatures.get(sig)!.push(s);
      }
      if (signatures.size > 1) changed = true;
      for (const sub of signatures.values()) newParts.push(sub);
    }
    partitions = newParts;
  }

  // Build new DFA
  const groupName = (s: string) => {
    const idx = partitions.findIndex((p) => p.includes(s));
    return `Q${idx}`;
  };
  const newStates = partitions.map((_, i) => `Q${i}`);
  const newTransitions: Record<string, Record<string, string>> = {};
  for (let i = 0; i < partitions.length; i++) {
    const rep = partitions[i][0];
    newTransitions[`Q${i}`] = {};
    for (const sym of dfa.alphabet) {
      const t = dfa.transitions[rep]?.[sym];
      if (t) newTransitions[`Q${i}`][sym] = groupName(t);
    }
  }
  const newFinals = partitions
    .map((p, i) => (p.some((s) => finals.has(s)) ? `Q${i}` : null))
    .filter((x): x is string => x !== null);
  const newInitial = groupName(dfa.initial);

  return {
    states: newStates,
    alphabet: [...dfa.alphabet],
    transitions: newTransitions,
    initial: newInitial,
    finals: newFinals,
  };
}
