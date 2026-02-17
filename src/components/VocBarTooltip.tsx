"use client";

import React from "react";
import type { AggregatedTheme } from "@/lib/types";

type RechartsTooltipPayloadItem = {
  payload?: {
    text?: string;
    fullText?: string;
  };
};

export default function VocBarTooltip(props: {
  active?: boolean;
  payload?: RechartsTooltipPayloadItem[];
  label?: string;
  themeMap: Map<string, AggregatedTheme>;
  colorClassName?: string;
}) {
  if (!props.active || !props.payload?.length) return null;

  const p0 = props.payload[0] ?? {};
  // We use the truncated label shown in the chart, so we try to match by prefix.
  const rawLabel = String(props.label ?? p0?.payload?.fullText ?? p0?.payload?.text ?? "");
  const key = rawLabel.toLowerCase();

  const match = Array.from(props.themeMap.entries()).find(([, v]) => {
    const full = v.text.toLowerCase();
    return full === key || full.startsWith(key) || key.startsWith(full);
  });
  const theme = match?.[1];

  if (!theme) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
        <div className="text-sm font-semibold text-slate-900">{rawLabel}</div>
        <div className="text-xs text-slate-500 mt-1">No details found.</div>
      </div>
    );
  }

  const items = theme.snippets.slice(0, 4);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg max-w-[420px]">
      <div className="text-sm font-semibold text-slate-900">{theme.text}</div>
      <div className="text-xs text-slate-500 mt-1">Mentions: {theme.count}</div>

      <div className="mt-2 space-y-2">
        {items.map((s, i) => (
          <div key={i} className="rounded-lg bg-slate-50 border border-slate-100 p-2">
            <div className="text-[11px] text-slate-500">{s.meetingTitle} &middot; {s.date}</div>
            {s.who && <div className="text-[11px] text-slate-500">Who: {s.who}</div>}
            <div className="text-xs text-slate-700 italic mt-1">&ldquo;{s.snippet}&rdquo;</div>
          </div>
        ))}
      </div>
    </div>
  );
}
