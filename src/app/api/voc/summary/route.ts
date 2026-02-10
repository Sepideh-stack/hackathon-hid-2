import { NextRequest, NextResponse } from 'next/server';
import { generateVocSummary } from '@/lib/anthropic';

export async function POST(request: NextRequest) {
  try {
    const { product, painPoints, featureRequests, objections, competitors, totalMeetings } = await request.json();
    const summary = await generateVocSummary(
      product,
      painPoints,
      featureRequests,
      objections,
      competitors,
      totalMeetings
    );
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('VoC summary error:', error);
    return NextResponse.json(
      { error: 'Failed to generate VoC summary' },
      { status: 500 }
    );
  }
}
