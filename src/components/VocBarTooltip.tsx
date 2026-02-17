"use client";

import React from "react";
import type { AggregatedTheme, AggregatedCompetitor } from "@/lib/types";

type RechartsTooltipPayloadItem = {
  payload?: {
    text?: string;
    fullText?: string;
    name?: string;
  };
  name?: string;
  value?: number;
};

export default function VocBarTooltip(props: {
  active?: boolean;
  payload?: RechartsTooltipPayloadItem[];
  label?: string;
  themeMap?: Map<string, AggregatedTheme>;
  competitorMap?: Map<string, AggregatedCompetitor>;
  colorClassName?: string;
}) {
  if (!props.active || !props.payload?.length) return null;

  const p0 = props.payload[0] ?? {};
  // We use the truncated label shown in the chart, so we try to match by prefix.
  // For PieChart, the name is usually in p0.name or p0.payload.name
  const rawLabel = String(
    props.label ?? 
    p0?.payload?.fullText ?? 
    p0?.payload?.text ?? 
    p0?.payload?.name ?? 
    p0?.name ?? 
    ""
  );
  const key = rawLabel.toLowerCase();

  let theme: AggregatedTheme | undefined;
  let competitor: AggregatedCompetitor | undefined;

  if (props.themeMap) {
    const match = Array.from(props.themeMap.entries()).find(([, v]) => {
      const full = v.text.toLowerCase();
      return full === key || full.startsWith(key) || key.startsWith(full);
    });
    theme = match?.[1];
  }

  if (!theme && props.competitorMap) {
    const match = Array.from(props.competitorMap.entries()).find(([, v]) => {
      const full = v.name.toLowerCase();
      return full === key || full.startsWith(key) || key.startsWith(full);
    });
    competitor = match?.[1];
  }

  if (!theme && !competitor) {
    return (
      <div className="rounded-xl border border-slate-200/60 bg-white/95 backdrop-blur-md p-4 shadow-xl ring-1 ring-slate-900/5">
        <div className="text-sm font-semibold text-slate-900">{rawLabel}</div>
        <div className="text-xs text-slate-500 mt-1">No details found.</div>
      </div>
    );
  }

  if (competitor) {
    const items = competitor.contexts.slice(0, 4);
    return (
      <div className="rounded-xl border border-slate-200/60 bg-white/95 backdrop-blur-md shadow-xl ring-1 ring-slate-900/5 max-w-[420px] overflow-hidden">
        <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="text-sm font-semibold text-slate-900 leading-snug">{competitor.name}</div>
          <div className="shrink-0 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-medium border border-indigo-100">
            {competitor.count} mentions
          </div>
        </div>

        <div className="p-3 space-y-2.5">
          {items.map((ctx, i) => (
            <div key={i} className="group rounded-lg bg-slate-50/50 hover:bg-slate-50 border border-slate-100 p-2.5 transition-colors">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="text-[10px] font-medium text-slate-600 truncate max-w-[200px]">
                  {ctx.meetingTitle}
                </div>
                <div className="text-[10px] text-slate-400 whitespace-nowrap">
                  {ctx.date}
                </div>
              </div>
              
              <div className="text-[10px] text-slate-500 mb-1">
                <span className="font-medium text-slate-600">Context:</span> {ctx.context}
              </div>
              
              <div className="relative pl-2 mt-1.5">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-200 rounded-full" />
                <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-3">
                  &ldquo;{ctx.snippet}&rdquo;
                </p>
              </div>
            </div>
          ))}
          
          {competitor.contexts.length > 4 && (
            <div className="text-center pt-1">
              <span className="text-[10px] text-slate-400 font-medium">
                + {competitor.contexts.length - 4} more mentions
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Theme fallback (guaranteed to be theme if we reach here due to checks above)
  const items = theme!.snippets.slice(0, 4);
  return (
    <div className="rounded-xl border border-slate-200/60 bg-white/95 backdrop-blur-md shadow-xl ring-1 ring-slate-900/5 max-w-[420px] overflow-hidden">
      <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100 flex items-start justify-between gap-4">
        <div className="text-sm font-semibold text-slate-900 leading-snug">{theme!.text}</div>
        <div className="shrink-0 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-medium border border-indigo-100">
          {theme!.count} mentions
        </div>
      </div>

      <div className="p-3 space-y-2.5">
        {items.map((s, i) => (
          <div key={i} className="group rounded-lg bg-slate-50/50 hover:bg-slate-50 border border-slate-100 p-2.5 transition-colors">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="text-[10px] font-medium text-slate-600 truncate max-w-[200px]">
                {s.meetingTitle}
              </div>
              <div className="text-[10px] text-slate-400 whitespace-nowrap">
                {s.date}
              </div>
            </div>
            
            {s.who && (
              <div className="text-[10px] text-slate-500 mb-1 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                {s.who}
              </div>
            )}
            
            <div className="relative pl-2">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-200 rounded-full" />
              <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-3">
                &ldquo;{s.snippet}&rdquo;
              </p>
            </div>
          </div>
        ))}
        
        {theme!.snippets.length > 4 && (
          <div className="text-center pt-1">
            <span className="text-[10px] text-slate-400 font-medium">
              + {theme!.snippets.length - 4} more mentions
            </span>
          </div>
        )}
      </div>
    </div>
  );
}