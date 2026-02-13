import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { Account, Contact, Meeting, Opportunity, Product } from './types';
import { buildHeuristicInsights } from './heuristics';

const dataDir = path.join(process.cwd(), 'src', 'data');
const crmPath = path.join(dataDir, 'crm.json');

type CrmRaw = {
  products: {
    product_id: string;
    product_name: string;
    product_description_short?: string;
  }[];
  accounts: {
    account_id: string;
    account_name: string;
    industry: string;
    region: string;
    company_size?: string;
    customer_tier?: string;
    current_stack?: string[];
    pain_points?: string[];
    primary_products_of_interest?: string[];
  }[];
  contacts: {
    contact_id: string;
    account_id: string;
    name: string;
    role?: string;
    seniority?: string;
    email?: string;
    influence_level?: string;
    notes?: string;
  }[];
  opportunities: {
    opportunity_id: string;
    account_id: string;
    product_id: string;
    opportunity_name: string;
    stage: string;
    amount_est_usd: number;
    close_date_est?: string;
    use_case?: string;
    competitors_mentioned?: string[];
    key_risks?: string[];
    last_updated?: string;
  }[];
  activities: {
    activity_id: string;
    account_id: string;
    related_opportunity_id: string;
    date: string;
    type: string;
    participants_contact_ids: string[];
    notes_raw: string;
    outcome?: string;
    tags?: string[];
    // Non-Salesforce field: we persist extracted insights here when saving back to the mocked CRM.
    // Existing provided mock data does not include it.
    insights?: Meeting['insights'];
  }[];
};

function readCrmRaw(): CrmRaw {
  const raw = readFileSync(crmPath, 'utf-8');
  return JSON.parse(raw) as CrmRaw;
}

function writeCrmRaw(updated: CrmRaw): void {
  writeFileSync(crmPath, JSON.stringify(updated, null, 2));
}

export function getProducts(): Product[] {
  const crm = readCrmRaw();
  return crm.products.map(p => ({
    id: p.product_id,
    name: p.product_name,
    descriptionShort: p.product_description_short,
  }));
}

export function getContacts(accountId?: string): Contact[] {
  const crm = readCrmRaw();
  const contacts = crm.contacts
    .filter(c => (accountId ? c.account_id === accountId : true))
    .map(c => ({
      id: c.contact_id,
      accountId: c.account_id,
      name: c.name,
      role: c.role,
      seniority: c.seniority,
      email: c.email,
      influenceLevel: c.influence_level,
      notes: c.notes,
    }));
  return contacts;
}

export function getAccounts(): Account[] {
  const crm = readCrmRaw();
  return crm.accounts.map(a => ({
    id: a.account_id,
    name: a.account_name,
    industry: a.industry,
    region: a.region,
    companySize: a.company_size,
    customerTier: a.customer_tier,
    currentStack: a.current_stack,
    painPoints: a.pain_points,
    primaryProductsOfInterest: a.primary_products_of_interest,
  }));
}

export function getAccount(id: string): Account | undefined {
  return getAccounts().find(a => a.id === id);
}

export function getOpportunities(filters?: {
  accountId?: string;
  productId?: string;
  product?: string;
  stage?: string;
}): Opportunity[] {
  const crm = readCrmRaw();
  const productsById = new Map(crm.products.map(p => [p.product_id, p] as const));

  let opps = crm.opportunities.map(o => {
    const product = productsById.get(o.product_id);
    return {
      id: o.opportunity_id,
      accountId: o.account_id,
      name: o.opportunity_name,
      product: product?.product_name ?? o.product_id,
      productId: o.product_id,
      stage: o.stage,
      value: o.amount_est_usd,
      closeDateEst: o.close_date_est,
      useCase: o.use_case,
      competitorsMentioned: o.competitors_mentioned,
      keyRisks: o.key_risks,
      lastUpdated: o.last_updated,
    } satisfies Opportunity;
  });

  if (filters?.accountId) opps = opps.filter(o => o.accountId === filters.accountId);
  if (filters?.productId) opps = opps.filter(o => o.productId === filters.productId);
  if (filters?.product) opps = opps.filter(o => o.product === filters.product);
  if (filters?.stage) opps = opps.filter(o => o.stage === filters.stage);

  return opps;
}

export function getOpportunity(id: string): Opportunity | undefined {
  return getOpportunities().find(o => o.id === id);
}

function resolveParticipantNames(contactIds: string[], contacts: Contact[]): string[] {
  const map = new Map(contacts.map(c => [c.id, c.name] as const));
  return contactIds.map(id => map.get(id) ?? id);
}

function resolveParticipantNamesFromTags(tags: string[] | undefined): string[] {
  const t = tags ?? [];
  const names = t
    .filter(x => x.toLowerCase().startsWith('participant:'))
    .map(x => x.slice('participant:'.length).trim())
    .filter(Boolean);
  return names;
}

export function getMeetings(filters?: {
  opportunityId?: string;
  accountId?: string;
  product?: string;
  productId?: string;
  stage?: string;
  region?: string;
  industry?: string;
  dateFrom?: string;
  dateTo?: string;
  includeInternal?: boolean;
}): Meeting[] {
  const crm = readCrmRaw();
  const contacts = getContacts();
  const opps = getOpportunities();
  const oppById = new Map(opps.map(o => [o.id, o] as const));
  const accountById = new Map(getAccounts().map(a => [a.id, a] as const));

  let meetings = crm.activities.map(a => {
    return {
      id: a.activity_id,
      opportunityId: a.related_opportunity_id,
      accountId: a.account_id,
      date: a.date,
      title: a.type,
      participants:
        a.participants_contact_ids.length > 0
          ? resolveParticipantNames(a.participants_contact_ids, contacts)
          : resolveParticipantNamesFromTags(a.tags),
      transcriptRaw: a.notes_raw,
      insights:
        a.insights ??
        buildHeuristicInsights({
          transcriptRaw: a.notes_raw,
          tags: a.tags ?? [],
          outcome: a.outcome,
          title: a.type,
        }),
      activityType: a.type,
      tags: a.tags ?? [],
      outcome: a.outcome,
    } satisfies Meeting;
  });

  // Default: exclude internal notes unless explicitly included
  const includeInternal = filters?.includeInternal ?? false;
  if (!includeInternal) {
    meetings = meetings.filter(m => m.activityType?.toLowerCase() !== 'internal note');
  }

  if (filters?.opportunityId) meetings = meetings.filter(m => m.opportunityId === filters.opportunityId);
  if (filters?.accountId) meetings = meetings.filter(m => m.accountId === filters.accountId);

  if (filters?.product || filters?.productId || filters?.stage) {
    meetings = meetings.filter(m => {
      const opp = oppById.get(m.opportunityId);
      if (!opp) return false;
      if (filters.product && opp.product !== filters.product) return false;
      if (filters.productId && opp.productId !== filters.productId) return false;
      if (filters.stage && opp.stage !== filters.stage) return false;
      return true;
    });
  }

  if (filters?.region || filters?.industry) {
    meetings = meetings.filter(m => {
      const acc = accountById.get(m.accountId);
      if (!acc) return false;
      if (filters.region && acc.region !== filters.region) return false;
      if (filters.industry && acc.industry !== filters.industry) return false;
      return true;
    });
  }

  if (filters?.dateFrom) meetings = meetings.filter(m => m.date >= filters.dateFrom!);
  if (filters?.dateTo) meetings = meetings.filter(m => m.date <= filters.dateTo!);

  return meetings.sort((a, b) => b.date.localeCompare(a.date));
}

export function getMeeting(id: string): Meeting | undefined {
  return getMeetings({ includeInternal: true }).find(m => m.id === id);
}

export function saveMeeting(meeting: Meeting): void {
  // Persist new meeting as a new activity in crm.json (mocked CRM “write back”)
  const crm = readCrmRaw();
  const existingIdx = crm.activities.findIndex(a => a.activity_id === meeting.id);

  // We cannot reliably map free-text participant names back to contact ids.
  // Store them as tags so they are not lost (and keep participants_contact_ids empty).
  const participantTags = (meeting.participants || []).map(p => `participant:${p}`);

  const activity: CrmRaw['activities'][number] = {
    activity_id: meeting.id,
    account_id: meeting.accountId,
    related_opportunity_id: meeting.opportunityId,
    date: meeting.date,
    type: meeting.activityType ?? meeting.title,
    participants_contact_ids: [],
    notes_raw: meeting.transcriptRaw,
    outcome: meeting.outcome,
    tags: Array.from(new Set([...(meeting.tags ?? []), ...participantTags])),
    insights: meeting.insights ?? undefined,
  };

  if (existingIdx >= 0) {
    crm.activities[existingIdx] = activity;
  } else {
    crm.activities.push(activity);
  }
  writeCrmRaw(crm);
}
