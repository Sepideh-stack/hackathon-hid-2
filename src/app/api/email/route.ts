import { NextRequest, NextResponse } from 'next/server';
import { generateFollowUpEmail } from '@/lib/openrouter';

export async function POST(request: NextRequest) {
  try {
    const { accountName, summary, actionItems, participants } = await request.json();
    const email = await generateFollowUpEmail(accountName, summary, actionItems, participants);
    return NextResponse.json({ email });
  } catch (error) {
    console.error('Email generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate email' },
      { status: 500 }
    );
  }
}
