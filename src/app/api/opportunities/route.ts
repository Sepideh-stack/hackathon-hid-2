import { NextRequest, NextResponse } from 'next/server';
import { getOpportunities } from '@/lib/data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get('accountId') || undefined;
  const productId = searchParams.get('productId') || undefined;
  const stage = searchParams.get('stage') || undefined;
  return NextResponse.json(getOpportunities({ accountId, productId, stage }));
}
