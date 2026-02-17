"use client";

import React, { useMemo } from "react";
import type { Meeting } from "@/lib/types";

type DateGroup = {
  key: string; // YYYY-MM-DD
  label: string; // "Feb 15"
  meetings: Meeting[];
};

function formatDayLabel(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function dayKey(dateStr: string) {
  // force a stable YYYY-MM-DD based on local date
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function MeetingTimelineTree(props: {
  meetings: Meeting[];
  selectedMeetingId?: string | null;
  onSelectMeeting?: (meetingId: string) => void;
}) {
  const groups = useMemo<DateGroup[]>(() => {
    const sorted = [...props.meetings].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const map = new Map<string, DateGroup>();
    for (const m of sorted) {
      const k = dayKey(m.date);
      const g = map.get(k);
      if (g) g.meetings.push(m);
      else {
        map.set(k, {
          key: k,
          label: formatDayLabel(m.date),
          meetings: [m],
        });
      }
    }

    return Array.from(map.values());
  }, [props.meetings]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Timeline</h3>
      <div className="relative pl-5">
        {/* vertical rail */}
        <div className="absolute left-2 top-0 bottom-0 w-px bg-slate-200" />

        <div className="space-y-4">
          {groups.map(group => (
            <div key={group.key} className="relative">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400 ring-4 ring-white relative -left-[9px]" />
                <div className="text-xs font-semibold text-slate-700">{group.label}</div>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <div className="mt-2 ml-1 space-y-1">
                {group.meetings.map(m => {
                  const isSelected = props.selectedMeetingId === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => props.onSelectMeeting?.(m.id)}
                      className={`w-full text-left rounded-lg px-3 py-2 text-sm border transition-colors ${
                        isSelected
                          ? "bg-blue-50 border-blue-200 text-blue-900"
                          : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="font-medium truncate">{m.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {m.participants.join(", ")}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {groups.length === 0 && (
            <p className="text-sm text-slate-500">No meetings yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
