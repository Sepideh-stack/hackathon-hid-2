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
    <div>
      <div className="mb-6">
        <Link href="/sales" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-4 animate-fade-in">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back to Opportunities
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 animate-fade-in-up">{opportunity.name}</h1>
            <p className="text-slate-500 mt-1 animate-fade-in-up [animation-delay:80ms]">{account?.name} &middot; {opportunity.product} &middot; ${opportunity.value.toLocaleString()}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowBriefing(!showBriefing)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors active:scale-[0.98]"
            >
              {showBriefing ? "Hide Briefing" : "Prepare for Meeting"}
            </button>
            <Link
              href={`/sales/${opportunityId}/new-meeting`}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors active:scale-[0.98]"
            >
              + New Meeting
            </Link>
          </div>
        </div>
      </div>

      {showBriefing && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 animate-slide-down">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Briefing Card</h2>

          <div className="mb-5">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Discussion Summary</h3>
            <p className="text-sm text-blue-900 leading-relaxed">{briefingParagraph}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleReadOutLoud}
                className="px-3 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                Read Out Loud Meeting Briefing
              </button>
              <button
                type="button"
                disabled
                className="px-3 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg text-sm font-medium opacity-60 cursor-not-allowed"
                title="Coming soon"
              >
                Talk with AI
              </button>
            </div>
          </div>

          {account?.customerDescription && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">Customer Overview</h3>
              <p className="text-sm text-blue-900 leading-relaxed">
                {account.customerDescription}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-blue-800 mb-2">Pain Points</h3>
              {allPainPoints.length === 0 ? (
                <p className="text-sm text-blue-600 italic">None recorded yet</p>
              ) : (
                <ul className="space-y-1">
                  {briefingPainPoints.map((p, i) => (
                    <li key={i} className="text-sm text-blue-900 flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">&#9679;</span>
                      {p.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-800 mb-2">Feature Requests</h3>
              {allFeatureRequests.length === 0 ? (
                <p className="text-sm text-blue-600 italic">None recorded yet</p>
              ) : (
                <ul className="space-y-1">
                  {briefingFeatureRequests.map((f, i) => (
                    <li key={i} className="text-sm text-blue-900 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">&#9679;</span>
                      {f.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-800 mb-2">Objections</h3>
              {allObjections.length === 0 ? (
                <p className="text-sm text-blue-600 italic">None recorded yet</p>
              ) : (
                <ul className="space-y-1">
                  {briefingObjections.map((o, i) => (
                    <li key={i} className="text-sm text-blue-900 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">&#9679;</span>
                      {o.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-800 mb-2">Competitors Mentioned</h3>
              {allCompetitors.length === 0 ? (
                <p className="text-sm text-blue-600 italic">None mentioned yet</p>
              ) : (
                <ul className="space-y-1">
                  {briefingCompetitors.map((c, i) => (
                    <li key={i} className="text-sm text-blue-900 flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">&#9679;</span>
                      <span><strong>{c.name}</strong> &mdash; {c.context}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {openActions.length > 0 && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">Open Action Items</h3>
                <ul className="space-y-1">
                  {briefingOpenActions.map((a, i) => (
                    <li key={i} className="text-sm text-blue-900 flex items-center gap-2">
                      <input type="checkbox" className="rounded" disabled />
                      {a.text} <span className="text-blue-600">({a.owner})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold text-slate-900 mb-4">Meeting Timeline</h2>
      {meetings.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl animate-fade-in-up">
          <p className="text-slate-500">No meetings recorded yet.</p>
          <Link
            href={`/sales/${opportunityId}/new-meeting`}
            className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-800"
          >
            Record your first meeting
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 items-start">
          <MeetingTimelineTree
            meetings={meetings}
            selectedMeetingId={effectiveSelectedMeetingId}
            onSelectMeeting={setSelectedMeetingId}
          />

          <div className="space-y-4">
          {visibleMeetings.map(meeting => (
            <div key={meeting.id} className="bg-white border border-slate-200 rounded-xl p-6 animate-fade-in-up">
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
