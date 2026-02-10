export interface Account {
  id: string;
  name: string;
  industry: string;
  region: string;
}

export interface Opportunity {
  id: string;
  accountId: string;
  name: string;
  product: string;
  stage: string;
  value: number;
}

export interface Meeting {
  id: string;
  opportunityId: string;
  accountId: string;
  date: string;
  title: string;
  participants: string[];
  transcriptRaw: string;
  insights: ExtractedInsights | null;
}

export interface ExtractedInsights {
  summary: string;
  painPoints: InsightItem[];
  featureRequests: InsightItem[];
  objections: InsightItem[];
  competitors: CompetitorMention[];
  actionItems: ActionItem[];
}

export interface InsightItem {
  text: string;
  snippet: string;
}

export interface CompetitorMention {
  name: string;
  context: string;
  snippet: string;
}

export interface ActionItem {
  text: string;
  owner: string;
  done: boolean;
}

export interface AggregatedTheme {
  text: string;
  count: number;
  snippets: { meetingId: string; meetingTitle: string; date: string; snippet: string }[];
}

export interface AggregatedCompetitor {
  name: string;
  count: number;
  contexts: { meetingId: string; meetingTitle: string; date: string; context: string; snippet: string }[];
}

export interface VocData {
  painPoints: AggregatedTheme[];
  featureRequests: AggregatedTheme[];
  objections: AggregatedTheme[];
  competitors: AggregatedCompetitor[];
  totalMeetings: number;
}
