import { ExtractedInsights, InsightItem, CompetitorMention, ActionItem, Meeting } from './types';

function uniqueByLower(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const i of items) {
    const k = i.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(i);
  }
  return out;
}

function tagToTheme(tag: string): { type: keyof Pick<ExtractedInsights, 'painPoints' | 'featureRequests' | 'objections'>; text: string } | null {
  const t = tag.toLowerCase();

  // Very light mapping from provided tags to insight buckets.
  // The goal is to make dashboards non-empty when no AI extraction has been run.
  if (t.includes('pain') || t.includes('bottleneck') || t.includes('outage') || t.includes('incident') || t.includes('risk')) {
    return { type: 'painPoints', text: tag.replace(/_/g, ' ') };
  }
  if (t.includes('integration') || t.includes('reporting') || t.includes('dashboard') || t.includes('automation') || t.includes('api') || t.includes('acme') || t.includes('mobile') || t.includes('localization') || t.includes('audit') || t.includes('reminder')) {
    return { type: 'featureRequests', text: tag.replace(/_/g, ' ') };
  }
  if (t.includes('skeptic') || t.includes('compliance') || t.includes('pii') || t.includes('residency') || t.includes('retention') || t.includes('security_review') || t.includes('ownership') || t.includes('adoption') || t.includes('training')) {
    return { type: 'objections', text: tag.replace(/_/g, ' ') };
  }
  return null;
}

function extractCompetitorsFromTags(tags: string[]): CompetitorMention[] {
  // Tags include both a generic "competitor" and sometimes a specific name like "Proxyclick".
  const ignore = new Set(['competitor', 'transcript', 'voc_source']);
  const competitorTags = tags
    .filter(t => !ignore.has(t.toLowerCase()))
    .filter(t => /venafi|proxyclick|envoy|sectigo|digicert|microsoft|ejbca|sign in app|sign_in_app/i.test(t));

  return uniqueByLower(competitorTags).map(name => ({
    name: name.replace(/_/g, ' '),
    context: 'Mentioned in meeting tags',
    snippet: name,
  }));
}

export function buildHeuristicInsights(meeting: Pick<Meeting, 'transcriptRaw' | 'tags' | 'outcome' | 'title'>): ExtractedInsights {
  const tags = meeting.tags ?? [];
  const baseSnippet = (meeting.transcriptRaw || '').slice(0, 220).replace(/\s+/g, ' ').trim();
  const snippet = baseSnippet ? `${baseSnippet}${baseSnippet.length >= 220 ? '…' : ''}` : '';

  const painPoints: InsightItem[] = [];
  const featureRequests: InsightItem[] = [];
  const objections: InsightItem[] = [];

  for (const tag of tags) {
    const mapped = tagToTheme(tag);
    if (!mapped) continue;
    const item = { text: mapped.text, snippet };
    if (mapped.type === 'painPoints') painPoints.push(item);
    if (mapped.type === 'featureRequests') featureRequests.push(item);
    if (mapped.type === 'objections') objections.push(item);
  }

  const competitors = extractCompetitorsFromTags(tags);

  const actionItems: ActionItem[] = meeting.outcome
    ? [{ text: meeting.outcome, owner: 'Alex (HID)', done: false }]
    : [];

  return {
    summary: meeting.outcome ?? `Heuristic summary based on tags for: ${meeting.title}`,
    painPoints,
    featureRequests,
    objections,
    competitors,
    actionItems,
  };
}
