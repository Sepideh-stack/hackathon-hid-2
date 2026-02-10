"use client";

import { useEffect, useState } from "react";
import { VocData } from "@/lib/types";

export default function VocDashboardPage() {
  const [vocData, setVocData] = useState<VocData | null>(null);
  const [product, setProduct] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null);
  const [vocSummary, setVocSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const products = ["PIAM Visitor Management", "PKI-as-a-Service"];

  useEffect(() => {
    const params = new URLSearchParams();
    if (product) params.set("product", product);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    fetch(`/api/voc?${params.toString()}`).then(r => r.json()).then(setVocData);
  }, [product, dateFrom, dateTo]);

  const handleGenerateSummary = async () => {
    if (!vocData) return;
    setSummaryLoading(true);
    try {
      const res = await fetch("/api/voc/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: product || "All Products",
          painPoints: vocData.painPoints.map(p => ({ text: p.text, count: p.count })),
          featureRequests: vocData.featureRequests.map(f => ({ text: f.text, count: f.count })),
          objections: vocData.objections.map(o => ({ text: o.text, count: o.count })),
          competitors: vocData.competitors.map(c => ({ name: c.name, count: c.count })),
          totalMeetings: vocData.totalMeetings,
        }),
      });
      const data = await res.json();
      setVocSummary(data.summary);
    } catch {
      setVocSummary("Failed to generate summary. Check your API key.");
    }
    setSummaryLoading(false);
  };

  const toggleTheme = (key: string) => {
    setExpandedTheme(expandedTheme === key ? null : key);
  };

  if (!vocData) return <div className="text-slate-500">Loading...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Voice of Customer Dashboard</h1>
        <p className="text-slate-500 mt-1">Aggregated themes and competitor insights across {vocData.totalMeetings} meetings.</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-8 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Product</label>
          <select
            value={product}
            onChange={e => setProduct(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Products</option>
            {products.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button
          onClick={handleGenerateSummary}
          disabled={summaryLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {summaryLoading ? "Generating..." : "Generate VoC Summary"}
        </button>
      </div>

      {vocSummary && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-purple-900">VoC Executive Summary</h2>
            <button
              onClick={() => navigator.clipboard.writeText(vocSummary)}
              className="text-xs text-purple-600 hover:text-purple-800"
            >
              Copy to clipboard
            </button>
          </div>
          <div className="text-sm text-purple-900 whitespace-pre-wrap">{vocSummary}</div>
        </div>
      )}

      {/* Dashboard grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pain Points */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full" />
            Top Pain Points
          </h2>
          <div className="space-y-2">
            {vocData.painPoints.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No pain points found</p>
            ) : (
              vocData.painPoints.slice(0, 10).map((p, i) => (
                <div key={i}>
                  <button
                    onClick={() => toggleTheme(`pp-${i}`)}
                    className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm text-slate-700">{p.text}</span>
                    <span className="flex items-center gap-2">
                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">{p.count}</span>
                      <svg className={`w-4 h-4 text-slate-400 transition-transform ${expandedTheme === `pp-${i}` ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                  </button>
                  {expandedTheme === `pp-${i}` && (
                    <div className="ml-4 mt-1 space-y-2">
                      {p.snippets.map((s, j) => (
                        <div key={j} className="bg-slate-50 rounded-lg p-3 text-xs">
                          <p className="text-slate-500 mb-1">{s.meetingTitle} &middot; {s.date}</p>
                          <p className="text-slate-700 italic">&ldquo;{s.snippet}&rdquo;</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Feature Requests */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            Top Feature Requests
          </h2>
          <div className="space-y-2">
            {vocData.featureRequests.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No feature requests found</p>
            ) : (
              vocData.featureRequests.slice(0, 10).map((f, i) => (
                <div key={i}>
                  <button
                    onClick={() => toggleTheme(`fr-${i}`)}
                    className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm text-slate-700">{f.text}</span>
                    <span className="flex items-center gap-2">
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">{f.count}</span>
                      <svg className={`w-4 h-4 text-slate-400 transition-transform ${expandedTheme === `fr-${i}` ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                  </button>
                  {expandedTheme === `fr-${i}` && (
                    <div className="ml-4 mt-1 space-y-2">
                      {f.snippets.map((s, j) => (
                        <div key={j} className="bg-slate-50 rounded-lg p-3 text-xs">
                          <p className="text-slate-500 mb-1">{s.meetingTitle} &middot; {s.date}</p>
                          <p className="text-slate-700 italic">&ldquo;{s.snippet}&rdquo;</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Objections */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-amber-500 rounded-full" />
            Top Objections
          </h2>
          <div className="space-y-2">
            {vocData.objections.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No objections found</p>
            ) : (
              vocData.objections.slice(0, 10).map((o, i) => (
                <div key={i}>
                  <button
                    onClick={() => toggleTheme(`ob-${i}`)}
                    className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm text-slate-700">{o.text}</span>
                    <span className="flex items-center gap-2">
                      <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">{o.count}</span>
                      <svg className={`w-4 h-4 text-slate-400 transition-transform ${expandedTheme === `ob-${i}` ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                  </button>
                  {expandedTheme === `ob-${i}` && (
                    <div className="ml-4 mt-1 space-y-2">
                      {o.snippets.map((s, j) => (
                        <div key={j} className="bg-slate-50 rounded-lg p-3 text-xs">
                          <p className="text-slate-500 mb-1">{s.meetingTitle} &middot; {s.date}</p>
                          <p className="text-slate-700 italic">&ldquo;{s.snippet}&rdquo;</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Competitors */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-purple-500 rounded-full" />
            Competitor Mentions
          </h2>
          <div className="space-y-2">
            {vocData.competitors.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No competitors mentioned</p>
            ) : (
              vocData.competitors.slice(0, 10).map((c, i) => (
                <div key={i}>
                  <button
                    onClick={() => toggleTheme(`co-${i}`)}
                    className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm text-slate-700 font-medium">{c.name}</span>
                    <span className="flex items-center gap-2">
                      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">{c.count}</span>
                      <svg className={`w-4 h-4 text-slate-400 transition-transform ${expandedTheme === `co-${i}` ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                  </button>
                  {expandedTheme === `co-${i}` && (
                    <div className="ml-4 mt-1 space-y-2">
                      {c.contexts.map((ctx, j) => (
                        <div key={j} className="bg-slate-50 rounded-lg p-3 text-xs">
                          <p className="text-slate-500 mb-1">{ctx.meetingTitle} &middot; {ctx.date}</p>
                          <p className="text-slate-700 mb-1"><strong>Context:</strong> {ctx.context}</p>
                          <p className="text-slate-600 italic">&ldquo;{ctx.snippet}&rdquo;</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
