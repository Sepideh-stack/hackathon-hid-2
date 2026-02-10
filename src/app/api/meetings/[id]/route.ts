import { NextRequest, NextResponse } from 'next/server';
import { getMeeting, saveMeeting } from '@/lib/data';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const meeting = getMeeting(id);
  if (!meeting) {
    return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
  }
  return NextResponse.json(meeting);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const meeting = getMeeting(id);
  if (!meeting) {
    return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
  }
  const body = await request.json();
  const updated = { ...meeting, ...body, id };
  saveMeeting(updated);
  return NextResponse.json(updated);
}
