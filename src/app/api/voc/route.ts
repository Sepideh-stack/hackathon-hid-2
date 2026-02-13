import { NextRequest, NextResponse } from 'next/server';
import { getMeetings } from '@/lib/data';
import { aggregateVocData } from '@/lib/aggregation';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filters = {
    product: searchParams.get('product') || undefined,
    productId: searchParams.get('productId') || undefined,
    stage: searchParams.get('stage') || undefined,
    region: searchParams.get('region') || undefined,
    industry: searchParams.get('industry') || undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
  };
  const meetings = getMeetings(filters);
  const vocData = aggregateVocData(meetings);
  return NextResponse.json(vocData);
}
