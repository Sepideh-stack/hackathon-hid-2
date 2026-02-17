export interface Account {
  industry: string;
  region: string;
  id: string;
  name: string;
  companySize?: string;
  customerTier?: string;
  currentStack?: string[];
  painPoints?: string[];
  primaryProductsOfInterest?: string[];
}

export interface Product {
  id: string;
  name: string;
  descriptionShort?: string;
}

export interface Contact {
  id: string;
  accountId: string;
  name: string;
  role?: string;
  seniority?: string;
  email?: string;
  influenceLevel?: string;
  notes?: string;
}

export interface Opportunity {
  id: string;
  accountId: string;
  name: string;
  product: string; // product name for UI filter
  productId?: string;
  stage: string;
  value: number;
  closeDateEst?: string;
  useCase?: string;
  competitorsMentioned?: string[];
  keyRisks?: string[];
  lastUpdated?: string;
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

  // Hackathon CRM fields
  activityType?: string;
  tags?: string[];
  outcome?: string;
}

export interface ExtractedInsights {
  summary: string;
  painPoints: InsightItem[];
  featureRequests: InsightItem[];
  objections: InsightItem[];
  competitors: CompetitorMention[];
  actionItems: ActionItem[];

  // Salesforce-style fields
  salesforce?: SalesforceFields;
}

export interface SalesforceFields {
  nextSteps: string;
  recommendedStage: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
  engagementLevel: 'High' | 'Medium' | 'Low';
  dealRisk: 'Low' | 'Medium' | 'High';
  dealRiskReason: string;
  budgetDiscussed: boolean;
  budgetNotes: string;
  authorityIdentified: boolean;
  decisionMaker: string;
  needValidated: boolean;
  needSummary: string;
  timelineDiscussed: boolean;
  timelineNotes: string;
  championIdentified: boolean;
  championName: string;
  keyTopics: string[];
  followUpDate: string;
  callDisposition: 'Interested' | 'Follow-up Needed' | 'Not Interested' | 'No Answer' | 'Left Voicemail' | 'Completed';
}

export interface InsightItem {
  text: string;
  snippet: string;
  confidence?: number; // 0-100
  confidenceLabel?: 'High' | 'Medium' | 'Low';
  reasoning?: string;
  improvedText?: string;
}

export interface CompetitorMention {
  name: string;
  context: string;
  snippet: string;
  confidence?: number;
  confidenceLabel?: 'High' | 'Medium' | 'Low';
  reasoning?: string;
}

export interface ActionItem {
  text: string;
  owner: string;
  done: boolean;
  confidence?: number;
  confidenceLabel?: 'High' | 'Medium' | 'Low';
  reasoning?: string;
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
