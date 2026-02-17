"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Product, VocData } from "@/lib/types";

export default function VocDashboardPage() {
  const router = useRouter();
  const [vocData, setVocData] = useState<VocData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [stage, setStage] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null);

  const regions = ["Nordics", "EU"];
  const stages = ["Discovery", "Evaluation"];

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(setProducts);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (productId) params.set("productId", productId);
    if (region) params.set("region", region);
    if (stage) params.set("stage", stage);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    fetch(`/api/voc?${params.toString()}`).then(r => r.json()).then(setVocData);
  }, [productId, region, stage, dateFrom, dateTo]);

  const toggleTheme = (key: string) => {
    setExpandedTheme(expandedTheme === key ? null : key);
  };

  if (!vocData) {
    return (
      <div className="space-y-3">
        <div className="h-7 w-64 rounded-lg skeleton" />
        <div className="h-4 w-96 max-w-full rounded-lg skeleton" />
        <div className="h-24 w-full rounded-xl skeleton" />
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
        <h1 className="text-2xl font-bold text-slate-900 animate-fade-in-up">Voice of Customer Dashboard</h1>
        <p className="text-slate-500 mt-1 animate-fade-in-up [animation-delay:80ms]">Aggregated themes and competitor insights across {vocData.totalMeetings} meetings.</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-8 flex flex-wrap gap-4 items-end animate-fade-in-up [animation-delay:140ms]">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Product</label>
          <select
            value={productId}
            onChange={e => setProductId(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Products</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Region</label>
          <select
            value={region}
            onChange={e => setRegion(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Regions</option>
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Stage</label>
          <select
            value={stage}
            onChange={e => setStage(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Stages</option>
            {stages.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button
          onClick={() => {
            const params = new URLSearchParams();
            if (productId) params.set("productId", productId);
            if (region) params.set("region", region);
            if (stage) params.set("stage", stage);
            if (dateFrom) params.set("dateFrom", dateFrom);
            if (dateTo) params.set("dateTo", dateTo);
            router.push(`/voc/summary?${params.toString()}`);
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors active:scale-[0.98]"
        >
          Generate VoC Summary
        </button>
      </div>

      {/* Dashboard grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pain Points */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 animate-fade-in-up">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full" />
            Pain Points
          </h2>
          <div className="space-y-2">
            {vocData.painPoints.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No pain points found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 border-b border-slate-200">
                      <th className="py-2 pr-4 font-medium">Pain point</th>
                      <th className="py-2 pr-4 font-medium">Count</th>
                      <th className="py-2 pr-4 font-medium">Context</th>
                      <th className="py-2 pr-0 font-medium">Who reported</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vocData.painPoints.slice(0, 10).map((p, i) => {
                      const first = p.snippets[0];
                      return (
                        <tr key={i} className="border-b border-slate-100 align-top">
                          <td className="py-3 pr-4 text-slate-900 font-medium">
                            {p.text}
                          </td>
                          <td className="py-3 pr-4">
                            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">
                              {p.count}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-slate-700">
                            <div className="text-xs text-slate-500 mb-1">
                              {first?.meetingTitle} &middot; {first?.date}
                            </div>
                            <div className="italic">&ldquo;{first?.snippet}&rdquo;</div>

                            <button
                              onClick={() => toggleTheme(`pp-${i}`)}
                              className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                            >
                              {expandedTheme === `pp-${i}` ? "Hide more" : `Show more (${p.snippets.length - 1})`}
                            </button>

                            {expandedTheme === `pp-${i}` && (
                              <div className="mt-2 space-y-2">
                                {p.snippets.slice(1).map((s, j) => (
                                  <div key={j} className="bg-slate-50 rounded-lg p-3 text-xs">
                                    <p className="text-slate-500 mb-1">{s.meetingTitle} &middot; {s.date}</p>
                                    <p className="text-slate-700 italic">&ldquo;{s.snippet}&rdquo;</p>
                                    {s.who && (
                                      <p className="text-slate-500 mt-1">Who: {s.who}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-3 pr-0 text-slate-700">
                            {first?.who || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Feature Requests */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 animate-fade-in-up [animation-delay:60ms]">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
             Feature Requests
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
                        <div key={j} className="bg-slate-50 rounded-lg p-3 text-xs animate-slide-down">
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
        <div className="bg-white border border-slate-200 rounded-xl p-6 animate-fade-in-up [animation-delay:120ms]">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-amber-500 rounded-full" />
           Objections
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
                        <div key={j} className="bg-slate-50 rounded-lg p-3 text-xs animate-slide-down">
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
        <div className="bg-white border border-slate-200 rounded-xl p-6 animate-fade-in-up [animation-delay:180ms]">
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
                        <div key={j} className="bg-slate-50 rounded-lg p-3 text-xs animate-slide-down">
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
