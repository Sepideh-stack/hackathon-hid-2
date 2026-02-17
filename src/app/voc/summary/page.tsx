"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AggregatedTheme, AggregatedCompetitor, VocData } from "@/lib/types";
import VocBarTooltip from "@/components/VocBarTooltip";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from "recharts";

export default function VocSummaryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const productId = searchParams.get("productId") || "";
  const region = searchParams.get("region") || "";
  const stage = searchParams.get("stage") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  const [vocData, setVocData] = useState<VocData | null>(null);

  // Chart colors - Modern Indigo/Violet gradient
  const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#eef2ff'];

  // Data transformation functions
  const transformForBarChart = (data: Array<{ text: string; count: number }>) =>
    data.slice(0, 5).map(item => ({
      // show a shortened label in the chart, but keep the original for tooltip lookups
      text: item.text.length > 30 ? item.text.substring(0, 30) + '...' : item.text,
      fullText: item.text,
      count: item.count,
    }));

  const themeMapFromAgg = (items: AggregatedTheme[]) => {
    const m = new Map<string, AggregatedTheme>();
    for (const it of items) m.set(it.text.toLowerCase(), it);
    return m;
  };

  const competitorMapFromAgg = (items: AggregatedCompetitor[]) => {
    const m = new Map<string, AggregatedCompetitor>();
    for (const it of items) m.set(it.name.toLowerCase(), it);
    return m;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipLabelFormatter = (_label: any, payload: any) => {
    const p0 = payload?.[0] as { payload?: { fullText?: string } } | undefined;
    return p0?.payload?.fullText ?? String(_label);
  };

  const transformForPieChart = (data: Array<{ name: string; count: number }>) => 
    data.slice(0, 5).map((item, index) => ({
      name: item.name,
      value: item.count,
      fill: COLORS[index % COLORS.length]
    }));

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
      <div className="space-y-3 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-7 w-64 rounded-lg skeleton bg-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="h-72 rounded-xl skeleton bg-slate-200" />
          <div className="h-72 rounded-xl skeleton bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <button
          onClick={() => router.push('/voc')}
          className="group px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Dashboard
        </button>
        
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">VoC Strategic Summary</h1>
          <p className="mt-2 text-lg text-slate-600 max-w-3xl">
            A comprehensive analysis of customer conversations, highlighting key market signals, competitive intelligence, and product feedback to drive strategic decision-making.
          </p>
        </div>
      </div>

      {/* Strategic Scenario Section */}
      {stage && (
        <div className="animate-fade-in-up [animation-delay:100ms] p-6 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl shadow-sm">
          <h2 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2 text-lg">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            Strategic Scenario - {stage} Stage
          </h2>
          <p className="text-slate-700 leading-relaxed">
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all animate-fade-in-up [animation-delay:300ms] relative hover:z-10">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-lg">
              <span className="w-2 h-8 bg-rose-500 rounded-full" />
              Top Pain Points
            </h2>
            <p className="mt-1 text-sm text-slate-500 ml-4">
              Most frequently mentioned customer challenges and problems.
            </p>
          </div>
          <div className="h-72">
            {vocData.painPoints.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 italic bg-slate-50 rounded-lg">
                No pain points found
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={transformForBarChart(vocData.painPoints)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 'dataMax']} hide />
                  <YAxis 
                    dataKey="text" 
                    type="category" 
                    width={100} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<VocBarTooltip themeMap={themeMapFromAgg(vocData.painPoints)} />}
                    labelFormatter={tooltipLabelFormatter}
                    cursor={{ fill: '#f1f5f9' }}
                    wrapperStyle={{ zIndex: 50 }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#f43f5e" 
                    radius={[0, 4, 4, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Feature Requests */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all animate-fade-in-up [animation-delay:400ms] relative hover:z-10">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-lg">
              <span className="w-2 h-8 bg-emerald-500 rounded-full" />
              Feature Requests
            </h2>
            <p className="mt-1 text-sm text-slate-500 ml-4">
              Most desired capabilities and product enhancements.
            </p>
          </div>
          <div className="h-72">
            {vocData.featureRequests.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 italic bg-slate-50 rounded-lg">
                No feature requests found
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={transformForBarChart(vocData.featureRequests)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 'dataMax']} hide />
                  <YAxis 
                    dataKey="text" 
                    type="category" 
                    width={100}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<VocBarTooltip themeMap={themeMapFromAgg(vocData.featureRequests)} />}
                    labelFormatter={tooltipLabelFormatter}
                    cursor={{ fill: '#f1f5f9' }}
                    wrapperStyle={{ zIndex: 50 }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#10b981" 
                    radius={[0, 4, 4, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Objections */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all animate-fade-in-up [animation-delay:500ms] relative hover:z-10">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-lg">
              <span className="w-2 h-8 bg-amber-500 rounded-full" />
              Common Objections
            </h2>
            <p className="mt-1 text-sm text-slate-500 ml-4">
              Primary reasons for hesitation or pushback from prospects.
            </p>
          </div>
          <div className="h-72">
            {vocData.objections.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 italic bg-slate-50 rounded-lg">
                No objections found
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={transformForBarChart(vocData.objections)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 'dataMax']} hide />
                  <YAxis 
                    dataKey="text" 
                    type="category" 
                    width={100}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<VocBarTooltip themeMap={themeMapFromAgg(vocData.objections)} />}
                    labelFormatter={tooltipLabelFormatter}
                    cursor={{ fill: '#f1f5f9' }}
                    wrapperStyle={{ zIndex: 50 }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#f59e0b" 
                    radius={[0, 4, 4, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Competitors */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all animate-fade-in-up [animation-delay:600ms] relative hover:z-10">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-lg">
              <span className="w-2 h-8 bg-indigo-500 rounded-full" />
              Competitor Mentions
            </h2>
            <p className="mt-1 text-sm text-slate-500 ml-4">
              Share of voice among mentioned competitors.
            </p>
          </div>
          <div className="h-72">
            {vocData.competitors.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 italic bg-slate-50 rounded-lg">
                No competitors mentioned
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={transformForPieChart(vocData.competitors)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {transformForPieChart(vocData.competitors).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={<VocBarTooltip competitorMap={competitorMapFromAgg(vocData.competitors)} />}
                    wrapperStyle={{ zIndex: 50 }} 
                  />
                  <Legend 
                    verticalAlign="middle" 
                    align="right"
                    layout="vertical"
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
