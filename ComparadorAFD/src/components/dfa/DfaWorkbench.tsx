import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Network, GitCompare, Sparkles, Play, Moon, Sun, BookOpen, CheckCircle2, XCircle,
} from "lucide-react";
import { DfaEditor } from "@/components/dfa/DfaEditor";
import { DfaGraph } from "@/components/dfa/DfaGraph";
import { DfaSimulator } from "@/components/dfa/DfaSimulator";
import type { DFA } from "@/lib/dfa/types";
import { EMPTY_DFA, EXAMPLES } from "@/lib/dfa/examples";
import { isValid } from "@/lib/dfa/validate";
import { minimize } from "@/lib/dfa/minimize";
import { checkEquivalence } from "@/lib/dfa/equivalence";
import { Toaster } from "@/components/ui/sonner";

export function DfaWorkbench() {
  const [dfaA, setDfaA] = useState<DFA>(EXAMPLES[0].dfa);
  const [dfaB, setDfaB] = useState<DFA>(EXAMPLES[1].dfa);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const validA = isValid(dfaA);
  const validB = isValid(dfaB);

  const equivalence = validA && validB ? checkEquivalence(dfaA, dfaB) : null;

  const loadExample = (which: "A" | "B", idx: string) => {
    const ex = EXAMPLES[parseInt(idx)];
    if (!ex) return;
    if (which === "A") setDfaA(JSON.parse(JSON.stringify(ex.dfa)));
    else setDfaB(JSON.parse(JSON.stringify(ex.dfa)));
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-right" />
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-[image:var(--gradient-hero)] text-primary-foreground shadow-[var(--shadow-glow)]">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">Comparador de AFD</h1>
              <p className="text-xs text-muted-foreground">Autómatas Finitos Deterministas · Equivalencia · Minimización</p>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={() => setDark((d) => !d)} aria-label="Tema">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="AFD 1" value={validA ? "Válido" : "Errores"} good={validA} />
          <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="AFD 2" value={validB ? "Válido" : "Errores"} good={validB} />
          <StatCard
            icon={<GitCompare className="h-4 w-4" />}
            label="Equivalencia"
            value={
              !equivalence ? "—" : equivalence.equivalent ? "Equivalentes" : "Distintos"
            }
            good={equivalence?.equivalent}
          />
        </section>

        <Tabs defaultValue="editor" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="editor"><BookOpen className="h-4 w-4 mr-1.5" /> Editor</TabsTrigger>
            <TabsTrigger value="compare"><GitCompare className="h-4 w-4 mr-1.5" /> Comparar</TabsTrigger>
            <TabsTrigger value="minimize"><Sparkles className="h-4 w-4 mr-1.5" /> Minimizar</TabsTrigger>
            <TabsTrigger value="simulate"><Play className="h-4 w-4 mr-1.5" /> Simular</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            <ExamplePicker onLoad={(i) => loadExample("A", i)} target="AFD 1" />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <DfaEditor dfa={dfaA} onChange={setDfaA} title="AFD 1" />
              <DfaGraph dfa={dfaA} />
            </div>
            <ExamplePicker onLoad={(i) => loadExample("B", i)} target="AFD 2" />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <DfaEditor dfa={dfaB} onChange={setDfaB} title="AFD 2" />
              <DfaGraph dfa={dfaB} />
            </div>
          </TabsContent>

          <TabsContent value="compare" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <GitCompare className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Análisis de equivalencia</h2>
              </div>
              {!validA || !validB ? (
                <p className="text-sm text-muted-foreground">Corrige los errores en ambos AFD para comparar.</p>
              ) : equivalence ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {equivalence.equivalent ? (
                      <>
                        <div className="h-12 w-12 rounded-full bg-success/15 flex items-center justify-center">
                          <CheckCircle2 className="h-6 w-6 text-success" />
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-success">Los AFD son equivalentes</div>
                          <div className="text-sm text-muted-foreground">Reconocen exactamente el mismo lenguaje.</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-12 w-12 rounded-full bg-destructive/15 flex items-center justify-center">
                          <XCircle className="h-6 w-6 text-destructive" />
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-destructive">Los AFD NO son equivalentes</div>
                          <div className="text-sm text-muted-foreground">{equivalence.reason}</div>
                        </div>
                      </>
                    )}
                  </div>
                  {equivalence.counterexample !== undefined && (
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                      <div className="text-sm font-medium">Cadena de contraejemplo</div>
                      <div className="font-mono text-lg">
                        {equivalence.counterexample === "" ? "ε (cadena vacía)" : equivalence.counterexample}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Uno de los autómatas la acepta y el otro la rechaza.
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Algoritmo: búsqueda BFS sobre el autómata producto buscando un par de estados (p,q) con
                    p∈F₁ ⊕ q∈F₂.
                  </div>
                </div>
              ) : null}
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">AFD 1</h3>
                <DfaGraph dfa={dfaA} />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">AFD 2</h3>
                <DfaGraph dfa={dfaB} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="minimize" className="space-y-4">
            <MinimizeView dfa={dfaA} valid={validA} label="AFD 1" />
            <MinimizeView dfa={dfaB} valid={validB} label="AFD 2" />
          </TabsContent>

          <TabsContent value="simulate" className="space-y-6">
            {validA && <DfaSimulator dfa={dfaA} label="AFD 1" />}
            {validB && <DfaSimulator dfa={dfaB} label="AFD 2" />}
            {(!validA || !validB) && (
              <Card className="p-6 text-sm text-muted-foreground">
                Algún AFD tiene errores. Corrígelos en la pestaña Editor.
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <footer className="text-center text-xs text-muted-foreground pt-8 pb-4">
          Herramienta académica de teoría de autómatas · Hecho con React + TypeScript
        </footer>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, good }: { icon: React.ReactNode; label: string; value: string; good?: boolean }) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
        good === undefined ? "bg-muted text-muted-foreground" :
        good ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
      }`}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-semibold">{value}</div>
      </div>
    </Card>
  );
}

function ExamplePicker({ onLoad, target }: { onLoad: (idx: string) => void; target: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Cargar ejemplo en {target}:</span>
      <Select onValueChange={onLoad}>
        <SelectTrigger className="w-72"><SelectValue placeholder="Elige un ejemplo..." /></SelectTrigger>
        <SelectContent>
          {EXAMPLES.map((ex, i) => (
            <SelectItem key={i} value={String(i)}>{ex.name} — {ex.description}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function MinimizeView({ dfa, valid, label }: { dfa: DFA; valid: boolean; label: string }) {
  if (!valid) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        {label}: corrige errores en el editor para minimizar.
      </Card>
    );
  }
  const min = minimize(dfa);
  const reduction = dfa.states.length - min.states.length;
  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Minimización de {label}</h2>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">Original: {dfa.states.length} estados</Badge>
          <Badge className="bg-primary text-primary-foreground">Mínimo: {min.states.length} estados</Badge>
          {reduction > 0 && <Badge className="bg-success text-success-foreground">−{reduction}</Badge>}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Original</h3>
          <DfaGraph dfa={dfa} />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Minimizado (partición de equivalencia)</h3>
          <DfaGraph dfa={min} />
        </div>
      </div>
    </Card>
  );
}

void EMPTY_DFA;
