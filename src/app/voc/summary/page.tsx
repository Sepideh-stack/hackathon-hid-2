"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { VocData } from "@/lib/types";
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

  // Chart colors - Purple gradient with high saturation for top sections
  const COLORS = ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f3f4f6'];

  // Data transformation functions
  const transformForBarChart = (data: Array<{ text: string; count: number }>) => 
    data.slice(0, 5).map(item => ({
      text: item.text.length > 30 ? item.text.substring(0, 30) + '...' : item.text,
      count: item.count
    }));

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
      {/* Return Button */}
      <div className="mb-4">
        <button
          onClick={() => router.push('/voc')}
          className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors flex items-center gap-2 active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Return
        </button>
      </div>
      
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
            Top 5 Pain Points
          </h2>
          <div className="h-64">
            {vocData.painPoints.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No pain points found</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={transformForBarChart(vocData.painPoints)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 'dataMax']} />
                  <YAxis dataKey="text" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Feature Requests */}
        <div className="bg-white dark:bg-[color:var(--card)] border border-slate-200 dark:border-[color:var(--border)] rounded-xl p-6 animate-fade-in-up [animation-delay:60ms]">
          <h2 className="font-semibold text-slate-900 dark:text-[color:var(--card-foreground)] mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            Top 5 Feature Requests
          </h2>
          <div className="h-64">
            {vocData.featureRequests.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No feature requests found</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={transformForBarChart(vocData.featureRequests)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 'dataMax']} />
                  <YAxis dataKey="text" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Objections */}
        <div className="bg-white dark:bg-[color:var(--card)] border border-slate-200 dark:border-[color:var(--border)] rounded-xl p-6 animate-fade-in-up [animation-delay:120ms]">
          <h2 className="font-semibold text-slate-900 dark:text-[color:var(--card-foreground)] mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-amber-500 rounded-full" />
            Top 5 Objections
          </h2>
          <div className="h-64">
            {vocData.objections.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No objections found</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={transformForBarChart(vocData.objections)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 'dataMax']} />
                  <YAxis dataKey="text" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Competitors */}
        <div className="bg-white dark:bg-[color:var(--card)] border border-slate-200 dark:border-[color:var(--border)] rounded-xl p-6 animate-fade-in-up [animation-delay:180ms]">
          <h2 className="font-semibold text-slate-900 dark:text-[color:var(--card-foreground)] mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-purple-500 rounded-full" />
            Competitors
          </h2>
          <div className="h-64">
            {vocData.competitors.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No competitors mentioned</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={transformForPieChart(vocData.competitors)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? ((percent * 100).toFixed(0)) : '0'}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {transformForPieChart(vocData.competitors).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}