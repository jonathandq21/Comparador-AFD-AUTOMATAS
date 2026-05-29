export interface DFA {
  states: string[];
  alphabet: string[];
  transitions: Record<string, Record<string, string>>; // state -> symbol -> state
  initial: string;
  finals: string[];
}

export interface ValidationError {
  type: "missing_initial" | "invalid_final" | "missing_transition" | "invalid_target" | "invalid_symbol" | "empty";
  message: string;
}

export interface SimulationStep {
  state: string;
  symbol?: string;
  next?: string;
  index: number;
}

export interface SimulationResult {
  accepted: boolean;
  steps: SimulationStep[];
  error?: string;
  finalState?: string;
}
