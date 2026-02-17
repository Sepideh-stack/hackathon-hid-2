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
      <div className="space-y-3 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-7 w-64 rounded-lg skeleton bg-slate-200" />
        <div className="h-4 w-96 max-w-full rounded-lg skeleton bg-slate-200" />
        <div className="h-24 w-full rounded-xl skeleton bg-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-72 rounded-xl skeleton bg-slate-200" />
          <div className="h-72 rounded-xl skeleton bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Voice of Customer Dashboard</h1>
        <p className="text-lg text-slate-600 mt-2 max-w-3xl">
          Aggregated themes and competitor insights across <span className="font-semibold text-slate-900">{vocData.totalMeetings}</span> meetings.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fade-in-up [animation-delay:140ms]">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Product</label>
            <select
              value={productId}
              onChange={e => setProductId(e.target.value)}
              className="w-full min-w-[140px] border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:bg-slate-100"
            >
              <option value="">All Products</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Region</label>
            <select
              value={region}
              onChange={e => setRegion(e.target.value)}
              className="w-full min-w-[140px] border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:bg-slate-100"
            >
              <option value="">All Regions</option>
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Stage</label>
            <select
              value={stage}
              onChange={e => setStage(e.target.value)}
              className="w-full min-w-[140px] border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:bg-slate-100"
            >
              <option value="">All Stages</option>
              {stages.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:bg-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:bg-slate-100"
            />
          </div>
          <div className="flex-grow" />
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
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-2"
          >
            <span>Generate Summary</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Dashboard grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pain Points */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-lg">
              <span className="w-2 h-8 bg-rose-500 rounded-full" />
              Pain Points
            </h2>
            <p className="mt-1 text-sm text-slate-500 ml-4">
              Top customer challenges identified in conversations.
            </p>
          </div>
          <div className="space-y-2">
            {vocData.painPoints.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No pain points found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 border-b border-slate-200">
                      <th className="py-2 pr-4 font-medium w-full">Pain point</th>
                      <th className="py-2 pr-4 font-medium whitespace-nowrap">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vocData.painPoints.slice(0, 10).map((p, i) => {
                      const isExpanded = expandedTheme === `pp-${i}`;
                      return (
                        <tbody key={i} className="border-b border-slate-100">
                          <tr 
                            className="hover:bg-slate-50 transition-colors cursor-pointer" 
                            onClick={() => toggleTheme(`pp-${i}`)}
                          >
                            <td className="py-3 pr-4 text-slate-900 font-medium">
                              <div className="flex items-center gap-2">
                                <svg
                                  className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                </svg>
                                <span className="truncate block max-w-[300px] md:max-w-md" title={p.text}>{p.text}</span>
                              </div>
                            </td>
                            <td className="py-3 pr-0 text-slate-700">
                              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">{p.count}</span>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr>
                              <td colSpan={2} className="pb-4 pt-2 px-4 bg-slate-50/50">
                                <div className="space-y-2">
                                  {p.snippets.slice(0, 6).map((s, j) => (
                                    <div key={j} className="bg-white border border-slate-200 rounded-lg p-3 text-xs shadow-sm">
                                      <p className="text-slate-500 mb-1">
                                        {s.meetingTitle} &middot; {s.date}
                                        {s.who ? `   Who: ${s.who}` : ""}
                                      </p>
                                      <p className="text-slate-700 italic">&ldquo;{s.snippet}&rdquo;</p>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Feature Requests */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up [animation-delay:60ms]">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-lg">
              <span className="w-2 h-8 bg-emerald-500 rounded-full" />
              Feature Requests
            </h2>
            <p className="mt-1 text-sm text-slate-500 ml-4">
              Most requested features and capabilities.
            </p>
          </div>
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up [animation-delay:120ms]">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-lg">
              <span className="w-2 h-8 bg-amber-500 rounded-full" />
              Objections
            </h2>
            <p className="mt-1 text-sm text-slate-500 ml-4">
              Common pushback and reasons for hesitation.
            </p>
          </div>
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up [animation-delay:180ms]">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-lg">
              <span className="w-2 h-8 bg-indigo-500 rounded-full" />
              Competitor Mentions
            </h2>
            <p className="mt-1 text-sm text-slate-500 ml-4">
              Competitors frequently discussed by prospects.
            </p>
          </div>
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
