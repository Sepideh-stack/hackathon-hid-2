"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Account, Opportunity, Meeting } from "@/lib/types";
import MeetingTimelineTree from "@/components/MeetingTimelineTree";

function clampList<T>(items: T[], max: number) {
  return items.slice(0, max);
}

function buildBriefingParagraph(meeting: Meeting | undefined) {
  if (!meeting?.insights) return "No extracted insights yet. Record a meeting to generate a briefing.";

  const pp = meeting.insights.painPoints.map(x => x.text).filter(Boolean);
  const fr = meeting.insights.featureRequests.map(x => x.text).filter(Boolean);
  const ob = meeting.insights.objections.map(x => x.text).filter(Boolean);
  const co = meeting.insights.competitors.map(x => x.name).filter(Boolean);

  const bits: string[] = [];
  if (pp.length) bits.push(`key pain points (${clampList(pp, 2).join(", ")})`);
  if (fr.length) bits.push(`requested capabilities (${clampList(fr, 2).join(", ")})`);
  if (ob.length) bits.push(`objections (${clampList(ob, 2).join(", ")})`);
  if (co.length) bits.push(`competitive context (${clampList(co, 2).join(", ")})`);

  const base = bits.length
    ? `In the last meeting (${new Date(meeting.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}), we discussed ${bits.join(", ")}.`
    : `In the last meeting (${new Date(meeting.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}), we captured a high-level summary and next steps.`;

  const ask = "On the next call, confirm whether these priorities have changed and ask for any new stakeholders or timeline updates.";
  return `${base} ${ask}`;
}

export default function OpportunityDetailPage() {
  const params = useParams();
  const opportunityId = params.opportunityId as string;

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showBriefing, setShowBriefing] = useState(false);
  const [emailContent, setEmailContent] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMeetingId, setEmailMeetingId] = useState<string | null>(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/opportunities`).then(r => r.json()).then((opps: Opportunity[]) => {
      const opp = opps.find(o => o.id === opportunityId);
      if (opp) {
        setOpportunity(opp);
        fetch(`/api/accounts`).then(r => r.json()).then((accs: Account[]) => {
          setAccount(accs.find(a => a.id === opp.accountId) || null);
        });
      }
    });
    fetch(`/api/meetings?opportunityId=${opportunityId}`).then(r => r.json()).then(setMeetings);
  }, [opportunityId]);

  const defaultSelectedMeetingId = useMemo(() => {
    if (meetings.length === 0) return null;
    const sorted = [...meetings].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sorted[0]?.id ?? null;
  }, [meetings]);

  const effectiveSelectedMeetingId = selectedMeetingId ?? defaultSelectedMeetingId;

  const visibleMeetings = effectiveSelectedMeetingId
    ? meetings.filter(m => m.id === effectiveSelectedMeetingId)
    : meetings;

  const allPainPoints = meetings.flatMap(m => m.insights?.painPoints || []);
  const allFeatureRequests = meetings.flatMap(m => m.insights?.featureRequests || []);
  const allObjections = meetings.flatMap(m => m.insights?.objections || []);
  const allCompetitors = meetings.flatMap(m => m.insights?.competitors || []);
  const allActionItems = meetings.flatMap(m => m.insights?.actionItems || []);
  const openActions = allActionItems.filter(a => !a.done);

  const selectedMeeting = effectiveSelectedMeetingId
    ? meetings.find(m => m.id === effectiveSelectedMeetingId)
    : meetings[0];

  const briefingParagraph = buildBriefingParagraph(selectedMeeting);

  const briefingPainPoints = clampList(allPainPoints, 4);
  const briefingFeatureRequests = clampList(allFeatureRequests, 4);
  const briefingObjections = clampList(allObjections, 4);
  const briefingCompetitors = clampList(allCompetitors, 4);
  const briefingOpenActions = clampList(openActions, 4);

  const handleReadOutLoud = () => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();

    const lines: string[] = [
      `Briefing for ${account?.name ?? "the customer"}.`,
      briefingParagraph,
    ];
    if (briefingPainPoints.length) lines.push(`Pain points: ${briefingPainPoints.map(x => x.text).join(". ")}.`);
    if (briefingFeatureRequests.length) lines.push(`Feature requests: ${briefingFeatureRequests.map(x => x.text).join(". ")}.`);
    if (briefingObjections.length) lines.push(`Objections: ${briefingObjections.map(x => x.text).join(". ")}.`);
    if (briefingCompetitors.length) lines.push(`Competitors: ${briefingCompetitors.map(x => x.name).join(", ")}.`);
    if (briefingOpenActions.length) lines.push(`Action items: ${briefingOpenActions.map(x => `${x.owner}: ${x.text}`).join(". ")}.`);

    const utterance = new SpeechSynthesisUtterance(lines.join("\n"));
    utterance.rate = 1;
    utterance.pitch = 1;
    synth.speak(utterance);
  };

  const handleGenerateEmail = async (meeting: Meeting) => {
    if (!meeting.insights || !account) return;
    setEmailLoading(true);
    setEmailMeetingId(meeting.id);
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountName: account.name,
          summary: meeting.insights.summary,
          actionItems: meeting.insights.actionItems,
          participants: meeting.participants,
        }),
      });
      const data = await res.json();
      setEmailContent(data.email);
    } catch {
      setEmailContent("Failed to generate email. Check your API key.");
    }
    setEmailLoading(false);
  };

  if (!opportunity) {
    return (
      <div className="space-y-3">
        <div className="h-7 w-80 max-w-full rounded-lg skeleton" />
        <div className="h-4 w-96 max-w-full rounded-lg skeleton" />
        <div className="h-24 w-full rounded-xl skeleton" />
        <div className="h-64 w-full rounded-xl skeleton" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-4">
        <Link href="/sales" className="group text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1 animate-fade-in transition-colors w-fit">
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back to Opportunities
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight animate-fade-in-up">{opportunity.name}</h1>
            <p className="text-lg text-slate-600 mt-2 animate-fade-in-up [animation-delay:80ms] flex items-center gap-2">
              <span className="font-medium text-slate-900">{account?.name}</span>
              <span className="text-slate-300">&middot;</span>
              <span>{opportunity.product}</span>
              <span className="text-slate-300">&middot;</span>
              <span className="font-medium text-slate-900">${opportunity.value.toLocaleString()}</span>
            </p>
          </div>
          <div className="flex gap-3 animate-fade-in-up [animation-delay:120ms]">
            <button
              onClick={() => setShowBriefing(!showBriefing)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm active:scale-[0.98]"
            >
              {showBriefing ? "Hide Briefing" : "Prepare for Meeting"}
            </button>
            <Link
              href={`/sales/${opportunityId}/new-meeting`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Meeting
            </Link>
          </div>
        </div>
      </div>

      {showBriefing && (
        <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-6 shadow-sm animate-slide-down">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-indigo-900">Meeting Briefing</h2>
          </div>

          <div className="mb-6 bg-white/50 rounded-xl p-4 border border-indigo-50">
            <h3 className="text-sm font-semibold text-indigo-900 mb-2 uppercase tracking-wide">Discussion Summary</h3>
            <p className="text-slate-700 leading-relaxed">{briefingParagraph}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleReadOutLoud}
                className="px-3 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                </svg>
                Read Out Loud
              </button>
              <button
                type="button"
                disabled
                className="px-3 py-2 bg-white border border-slate-200 text-slate-400 rounded-lg text-sm font-medium cursor-not-allowed flex items-center gap-2"
                title="Coming soon"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
                Talk with AI
              </button>
            </div>
          </div>

          {account?.customerDescription && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-indigo-900 mb-2 uppercase tracking-wide">Customer Overview</h3>
              <p className="text-slate-700 leading-relaxed">
                {account.customerDescription}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/50 rounded-xl p-4 border border-indigo-50">
              <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-rose-500 rounded-full" />
                Pain Points
              </h3>
              {allPainPoints.length === 0 ? (
                <p className="text-sm text-slate-500 italic">None recorded yet</p>
              ) : (
                <ul className="space-y-2">
                  {briefingPainPoints.map((p, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-rose-400 mt-0.5">•</span>
                      {p.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-white/50 rounded-xl p-4 border border-indigo-50">
              <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                Feature Requests
              </h3>
              {allFeatureRequests.length === 0 ? (
                <p className="text-sm text-slate-500 italic">None recorded yet</p>
              ) : (
                <ul className="space-y-2">
                  {briefingFeatureRequests.map((f, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      {f.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-white/50 rounded-xl p-4 border border-indigo-50">
              <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                Objections
              </h3>
              {allObjections.length === 0 ? (
                <p className="text-sm text-slate-500 italic">None recorded yet</p>
              ) : (
                <ul className="space-y-2">
                  {briefingObjections.map((o, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      {o.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-white/50 rounded-xl p-4 border border-indigo-50">
              <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                Competitors Mentioned
              </h3>
              {allCompetitors.length === 0 ? (
                <p className="text-sm text-slate-500 italic">None mentioned yet</p>
              ) : (
                <ul className="space-y-2">
                  {briefingCompetitors.map((c, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      <span><strong>{c.name}</strong> &mdash; {c.context}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {openActions.length > 0 && (
              <div className="md:col-span-2 bg-white/50 rounded-xl p-4 border border-indigo-50">
                <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  Open Action Items
                </h3>
                <ul className="space-y-2">
                  {briefingOpenActions.map((a, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-center gap-2">
                      <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" disabled />
                      <span>{a.text}</span>
                      <span className="text-xs font-medium px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">{a.owner}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-bold text-slate-900">Meeting Timeline</h2>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
      
      {meetings.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl animate-fade-in-up border-dashed">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium">No meetings recorded yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-4">Start capturing insights from your conversations.</p>
          <Link
            href={`/sales/${opportunityId}/new-meeting`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Record First Meeting
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
          <div className="sticky top-8">
            <MeetingTimelineTree
              meetings={meetings}
              selectedMeetingId={effectiveSelectedMeetingId}
              onSelectMeeting={setSelectedMeetingId}
            />
          </div>

          <div className="space-y-6">
          {visibleMeetings.map(meeting => (
            <div key={meeting.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fade-in-up">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{meeting.title}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {new Date(meeting.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    {" "}&middot;{" "}
                    {meeting.participants.join(", ")}
                  </p>
                </div>
                {meeting.insights && (
                  <button
                    onClick={() => handleGenerateEmail(meeting)}
                    disabled={emailLoading && emailMeetingId === meeting.id}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    {emailLoading && emailMeetingId === meeting.id ? "Generating..." : "Generate Follow-up Email"}
                  </button>
                )}
              </div>

              {meeting.insights ? (
                <div>
                  <p className="text-sm text-slate-700 mb-3">{meeting.insights.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {meeting.insights.painPoints.map((p, i) => (
                      <span key={`pp-${i}`} className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">
                        {p.text}
                      </span>
                    ))}
                    {meeting.insights.featureRequests.map((f, i) => (
                      <span key={`fr-${i}`} className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                        {f.text}
                      </span>
                    ))}
                    {meeting.insights.objections.map((o, i) => (
                      <span key={`ob-${i}`} className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs">
                        {o.text}
                      </span>
                    ))}
                    {meeting.insights.competitors.map((c, i) => (
                      <span key={`co-${i}`} className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">
                        vs {c.name}
                      </span>
                    ))}
                  </div>
                  {meeting.insights.actionItems.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-xs font-medium text-slate-500 mb-1">Action Items</p>
                      <ul className="space-y-0.5">
                        {meeting.insights.actionItems.map((a, i) => (
                          <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                            <span className={a.done ? "line-through text-slate-400" : ""}>
                              {a.done ? "Done" : "To do"}: {a.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {meeting.insights.salesforce && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-xs font-medium text-blue-600 mb-2 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
                        </svg>
                        Salesforce Fields
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        <span className="text-slate-600">
                          Stage: <strong className="text-slate-800">{meeting.insights.salesforce.recommendedStage}</strong>
                        </span>
                        <span className="text-slate-600">
                          Sentiment: <strong className={
                            meeting.insights.salesforce.sentiment === 'Positive' ? 'text-green-600' :
                            meeting.insights.salesforce.sentiment === 'Negative' ? 'text-red-600' :
                            meeting.insights.salesforce.sentiment === 'Mixed' ? 'text-amber-600' : 'text-slate-600'
                          }>{meeting.insights.salesforce.sentiment}</strong>
                        </span>
                        <span className="text-slate-600">
                          Risk: <strong className={
                            meeting.insights.salesforce.dealRisk === 'Low' ? 'text-green-600' :
                            meeting.insights.salesforce.dealRisk === 'Medium' ? 'text-amber-600' : 'text-red-600'
                          }>{meeting.insights.salesforce.dealRisk}</strong>
                        </span>
                        <span className="text-slate-600">
                          Disposition: <strong className="text-slate-800">{meeting.insights.salesforce.callDisposition}</strong>
                        </span>
                      </div>
                      {meeting.insights.salesforce.nextSteps && (
                        <p className="text-xs text-slate-600 mt-1">
                          <strong>Next Steps:</strong> {meeting.insights.salesforce.nextSteps}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-500">
                        {meeting.insights.salesforce.budgetDiscussed && <span>✓ Budget</span>}
                        {meeting.insights.salesforce.authorityIdentified && <span>✓ Authority</span>}
                        {meeting.insights.salesforce.needValidated && <span>✓ Need</span>}
                        {meeting.insights.salesforce.timelineDiscussed && <span>✓ Timeline</span>}
                        {meeting.insights.salesforce.championIdentified && (
                          <span>✓ Champion: {meeting.insights.salesforce.championName}</span>
                        )}
                      </div>
                      {(meeting.insights.salesforce.keyTopics || []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {meeting.insights.salesforce.keyTopics.map((t, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {emailContent && emailMeetingId === meeting.id && (
                    <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg animate-slide-down">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-slate-700">Follow-up Email Draft</h4>
                        <button
                          onClick={() => { navigator.clipboard.writeText(emailContent); }}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Copy to clipboard
                        </button>
                      </div>
                      <pre className="text-sm text-slate-600 whitespace-pre-wrap font-sans">{emailContent}</pre>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">Insights not yet extracted</p>
              )}
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}
