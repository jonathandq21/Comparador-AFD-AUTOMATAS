import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, SkipForward, History } from "lucide-react";
import type { DFA } from "@/lib/dfa/types";
import { simulate } from "@/lib/dfa/simulate";
import { DfaGraph } from "./DfaGraph";
import { cn } from "@/lib/utils";

interface Props {
  dfa: DFA;
  label: string;
}

interface HistoryItem {
  input: string;
  accepted: boolean;
  error?: string;
}

export function DfaSimulator({ dfa, label }: Props) {
  const [input, setInput] = useState("");
  const [stepIdx, setStepIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const result = simulate(dfa, input);

  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= result.steps.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStepIdx((i) => i + 1), 700);
    return () => clearTimeout(t);
  }, [playing, stepIdx, result.steps.length]);

  const run = () => {
    setStepIdx(result.steps.length - 1);
    setPlaying(false);
    setHistory((h) => [{ input, accepted: result.accepted, error: result.error }, ...h].slice(0, 8));
  };

  const reset = () => { setStepIdx(-1); setPlaying(false); };

  const currentState =
    stepIdx < 0
      ? dfa.initial
      : stepIdx < result.steps.length
        ? result.steps[stepIdx].next!
        : result.finalState ?? dfa.initial;

  const currentEdge = stepIdx >= 0 && stepIdx < result.steps.length
    ? { from: result.steps[stepIdx].state, symbol: result.steps[stepIdx].symbol! }
    : undefined;

  const finished = stepIdx >= result.steps.length - 1 && input.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-5 space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Simulador · {label}</h3>
          <p className="text-sm text-muted-foreground">Prueba cadenas y observa el recorrido paso a paso.</p>
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => { setInput(e.target.value); reset(); }}
            placeholder="Ej: 0110"
            className="font-mono"
          />
          <Button onClick={run} disabled={!input}>
            <Play className="h-4 w-4 mr-1" /> Ejecutar
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4 mr-1" /> Reiniciar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setStepIdx((i) => Math.min(i + 1, result.steps.length - 1))}
            disabled={stepIdx >= result.steps.length - 1}
          >
            <SkipForward className="h-4 w-4 mr-1" /> Paso
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setStepIdx(-1); setPlaying(true); }}>
            {playing ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />} Animar
          </Button>
        </div>

        {input && (
          <div className="space-y-3">
            <div className="font-mono text-lg flex flex-wrap gap-1">
              {input.split("").map((ch, i) => (
                <span
                  key={i}
                  className={cn(
                    "px-2 py-1 rounded border transition-colors",
                    i === stepIdx && "bg-primary text-primary-foreground border-primary",
                    i < stepIdx && "bg-muted text-muted-foreground",
                    i > stepIdx && "bg-card",
                  )}
                >
                  {ch}
                </span>
              ))}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Estado actual:</span>{" "}
              <span className="font-mono font-semibold">{currentState}</span>
            </div>
            {finished && (
              <div>
                {result.error ? (
                  <Badge variant="destructive">Error: {result.error}</Badge>
                ) : result.accepted ? (
                  <Badge className="bg-success text-success-foreground">✓ Aceptada</Badge>
                ) : (
                  <Badge variant="destructive">✗ Rechazada</Badge>
                )}
              </div>
            )}
          </div>
        )}

        {history.length > 0 && (
          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <History className="h-4 w-4" /> Historial
            </div>
            <ul className="space-y-1">
              {history.map((h, i) => (
                <li key={i} className="flex items-center justify-between text-sm font-mono">
                  <span className="truncate">{h.input || "ε"}</span>
                  {h.error ? (
                    <Badge variant="destructive" className="text-[10px]">err</Badge>
                  ) : h.accepted ? (
                    <Badge className="bg-success text-success-foreground text-[10px]">acepta</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">rechaza</Badge>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <DfaGraph dfa={dfa} highlightState={currentState} highlightEdge={currentEdge} className="h-[500px]" />
    </div>
  );
}
