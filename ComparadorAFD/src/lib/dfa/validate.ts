import type { DFA, ValidationError } from "./types";

export function validateDFA(dfa: DFA): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!dfa.states.length) {
    errors.push({ type: "empty", message: "El autómata no tiene estados." });
    return errors;
  }
  if (!dfa.alphabet.length) {
    errors.push({ type: "empty", message: "El alfabeto está vacío." });
  }
  if (!dfa.initial || !dfa.states.includes(dfa.initial)) {
    errors.push({ type: "missing_initial", message: `Estado inicial "${dfa.initial}" no existe en los estados.` });
  }
  for (const f of dfa.finals) {
    if (!dfa.states.includes(f)) {
      errors.push({ type: "invalid_final", message: `Estado final "${f}" no existe.` });
    }
  }
  for (const s of dfa.states) {
    const row = dfa.transitions[s] ?? {};
    for (const sym of dfa.alphabet) {
      const target = row[sym];
      if (target === undefined || target === "") {
        errors.push({
          type: "missing_transition",
          message: `Falta transición δ(${s}, ${sym}).`,
        });
      } else if (!dfa.states.includes(target)) {
        errors.push({
          type: "invalid_target",
          message: `Transición δ(${s}, ${sym}) apunta a "${target}" inexistente.`,
        });
      }
    }
    for (const sym of Object.keys(row)) {
      if (!dfa.alphabet.includes(sym)) {
        errors.push({
          type: "invalid_symbol",
          message: `Símbolo "${sym}" en transiciones de ${s} no pertenece al alfabeto.`,
        });
      }
    }
  }
  return errors;
}

export function isValid(dfa: DFA): boolean {
  return validateDFA(dfa).length === 0;
}
