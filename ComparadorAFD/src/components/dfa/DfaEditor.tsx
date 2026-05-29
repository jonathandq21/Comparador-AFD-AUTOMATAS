import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, AlertCircle, CheckCircle2, Upload, Download } from "lucide-react";
import type { DFA } from "@/lib/dfa/types";
import { validateDFA } from "@/lib/dfa/validate";
import { toast } from "sonner";

interface Props {
  dfa: DFA;
  onChange: (dfa: DFA) => void;
  title: string;
}

export function DfaEditor({ dfa, onChange, title }: Props) {
  const errors = useMemo(() => validateDFA(dfa), [dfa]);

  const setStates = (raw: string) => {
    const states = raw.split(",").map((s) => s.trim()).filter(Boolean);
    const transitions: DFA["transitions"] = {};
    for (const s of states) {
      transitions[s] = dfa.transitions[s] ?? {};
    }
    onChange({
      ...dfa,
      states,
      transitions,
      initial: states.includes(dfa.initial) ? dfa.initial : states[0] ?? "",
      finals: dfa.finals.filter((f) => states.includes(f)),
    });
  };

  const setAlphabet = (raw: string) => {
    const alphabet = raw.split(",").map((s) => s.trim()).filter(Boolean);
    onChange({ ...dfa, alphabet });
  };

  const setTransition = (from: string, symbol: string, to: string) => {
    const transitions = { ...dfa.transitions };
    transitions[from] = { ...(transitions[from] ?? {}), [symbol]: to };
    onChange({ ...dfa, transitions });
  };

  const toggleFinal = (s: string, checked: boolean) => {
    const finals = checked ? [...dfa.finals, s] : dfa.finals.filter((x) => x !== s);
    onChange({ ...dfa, finals });
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(dfa, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!parsed.states || !parsed.alphabet || !parsed.transitions) {
          throw new Error("Formato inválido");
        }
        onChange(parsed);
        toast.success("AFD importado correctamente");
      } catch (err) {
        toast.error("Error al importar JSON: " + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportJson}>
            <Download className="h-4 w-4 mr-1" /> JSON
          </Button>
          <Button size="sm" variant="outline" asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-1" /> Importar
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) importJson(f);
                  e.target.value = "";
                }}
              />
            </label>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Estados (separados por coma)</Label>
          <Input
            value={dfa.states.join(", ")}
            onChange={(e) => setStates(e.target.value)}
            placeholder="q0, q1, q2"
            className="font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label>Alfabeto (separado por coma)</Label>
          <Input
            value={dfa.alphabet.join(", ")}
            onChange={(e) => setAlphabet(e.target.value)}
            placeholder="0, 1"
            className="font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Estado inicial</Label>
          <Select value={dfa.initial} onValueChange={(v) => onChange({ ...dfa, initial: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {dfa.states.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Estados finales</Label>
          <div className="flex flex-wrap gap-2 p-2 rounded-md border bg-muted/30 min-h-10">
            {dfa.states.map((s) => (
              <label key={s} className="flex items-center gap-1.5 text-sm font-mono cursor-pointer">
                <Checkbox
                  checked={dfa.finals.includes(s)}
                  onCheckedChange={(c) => toggleFinal(s, !!c)}
                />
                {s}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tabla de transiciones</Label>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium">δ</th>
                {dfa.alphabet.map((sym) => (
                  <th key={sym} className="px-3 py-2 text-left font-mono font-medium">{sym}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dfa.states.map((s) => (
                <tr key={s} className="border-t">
                  <td className="px-3 py-2 font-mono font-semibold">{s}</td>
                  {dfa.alphabet.map((sym) => (
                    <td key={sym} className="px-2 py-1">
                      <Select
                        value={dfa.transitions[s]?.[sym] ?? ""}
                        onValueChange={(v) => setTransition(s, sym, v)}
                      >
                        <SelectTrigger className="h-8 font-mono w-24">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          {dfa.states.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {errors.length > 0 ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-1">
          <div className="flex items-center gap-2 text-destructive font-medium text-sm">
            <AlertCircle className="h-4 w-4" /> {errors.length} problema(s) detectado(s)
          </div>
          <ul className="text-xs text-destructive/90 space-y-0.5 ml-6 list-disc">
            {errors.slice(0, 5).map((e, i) => <li key={i}>{e.message}</li>)}
            {errors.length > 5 && <li>… y {errors.length - 5} más</li>}
          </ul>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-success text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" /> AFD válido y determinista
        </div>
      )}
    </Card>
  );
}

// suppress unused
void Plus; void X; void Textarea; void Badge;
