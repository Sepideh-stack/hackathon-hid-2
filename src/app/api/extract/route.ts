import { NextRequest, NextResponse } from 'next/server';
import { extractInsights, evaluateInsights } from '@/lib/openrouter';

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();
    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }
    // Pass 1: Extract insights from transcript
    const rawInsights = await extractInsights(transcript);
    // Pass 2: Evaluate & score each insight for confidence
    const scoredInsights = await evaluateInsights(transcript, rawInsights);
    return NextResponse.json(scoredInsights);
  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract insights' },
      { status: 500 }
    );
  }
}
