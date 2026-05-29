import { createFileRoute } from "@tanstack/react-router";
import { DfaWorkbench } from "@/components/dfa/DfaWorkbench";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Comparador de AFD · Autómatas Finitos Deterministas" },
      { name: "description", content: "Herramienta para crear, validar, simular, minimizar y comparar equivalencia de autómatas finitos deterministas (AFD)." },
      { property: "og:title", content: "Comparador de AFD" },
      { property: "og:description", content: "Compara, minimiza y simula autómatas finitos deterministas." },
    ],
  }),
  component: Index,
});

function Index() {
  return <DfaWorkbench />;
}
