import { NextRequest, NextResponse } from 'next/server';
import { extractInsights } from '@/lib/anthropic';

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();
    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }
    const insights = await extractInsights(transcript);
    return NextResponse.json(insights);
  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract insights' },
      { status: 500 }
    );
  }
}
