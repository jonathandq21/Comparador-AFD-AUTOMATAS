import { useEffect, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Edge,
  type Node,
  Handle,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState,
} from "reactflow";
import type { DFA } from "@/lib/dfa/types";
import { cn } from "@/lib/utils";

interface Props {
  dfa: DFA;
  highlightState?: string;
  highlightEdge?: { from: string; symbol: string };
  className?: string;
}

function DfaNode({ data }: { data: { label: string; isFinal: boolean; isInitial: boolean; isActive: boolean } }) {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      {data.isInitial && (
        <div className="absolute -left-7 top-1/2 -translate-y-1/2 text-primary text-xl font-bold">→</div>
      )}
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full border-2 font-mono text-sm font-semibold transition-all duration-300",
          "bg-card text-card-foreground border-border shadow-[var(--shadow-card)]",
          data.isFinal && "ring-2 ring-offset-2 ring-offset-background ring-border",
          data.isActive && "!border-primary !bg-primary !text-primary-foreground scale-110 shadow-[var(--shadow-glow)]",
        )}
      >
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  );
}

const nodeTypes = { dfaNode: DfaNode };

function layoutPositions(states: string[]): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  const n = states.length;
  if (n === 1) {
    positions[states[0]] = { x: 200, y: 150 };
    return positions;
  }
  const radius = Math.max(120, n * 35);
  const cx = 250, cy = 200;
  states.forEach((s, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    positions[s] = {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    };
  });
  return positions;
}

export function DfaGraph({ dfa, highlightState, highlightEdge, className }: Props) {
  const { initialNodes, initialEdges } = useMemo(() => {
    const positions = layoutPositions(dfa.states);
    const initialNodes: Node[] = dfa.states.map((s) => ({
      id: s,
      type: "dfaNode",
      position: positions[s],
      data: {
        label: s,
        isFinal: dfa.finals.includes(s),
        isInitial: s === dfa.initial,
        isActive: s === highlightState,
      },
    }));

    // Group transitions by (from->to)
    const grouped = new Map<string, string[]>();
    for (const from of dfa.states) {
      const row = dfa.transitions[from] ?? {};
      for (const sym of Object.keys(row)) {
        const to = row[sym];
        if (!to) continue;
        const key = `${from}->${to}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(sym);
      }
    }
    const initialEdges: Edge[] = [];
    for (const [key, syms] of grouped) {
      const [from, to] = key.split("->");
      const isHighlight =
        highlightEdge && highlightEdge.from === from && syms.includes(highlightEdge.symbol);
      initialEdges.push({
        id: key,
        source: from,
        target: to,
        label: syms.join(", "),
        type: from === to ? "default" : "default",
        animated: !!isHighlight,
        labelStyle: { fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 12 },
        labelBgStyle: { fill: "var(--color-background)" },
        labelBgPadding: [4, 2],
        labelBgBorderRadius: 4,
        style: {
          stroke: isHighlight ? "var(--color-primary)" : "var(--color-muted-foreground)",
          strokeWidth: isHighlight ? 2.5 : 1.5,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isHighlight ? "var(--color-primary)" : "var(--color-muted-foreground)",
        },
      });
    }
    return { initialNodes, initialEdges };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dfa, highlightState, highlightEdge?.from, highlightEdge?.symbol]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => { setNodes(initialNodes); }, [initialNodes, setNodes]);
  useEffect(() => { setEdges(initialEdges); }, [initialEdges, setEdges]);

  return (
    <div className={cn("h-[400px] w-full rounded-lg border bg-card overflow-hidden", className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={1} color="var(--color-border)" />
        <Controls className="!bg-card !border-border" />
        <MiniMap pannable zoomable className="!bg-card !border-border" />
      </ReactFlow>
    </div>
  );
}
