import type { DFA } from "./types";

export const EXAMPLES: { name: string; description: string; dfa: DFA }[] = [
  {
    name: "Termina en 01",
    description: "Cadenas binarias que terminan en '01'.",
    dfa: {
      states: ["q0", "q1", "q2"],
      alphabet: ["0", "1"],
      initial: "q0",
      finals: ["q2"],
      transitions: {
        q0: { "0": "q1", "1": "q0" },
        q1: { "0": "q1", "1": "q2" },
        q2: { "0": "q1", "1": "q0" },
      },
    },
  },
  {
    name: "Número par de ceros",
    description: "Cadenas binarias con cantidad par de '0'.",
    dfa: {
      states: ["p", "i"],
      alphabet: ["0", "1"],
      initial: "p",
      finals: ["p"],
      transitions: {
        p: { "0": "i", "1": "p" },
        i: { "0": "p", "1": "i" },
      },
    },
  },
  {
    name: "Contiene 'ab'",
    description: "Cadenas sobre {a,b} que contienen la subcadena 'ab'.",
    dfa: {
      states: ["s0", "s1", "s2"],
      alphabet: ["a", "b"],
      initial: "s0",
      finals: ["s2"],
      transitions: {
        s0: { a: "s1", b: "s0" },
        s1: { a: "s1", b: "s2" },
        s2: { a: "s2", b: "s2" },
      },
    },
  },
];

export const EMPTY_DFA: DFA = {
  states: ["q0"],
  alphabet: ["0", "1"],
  initial: "q0",
  finals: [],
  transitions: { q0: { "0": "q0", "1": "q0" } },
};
