import { NextRequest, NextResponse } from 'next/server';
import { getMeetings, saveMeeting } from '@/lib/data';
import { Meeting } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filters = {
    opportunityId: searchParams.get('opportunityId') || undefined,
    accountId: searchParams.get('accountId') || undefined,
    product: searchParams.get('product') || undefined,
    productId: searchParams.get('productId') || undefined,
    stage: searchParams.get('stage') || undefined,
    region: searchParams.get('region') || undefined,
    industry: searchParams.get('industry') || undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
    includeInternal: searchParams.get('includeInternal') === 'true' ? true : undefined,
  };
  return NextResponse.json(getMeetings(filters));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const meeting: Meeting = {
    id: `mtg-${uuidv4().slice(0, 8)}`,
    opportunityId: body.opportunityId,
    accountId: body.accountId,
    date: body.date || new Date().toISOString().split('T')[0],
    title: body.title,
    participants: body.participants || [],
    transcriptRaw: body.transcriptRaw,
    insights: body.insights || null,
    activityType: body.activityType || body.title,
    tags: body.tags || [],
    outcome: body.outcome,
  };
  saveMeeting(meeting);
  return NextResponse.json(meeting, { status: 201 });
}
