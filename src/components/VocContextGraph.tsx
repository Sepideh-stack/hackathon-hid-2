"use client";

import React, { useMemo, useState } from "react";
import type { AggregatedCompetitor } from "@/lib/types";

type GraphNode = {
  id: string;
  label: string;
  size: number; // 0..1
  x: number; // 0..1
  y: number; // 0..1
  competitor: AggregatedCompetitor;
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export default function VocContextGraph(props: {
  competitors: AggregatedCompetitor[];
  title?: string;
  subtitle?: string;
}) {
  const { competitors } = props;
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const nodes = useMemo<GraphNode[]>(() => {
    const top = competitors.slice(0, 10);
    const maxCount = Math.max(1, ...top.map(c => c.count));

    // Simple deterministic radial layout (no dependency on graph libs)
    const centerX = 0.5;
    const centerY = 0.5;
    const radius = 0.33;

    return top.map((c, i) => {
      const angle = (2 * Math.PI * i) / Math.max(1, top.length);
      const x = clamp01(centerX + radius * Math.cos(angle));
      const y = clamp01(centerY + radius * Math.sin(angle));
      const size = c.count / maxCount;
      return {
        id: c.name,
        label: c.name,
        size,
        x,
        y,
        competitor: c,
      };
    });
  }, [competitors]);

  const hovered = useMemo(
    () => nodes.find(n => n.id === hoveredId) || null,
    [nodes, hoveredId]
  );

  // SVG sizing
  const viewW = 720;
  const viewH = 420;

  const cx = (x: number) => x * viewW;
  const cy = (y: number) => y * viewH;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="font-semibold text-slate-900">{props.title ?? "Competitive Context Graph"}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {props.subtitle ?? "Hover a competitor to see where/how it was mentioned in meetings."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="relative">
          <div className="rounded-xl border border-slate-100 bg-slate-50/40 overflow-hidden">
            <svg
              viewBox={`0 0 ${viewW} ${viewH}`}
              className="w-full h-[360px]"
              role="img"
              aria-label="Competitor context graph"
            >
              {/* center node */}
              <g>
                <circle
                  cx={viewW / 2}
                  cy={viewH / 2}
                  r={34}
                  fill="#ffffff"
                  stroke="#cbd5e1"
                  strokeWidth={2}
                />
                <text
                  x={viewW / 2}
                  y={viewH / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={12}
                  fill="#0f172a"
                  fontWeight={600}
                >
                  VoC
                </text>
              </g>

              {/* edges */}
              {nodes.map(n => (
                <line
                  key={`edge-${n.id}`}
                  x1={viewW / 2}
                  y1={viewH / 2}
                  x2={cx(n.x)}
                  y2={cy(n.y)}
                  stroke={n.id === hoveredId ? "#7c3aed" : "#cbd5e1"}
                  strokeWidth={n.id === hoveredId ? 2.5 : 1.5}
                  opacity={n.id === hoveredId ? 0.9 : 0.6}
                />
              ))}

              {/* nodes */}
              {nodes.map(n => {
                const r = 18 + n.size * 18;
                const isHover = n.id === hoveredId;
                return (
                  <g
                    key={`node-${n.id}`}
                    onMouseEnter={() => setHoveredId(n.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{ cursor: "default" }}
                  >
                    <circle
                      cx={cx(n.x)}
                      cy={cy(n.y)}
                      r={r}
                      fill={isHover ? "#7c3aed" : "#a855f7"}
                      opacity={isHover ? 0.95 : 0.78}
                      stroke={isHover ? "#5b21b6" : "#7e22ce"}
                      strokeWidth={isHover ? 3 : 2}
                    />
                    <text
                      x={cx(n.x)}
                      y={cy(n.y) + r + 16}
                      textAnchor="middle"
                      fontSize={12}
                      fill="#334155"
                      fontWeight={600}
                    >
                      {n.label}
                    </text>
                    <text
                      x={cx(n.x)}
                      y={cy(n.y) + r + 32}
                      textAnchor="middle"
                      fontSize={11}
                      fill="#64748b"
                    >
                      {n.competitor.count} mention{n.competitor.count === 1 ? "" : "s"}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {competitors.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-slate-500">No competitors mentioned in this selection.</p>
            </div>
          )}
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-4">
          {!hovered ? (
            <div className="text-sm text-slate-500">
              <p className="font-medium text-slate-700 mb-1">Hover a competitor</p>
              <p>We’ll show the most relevant meeting contexts and direct quotes here.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{hovered.competitor.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {hovered.competitor.count} mention{hovered.competitor.count === 1 ? "" : "s"} across meetings
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {hovered.competitor.contexts.slice(0, 4).map((ctx, i) => (
                  <div key={i} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                    <p className="text-[11px] text-slate-500 mb-1">
                      {ctx.meetingTitle} &middot; {ctx.date}
                    </p>
                    <p className="text-xs text-slate-700 mb-1">
                      <span className="font-semibold">Context:</span> {ctx.context}
                    </p>
                    <p className="text-xs text-slate-600 italic">&ldquo;{ctx.snippet}&rdquo;</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
