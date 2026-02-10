import { NextRequest, NextResponse } from 'next/server';
import { getMeetings } from '@/lib/data';
import { aggregateVocData } from '@/lib/aggregation';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filters = {
    product: searchParams.get('product') || undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
  };
  const meetings = getMeetings(filters);
  const vocData = aggregateVocData(meetings);
  return NextResponse.json(vocData);
}
