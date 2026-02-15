"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { VocData } from "@/lib/types";

export default function VocSummaryPage() {
  const searchParams = useSearchParams();
  
  const productId = searchParams.get("productId") || "";
  const region = searchParams.get("region") || "";
  const stage = searchParams.get("stage") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  const [vocData, setVocData] = useState<VocData | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (productId) params.set("productId", productId);
    if (region) params.set("region", region);
    if (stage) params.set("stage", stage);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    
    fetch(`/api/voc?${params.toString()}`)
      .then(r => r.json())
      .then(setVocData);
  }, [productId, region, stage, dateFrom, dateTo]);

  if (!vocData) {
    return (
      <div className="space-y-3">
        <div className="h-7 w-64 rounded-lg skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-72 rounded-xl skeleton" />
          <div className="h-72 rounded-xl skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-[color:var(--foreground)] animate-fade-in-up">VoC Strategic Summary</h1>
        
        {/* Debug: Display URL parameters */}
        <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">URL Parameters (Debug):</h3>
          <div className="space-y-1">
            <p><strong>Product ID:</strong> {productId || "None"}</p>
            <p><strong>Region:</strong> {region || "None"}</p>
            <p><strong>Stage:</strong> {stage || "None"}</p>
            <p><strong>Date From:</strong> {dateFrom || "None"}</p>
            <p><strong>Date To:</strong> {dateTo || "None"}</p>
          </div>
        </div>
      </div>

      {/* Strategic Scenario Section */}
      {stage && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <h2 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Strategic Scenario - {stage} Stage
          </h2>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {stage === "Discovery" ? (
              "Focus on validating core problems and identifying early customer pain signals. The data shows key challenges prospects are discovering about their current solutions, indicating strong problem-market fit validation opportunities."
            ) : stage === "Evaluation" ? (
              "Prospects are now comparing solutions and raising specific objections. Pay close attention to competitive mentions and deal risks to develop targeted positioning strategies that address evaluation criteria."
            ) : (
              "Analyze customer feedback patterns to understand the current stage dynamics and optimize engagement strategies accordingly."
            )}
          </p>
        </div>
      )}

      {/* Summary grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pain Points */}
        <div className="bg-white dark:bg-[color:var(--card)] border border-slate-200 dark:border-[color:var(--border)] rounded-xl p-6 animate-fade-in-up">
          <h2 className="font-semibold text-slate-900 dark:text-[color:var(--card-foreground)] mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full" />
            Top Pain Points
          </h2>
          <div className="space-y-3">
            {vocData.painPoints.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No pain points found</p>
            ) : (
              vocData.painPoints.slice(0, 5).map((item, i) => (
                <div key={i} className="border-b border-slate-100 dark:border-slate-700 last:border-0 pb-2 last:pb-0">
                  <p className="text-sm text-slate-700 dark:text-[color:var(--foreground)] font-medium">{item.text}</p>
                  <p className="text-xs text-slate-500 dark:text-[color:var(--muted-foreground)] mt-1">{item.count} mention{item.count !== 1 ? 's' : ''}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Feature Requests */}
        <div className="bg-white dark:bg-[color:var(--card)] border border-slate-200 dark:border-[color:var(--border)] rounded-xl p-6 animate-fade-in-up [animation-delay:60ms]">
          <h2 className="font-semibold text-slate-900 dark:text-[color:var(--card-foreground)] mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            Top Feature Requests
          </h2>
          <div className="space-y-3">
            {vocData.featureRequests.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No feature requests found</p>
            ) : (
              vocData.featureRequests.slice(0, 5).map((item, i) => (
                <div key={i} className="border-b border-slate-100 dark:border-slate-700 last:border-0 pb-2 last:pb-0">
                  <p className="text-sm text-slate-700 dark:text-[color:var(--foreground)] font-medium">{item.text}</p>
                  <p className="text-xs text-slate-500 dark:text-[color:var(--muted-foreground)] mt-1">{item.count} mention{item.count !== 1 ? 's' : ''}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Objections */}
        <div className="bg-white dark:bg-[color:var(--card)] border border-slate-200 dark:border-[color:var(--border)] rounded-xl p-6 animate-fade-in-up [animation-delay:120ms]">
          <h2 className="font-semibold text-slate-900 dark:text-[color:var(--card-foreground)] mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-amber-500 rounded-full" />
            Top Objections
          </h2>
          <div className="space-y-3">
            {vocData.objections.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No objections found</p>
            ) : (
              vocData.objections.slice(0, 5).map((item, i) => (
                <div key={i} className="border-b border-slate-100 dark:border-slate-700 last:border-0 pb-2 last:pb-0">
                  <p className="text-sm text-slate-700 dark:text-[color:var(--foreground)] font-medium">{item.text}</p>
                  <p className="text-xs text-slate-500 dark:text-[color:var(--muted-foreground)] mt-1">{item.count} mention{item.count !== 1 ? 's' : ''}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Competitors */}
        <div className="bg-white dark:bg-[color:var(--card)] border border-slate-200 dark:border-[color:var(--border)] rounded-xl p-6 animate-fade-in-up [animation-delay:180ms]">
          <h2 className="font-semibold text-slate-900 dark:text-[color:var(--card-foreground)] mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-purple-500 rounded-full" />
            Competitors
          </h2>
          <div className="space-y-3">
            {vocData.competitors.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No competitors mentioned</p>
            ) : (
              vocData.competitors.slice(0, 5).map((item, i) => (
                <div key={i} className="border-b border-slate-100 dark:border-slate-700 last:border-0 pb-2 last:pb-0">
                  <p className="text-sm text-slate-700 dark:text-[color:var(--foreground)] font-medium">{item.name}</p>
                  <p className="text-xs text-slate-500 dark:text-[color:var(--muted-foreground)] mt-1">{item.count} mention{item.count !== 1 ? 's' : ''}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}