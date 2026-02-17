"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Opportunity, Account, ExtractedInsights, SalesforceFields } from "@/lib/types";

export default function NewMeetingPage() {
  const params = useParams();
  const router = useRouter();
  const opportunityId = params.opportunityId as string;

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [account, setAccount] = useState<Account | null>(null);

  const [title, setTitle] = useState("");
  const [participants, setParticipants] = useState("Alex Berg, ");
  const [transcript, setTranscript] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const [extracting, setExtracting] = useState(false);
  const [insights, setInsights] = useState<ExtractedInsights | null>(null);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<"input" | "review" | "saved">("input");

  useEffect(() => {
    fetch("/api/opportunities").then(r => r.json()).then((opps: Opportunity[]) => {
      const opp = opps.find(o => o.id === opportunityId);
      if (opp) {
        setOpportunity(opp);
        fetch("/api/accounts").then(r => r.json()).then((accs: Account[]) => {
          setAccount(accs.find(a => a.id === opp.accountId) || null);
        });
      }
    });
  }, [opportunityId]);

  const handleExtract = async () => {
    setExtracting(true);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setInsights(data);
      setStep("review");
    } catch (err) {
      alert("Failed to extract insights. Make sure your OPENROUTER_API_KEY is set in .env.local");
      console.error(err);
    }
    setExtracting(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId,
          accountId: opportunity?.accountId,
          title,
          date,
          participants: participants.split(",").map(p => p.trim()).filter(Boolean),
          transcriptRaw: transcript,
          insights,
        }),
      });
      setStep("saved");
    } catch (err) {
      alert("Failed to save meeting");
      console.error(err);
    }
    setSaving(false);
  };

  const updateInsightField = (
    field: keyof ExtractedInsights,
    index: number,
    key: string,
    value: string
  ) => {
    if (!insights) return;
    const updated = { ...insights };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arr = [...(updated[field] as any[])];
    arr[index] = { ...arr[index], [key]: value };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated as any)[field] = arr;
    setInsights(updated);
  };

  const updateSalesforceField = (key: keyof SalesforceFields, value: string | boolean | string[]) => {
    if (!insights) return;
    const sf = insights.salesforce || {} as SalesforceFields;
    setInsights({ ...insights, salesforce: { ...sf, [key]: value } });
  };

  if (!opportunity) {
    return (
      <div className="space-y-3">
        <div className="h-5 w-40 rounded-lg skeleton" />
        <div className="h-7 w-72 max-w-full rounded-lg skeleton" />
        <div className="h-4 w-96 max-w-full rounded-lg skeleton" />
        <div className="h-72 w-full rounded-xl skeleton" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href={`/sales/${opportunityId}`} className="text-sm text-blue-600 hover:text-blue-800 dark:text-[color:var(--primary)] dark:hover:text-[color:var(--ring)] flex items-center gap-1 mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Back to {opportunity.name}
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-[color:var(--foreground)] mb-1 animate-fade-in-up">Record New Meeting</h1>
      <p className="text-slate-500 dark:text-[color:var(--muted-foreground)] mb-8 animate-fade-in-up [animation-delay:80ms]">{opportunity.name} &middot; {account?.name}</p>

      {/* Progress steps */}
      <div className="flex items-center gap-4 mb-8">
        {["Input", "Review", "Saved"].map((label, i) => {
          const stepNames = ["input", "review", "saved"];
          const currentIdx = stepNames.indexOf(step);
          const isActive = i === currentIdx;
          const isDone = i < currentIdx;
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isDone ? "bg-green-100 text-green-700" : isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
              }`}>
                {isDone ? "\u2713" : i + 1}
              </div>
              <span className={`text-sm ${isActive ? "font-medium text-slate-900 dark:text-[color:var(--foreground)]" : "text-slate-400"}`}>{label}</span>
              {i < 2 && <div className="w-12 h-px bg-slate-200 dark:bg-[color:var(--border)] ml-2" />}
            </div>
          );
        })}
      </div>

      {step === "input" && (
        <div className="bg-white dark:bg-[color:var(--card)] border border-slate-200 dark:border-[color:var(--border)] rounded-xl p-6 space-y-6 animate-fade-in-up">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-[color:var(--muted-foreground)] mb-1">Meeting Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Discovery Call - Nordea"
                className="w-full border border-slate-300 dark:border-[color:var(--border)] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-[color:var(--muted-foreground)] mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full border border-slate-300 dark:border-[color:var(--border)] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-[color:var(--muted-foreground)] mb-1">Participants (comma-separated)</label>
            <input
              type="text"
              value={participants}
              onChange={e => setParticipants(e.target.value)}
              placeholder="Alex Berg, Johan Lindqvist"
              className="w-full border border-slate-300 dark:border-[color:var(--border)] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-[color:var(--muted-foreground)] mb-1">Meeting Transcript / Notes</label>
            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              rows={16}
              placeholder="Paste your meeting transcript or notes here...&#10;&#10;Alex: Thanks for joining today.&#10;Customer: Sure, let me walk you through our current process..."
              className="w-full border border-slate-300 dark:border-[color:var(--border)] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleExtract}
              disabled={!title || !transcript || extracting}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-[0.98]"
            >
              {extracting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Extracting &amp; Scoring with AI...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                  </svg>
                  Extract &amp; Score with AI
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {step === "review" && insights && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[color:var(--card)] border border-slate-200 dark:border-[color:var(--border)] rounded-xl p-6 animate-fade-in-up">
            <h2 className="font-semibold text-slate-900 dark:text-[color:var(--card-foreground)] mb-3">Meeting Summary</h2>
            <textarea
              value={insights.summary}
              onChange={e => setInsights({ ...insights, summary: e.target.value })}
              rows={3}
              className="w-full border border-slate-300 dark:border-[color:var(--border)] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pain Points */}
            <div className="bg-white dark:bg-[color:var(--card)] border border-slate-200 dark:border-[color:var(--border)] rounded-xl p-6 animate-fade-in-up [animation-delay:80ms]">
              <h3 className="font-semibold text-red-700 dark:text-[color:var(--foreground)] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                Pain Points ({insights.painPoints.length})
              </h3>
              <div className="space-y-4">
                {insights.painPoints.map((p, i) => (
                  <div key={i} className="space-y-1.5 p-3 rounded-lg bg-slate-50/50 dark:bg-[color:var(--muted)] border border-slate-100 dark:border-[color:var(--border)]">
                    <div className="flex items-start gap-2">
                      <input
                        value={p.text}
                        onChange={e => updateInsightField("painPoints", i, "text", e.target.value)}
                        className="flex-1 border border-slate-200 dark:border-[color:var(--border)] rounded px-2 py-1 text-sm bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    {p.confidence !== undefined && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                p.confidence >= 75 ? 'bg-green-500' :
                                p.confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${p.confidence}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold tabular-nums min-w-[2.5rem] text-right ${
                            p.confidence >= 75 ? 'text-green-600' :
                            p.confidence >= 40 ? 'text-amber-600' : 'text-red-600'
                          }`}>{p.confidence}%</span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                            p.confidenceLabel === 'High' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                            p.confidenceLabel === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                          }`}>{p.confidenceLabel}</span>
                        </div>
                        {p.reasoning && (
                          <p className="text-[11px] text-slate-500 dark:text-[color:var(--muted-foreground)] leading-tight">
                            <span className="font-medium">AI reasoning:</span> {p.reasoning}
                          </p>
                        )}
                        {p.improvedText && p.improvedText !== p.text && (
                          <button
                            onClick={() => updateInsightField("painPoints", i, "text", p.improvedText!)}
                            className="text-[11px] text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" /></svg>
                            Apply AI suggestion: &ldquo;{p.improvedText}&rdquo;
                          </button>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-slate-400 dark:text-[color:var(--muted-foreground)] italic pl-1">&ldquo;{p.snippet}&rdquo;</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Requests */}
            <div className="bg-white dark:bg-[color:var(--card)] border border-slate-200 dark:border-[color:var(--border)] rounded-xl p-6 animate-fade-in-up [animation-delay:120ms]">
              <h3 className="font-semibold text-green-700 dark:text-[color:var(--foreground)] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Feature Requests ({insights.featureRequests.length})
              </h3>
              <div className="space-y-4">
                {insights.featureRequests.map((f, i) => (
                  <div key={i} className="space-y-1.5 p-3 rounded-lg bg-slate-50/50 dark:bg-[color:var(--muted)] border border-slate-100 dark:border-[color:var(--border)]">
                    <input
                      value={f.text}
                      onChange={e => updateInsightField("featureRequests", i, "text", e.target.value)}
                      className="w-full border border-slate-200 dark:border-[color:var(--border)] rounded px-2 py-1 text-sm bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    {f.confidence !== undefined && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                f.confidence >= 75 ? 'bg-green-500' :
                                f.confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${f.confidence}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold tabular-nums min-w-[2.5rem] text-right ${
                            f.confidence >= 75 ? 'text-green-600' :
                            f.confidence >= 40 ? 'text-amber-600' : 'text-red-600'
                          }`}>{f.confidence}%</span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                            f.confidenceLabel === 'High' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                            f.confidenceLabel === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                          }`}>{f.confidenceLabel}</span>
                        </div>
                        {f.reasoning && (
                          <p className="text-[11px] text-slate-500 dark:text-[color:var(--muted-foreground)] leading-tight">
                            <span className="font-medium">AI reasoning:</span> {f.reasoning}
                          </p>
                        )}
                        {f.improvedText && f.improvedText !== f.text && (
                          <button
                            onClick={() => updateInsightField("featureRequests", i, "text", f.improvedText!)}
                            className="text-[11px] text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" /></svg>
                            Apply AI suggestion: &ldquo;{f.improvedText}&rdquo;
                          </button>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-slate-400 dark:text-[color:var(--muted-foreground)] italic pl-1">&ldquo;{f.snippet}&rdquo;</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Objections */}
            <div className="bg-white dark:bg-[color:var(--card)] border border-slate-200 dark:border-[color:var(--border)] rounded-xl p-6 animate-fade-in-up [animation-delay:160ms]">
              <h3 className="font-semibold text-amber-700 dark:text-[color:var(--foreground)] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                Objections ({insights.objections.length})
              </h3>
              <div className="space-y-4">
                {insights.objections.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-[color:var(--muted-foreground)] italic">No objections detected</p>
                ) : (
                  insights.objections.map((o, i) => (
                    <div key={i} className="space-y-1.5 p-3 rounded-lg bg-slate-50/50 dark:bg-[color:var(--muted)] border border-slate-100 dark:border-[color:var(--border)]">
                      <input
                        value={o.text}
                        onChange={e => updateInsightField("objections", i, "text", e.target.value)}
                        className="w-full border border-slate-200 dark:border-[color:var(--border)] rounded px-2 py-1 text-sm bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      {o.confidence !== undefined && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  o.confidence >= 75 ? 'bg-green-500' :
                                  o.confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${o.confidence}%` }}
                              />
                            </div>
                            <span className={`text-xs font-bold tabular-nums min-w-[2.5rem] text-right ${
                              o.confidence >= 75 ? 'text-green-600' :
                              o.confidence >= 40 ? 'text-amber-600' : 'text-red-600'
                            }`}>{o.confidence}%</span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                              o.confidenceLabel === 'High' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                              o.confidenceLabel === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                              'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                            }`}>{o.confidenceLabel}</span>
                          </div>
                          {o.reasoning && (
                            <p className="text-[11px] text-slate-500 dark:text-[color:var(--muted-foreground)] leading-tight">
                              <span className="font-medium">AI reasoning:</span> {o.reasoning}
                            </p>
                          )}
                          {o.improvedText && o.improvedText !== o.text && (
                            <button
                              onClick={() => updateInsightField("objections", i, "text", o.improvedText!)}
                              className="text-[11px] text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" /></svg>
                              Apply AI suggestion: &ldquo;{o.improvedText}&rdquo;
                            </button>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-slate-400 dark:text-[color:var(--muted-foreground)] italic pl-1">&ldquo;{o.snippet}&rdquo;</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Competitors */}
            <div className="bg-white dark:bg-[color:var(--card)] border border-slate-200 dark:border-[color:var(--border)] rounded-xl p-6 animate-fade-in-up [animation-delay:200ms]">
              <h3 className="font-semibold text-purple-700 dark:text-[color:var(--foreground)] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full" />
                Competitors ({insights.competitors.length})
              </h3>
              <div className="space-y-4">
                {insights.competitors.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-[color:var(--muted-foreground)] italic">No competitors mentioned</p>
                ) : (
                  insights.competitors.map((c, i) => (
                    <div key={i} className="space-y-1.5 p-3 rounded-lg bg-slate-50/50 dark:bg-[color:var(--muted)] border border-slate-100 dark:border-[color:var(--border)]">
                      <div className="flex gap-2">
                        <input
                          value={c.name}
                          onChange={e => updateInsightField("competitors", i, "name", e.target.value)}
                          className="w-1/3 border border-slate-200 dark:border-[color:var(--border)] rounded px-2 py-1 text-sm font-medium bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                          value={c.context}
                          onChange={e => updateInsightField("competitors", i, "context", e.target.value)}
                          className="w-2/3 border border-slate-200 dark:border-[color:var(--border)] rounded px-2 py-1 text-sm bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      {c.confidence !== undefined && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  c.confidence >= 75 ? 'bg-green-500' :
                                  c.confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${c.confidence}%` }}
                              />
                            </div>
                            <span className={`text-xs font-bold tabular-nums min-w-[2.5rem] text-right ${
                              c.confidence >= 75 ? 'text-green-600' :
                              c.confidence >= 40 ? 'text-amber-600' : 'text-red-600'
                            }`}>{c.confidence}%</span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                              c.confidenceLabel === 'High' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                              c.confidenceLabel === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                              'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                            }`}>{c.confidenceLabel}</span>
                          </div>
                          {c.reasoning && (
                            <p className="text-[11px] text-slate-500 dark:text-[color:var(--muted-foreground)] leading-tight">
                              <span className="font-medium">AI reasoning:</span> {c.reasoning}
                            </p>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-slate-400 dark:text-[color:var(--muted-foreground)] italic pl-1">&ldquo;{c.snippet}&rdquo;</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-white dark:bg-[color:var(--card)] border border-slate-200 dark:border-[color:var(--border)] rounded-xl p-6 animate-fade-in-up [animation-delay:240ms]">
            <h3 className="font-semibold text-slate-900 dark:text-[color:var(--card-foreground)] mb-3">Action Items ({insights.actionItems.length})</h3>
            <div className="space-y-3">
              {insights.actionItems.map((a, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-50/50 dark:bg-[color:var(--muted)] border border-slate-100 dark:border-[color:var(--border)] space-y-1.5">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={a.done}
                      onChange={e => {
                        const updated = [...insights.actionItems];
                        updated[i] = { ...updated[i], done: e.target.checked };
                        setInsights({ ...insights, actionItems: updated });
                      }}
                      className="rounded"
                    />
                    <input
                      value={a.text}
                      onChange={e => {
                        const updated = [...insights.actionItems];
                        updated[i] = { ...updated[i], text: e.target.value };
                        setInsights({ ...insights, actionItems: updated });
                      }}
                      className="flex-1 border border-slate-200 dark:border-[color:var(--border)] rounded px-2 py-1 text-sm bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      value={a.owner}
                      onChange={e => {
                        const updated = [...insights.actionItems];
                        updated[i] = { ...updated[i], owner: e.target.value };
                        setInsights({ ...insights, actionItems: updated });
                      }}
                      className="w-40 border border-slate-200 dark:border-[color:var(--border)] rounded px-2 py-1 text-sm bg-white dark:bg-[color:var(--card)] text-slate-600 dark:text-[color:var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  {a.confidence !== undefined && (
                    <div className="flex items-center gap-2 ml-7">
                      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden max-w-[200px]">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            a.confidence >= 75 ? 'bg-green-500' :
                            a.confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${a.confidence}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-bold tabular-nums ${
                        a.confidence >= 75 ? 'text-green-600' :
                        a.confidence >= 40 ? 'text-amber-600' : 'text-red-600'
                      }`}>{a.confidence}%</span>
                      {a.reasoning && (
                        <span className="text-[10px] text-slate-400 dark:text-[color:var(--muted-foreground)]">{a.reasoning}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Salesforce Fields */}
          {insights.salesforce && (
            <div className="bg-white dark:bg-[color:var(--card)] border border-blue-200 dark:border-[color:var(--border)] rounded-xl p-6 animate-fade-in-up [animation-delay:280ms]">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
                </svg>
                <h3 className="font-semibold text-blue-700 dark:text-blue-400">Salesforce Activity Fields</h3>
              </div>

              {/* Row 1: Stage, Sentiment, Engagement, Risk */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-[color:var(--muted-foreground)] mb-1">Recommended Stage</label>
                  <select
                    value={insights.salesforce.recommendedStage}
                    onChange={e => updateSalesforceField('recommendedStage', e.target.value)}
                    className="w-full border border-slate-200 dark:border-[color:var(--border)] rounded px-2 py-1.5 text-sm bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {['Prospecting', 'Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-[color:var(--muted-foreground)] mb-1">Sentiment</label>
                  <select
                    value={insights.salesforce.sentiment}
                    onChange={e => updateSalesforceField('sentiment', e.target.value)}
                    className="w-full border border-slate-200 dark:border-[color:var(--border)] rounded px-2 py-1.5 text-sm bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {['Positive', 'Neutral', 'Negative', 'Mixed'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-[color:var(--muted-foreground)] mb-1">Engagement Level</label>
                  <select
                    value={insights.salesforce.engagementLevel}
                    onChange={e => updateSalesforceField('engagementLevel', e.target.value)}
                    className="w-full border border-slate-200 dark:border-[color:var(--border)] rounded px-2 py-1.5 text-sm bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {['High', 'Medium', 'Low'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-[color:var(--muted-foreground)] mb-1">Deal Risk</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={insights.salesforce.dealRisk}
                      onChange={e => updateSalesforceField('dealRisk', e.target.value)}
                      className="w-full border border-slate-200 dark:border-[color:var(--border)] rounded px-2 py-1.5 text-sm bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {['Low', 'Medium', 'High'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      insights.salesforce.dealRisk === 'Low' ? 'bg-green-500' :
                      insights.salesforce.dealRisk === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                  </div>
                </div>
              </div>

              {/* Risk Reason & Call Disposition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-[color:var(--muted-foreground)] mb-1">Deal Risk Reason</label>
                  <input
                    value={insights.salesforce.dealRiskReason}
                    onChange={e => updateSalesforceField('dealRiskReason', e.target.value)}
                    className="w-full border border-slate-200 dark:border-[color:var(--border)] rounded px-2 py-1.5 text-sm bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-[color:var(--muted-foreground)] mb-1">Call Disposition</label>
                  <select
                    value={insights.salesforce.callDisposition}
                    onChange={e => updateSalesforceField('callDisposition', e.target.value)}
                    className="w-full border border-slate-200 dark:border-[color:var(--border)] rounded px-2 py-1.5 text-sm bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {['Interested', 'Follow-up Needed', 'Not Interested', 'No Answer', 'Left Voicemail', 'Completed'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Next Steps */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-500 dark:text-[color:var(--muted-foreground)] mb-1">Next Steps</label>
                <textarea
                  value={insights.salesforce.nextSteps}
                  onChange={e => updateSalesforceField('nextSteps', e.target.value)}
                  rows={2}
                  className="w-full border border-slate-200 dark:border-[color:var(--border)] rounded px-2 py-1.5 text-sm bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* BANT Qualification */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-[color:var(--muted-foreground)] uppercase tracking-wider mb-3">BANT Qualification</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Budget */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-[color:var(--muted)]">
                    <input
                      type="checkbox"
                      checked={insights.salesforce.budgetDiscussed}
                      onChange={e => updateSalesforceField('budgetDiscussed', e.target.checked)}
                      className="rounded mt-0.5"
                    />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-[color:var(--foreground)]">Budget Discussed</label>
                      <input
                        value={insights.salesforce.budgetNotes}
                        onChange={e => updateSalesforceField('budgetNotes', e.target.value)}
                        placeholder="Budget details..."
                        className="w-full mt-1 border border-slate-200 dark:border-[color:var(--border)] rounded px-2 py-1 text-xs bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  {/* Authority */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-[color:var(--muted)]">
                    <input
                      type="checkbox"
                      checked={insights.salesforce.authorityIdentified}
                      onChange={e => updateSalesforceField('authorityIdentified', e.target.checked)}
                      className="rounded mt-0.5"
                    />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-[color:var(--foreground)]">Authority Identified</label>
                      <input
                        value={insights.salesforce.decisionMaker}
                        onChange={e => updateSalesforceField('decisionMaker', e.target.value)}
                        placeholder="Decision maker..."
                        className="w-full mt-1 border border-slate-200 dark:border-[color:var(--border)] rounded px-2 py-1 text-xs bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  {/* Need */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-[color:var(--muted)]">
                    <input
                      type="checkbox"
                      checked={insights.salesforce.needValidated}
                      onChange={e => updateSalesforceField('needValidated', e.target.checked)}
                      className="rounded mt-0.5"
                    />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-[color:var(--foreground)]">Need Validated</label>
                      <input
                        value={insights.salesforce.needSummary}
                        onChange={e => updateSalesforceField('needSummary', e.target.value)}
                        placeholder="Customer need..."
                        className="w-full mt-1 border border-slate-200 dark:border-[color:var(--border)] rounded px-2 py-1 text-xs bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  {/* Timeline */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-[color:var(--muted)]">
                    <input
                      type="checkbox"
                      checked={insights.salesforce.timelineDiscussed}
                      onChange={e => updateSalesforceField('timelineDiscussed', e.target.checked)}
                      className="rounded mt-0.5"
                    />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-[color:var(--foreground)]">Timeline Discussed</label>
                      <input
                        value={insights.salesforce.timelineNotes}
                        onChange={e => updateSalesforceField('timelineNotes', e.target.value)}
                        placeholder="Timeline details..."
                        className="w-full mt-1 border border-slate-200 dark:border-[color:var(--border)] rounded px-2 py-1 text-xs bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Champion & Follow-up */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-[color:var(--muted)]">
                  <input
                    type="checkbox"
                    checked={insights.salesforce.championIdentified}
                    onChange={e => updateSalesforceField('championIdentified', e.target.checked)}
                    className="rounded mt-0.5"
                  />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-[color:var(--foreground)]">Champion Identified</label>
                    <input
                      value={insights.salesforce.championName}
                      onChange={e => updateSalesforceField('championName', e.target.value)}
                      placeholder="Champion name..."
                      className="w-full mt-1 border border-slate-200 dark:border-[color:var(--border)] rounded px-2 py-1 text-xs bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-[color:var(--muted-foreground)] mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    value={insights.salesforce.followUpDate}
                    onChange={e => updateSalesforceField('followUpDate', e.target.value)}
                    className="w-full border border-slate-200 dark:border-[color:var(--border)] rounded px-2 py-1.5 text-sm bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-[color:var(--muted-foreground)] mb-1">Key Topics</label>
                  <div className="flex flex-wrap gap-1">
                    {(insights.salesforce.keyTopics || []).map((topic, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {topic}
                        <button
                          onClick={() => {
                            const updated = insights.salesforce!.keyTopics.filter((_, idx) => idx !== i);
                            updateSalesforceField('keyTopics', updated);
                          }}
                          className="hover:text-blue-900 dark:hover:text-blue-100"
                        >&times;</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setStep("input")}
              className="px-4 py-2 border border-slate-300 dark:border-[color:var(--border)] rounded-lg text-sm text-slate-700 dark:text-[color:var(--foreground)] hover:bg-slate-50 dark:hover:bg-[color:var(--muted)] transition-colors"
            >
              Back to Edit Transcript
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 active:scale-[0.98]"
            >
              {saving ? "Saving to CRM..." : "Save to CRM"}
            </button>
          </div>
        </div>
      )}

      {step === "saved" && (
        <div className="bg-white dark:bg-[color:var(--card)] border border-green-200 dark:border-[color:var(--border)] rounded-xl p-12 text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-[color:var(--foreground)] mb-2">Meeting Saved Successfully</h2>
          <p className="text-slate-500 dark:text-[color:var(--muted-foreground)] mb-6">The meeting and extracted insights have been saved to the CRM.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push(`/sales/${opportunityId}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              View Opportunity Timeline
            </button>
            <button
              onClick={() => {
                setStep("input");
                setTitle("");
                setTranscript("");
                setInsights(null);
                setParticipants("Alex Berg, ");
                setDate(new Date().toISOString().split("T")[0]);
              }}
              className="px-4 py-2 border border-slate-300 dark:border-[color:var(--border)] rounded-lg text-sm text-slate-700 dark:text-[color:var(--foreground)] hover:bg-slate-50 dark:hover:bg-[color:var(--muted)] transition-colors"
            >
              Record Another Meeting
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
