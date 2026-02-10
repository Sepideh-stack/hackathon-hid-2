import Anthropic from '@anthropic-ai/sdk';
import { ExtractedInsights } from './types';

const client = new Anthropic();

export async function extractInsights(transcript: string): Promise<ExtractedInsights> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Analyze the following customer meeting transcript and extract structured insights.

Return a JSON object with exactly this structure (no markdown, no code fences, just raw JSON):
{
  "summary": "2-3 sentence summary of the meeting",
  "painPoints": [{"text": "short description of pain point", "snippet": "exact quote from transcript"}],
  "featureRequests": [{"text": "short description", "snippet": "exact quote from transcript"}],
  "objections": [{"text": "short description of objection or concern", "snippet": "exact quote from transcript"}],
  "competitors": [{"name": "competitor name", "context": "brief context of why/how mentioned", "snippet": "exact quote from transcript"}],
  "actionItems": [{"text": "action item description", "owner": "person responsible", "done": false}]
}

Rules:
- Extract only what is explicitly stated or strongly implied in the transcript
- Snippets must be actual quotes or close paraphrases from the transcript
- If a category has no items, use an empty array
- Pain points are problems the customer currently faces
- Feature requests are capabilities the customer wants
- Objections are concerns, hesitations, or pushback about the proposed solution
- For action items, assign the owner based on who would logically take the action

TRANSCRIPT:
${transcript}`,
      },
    ],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  try {
    return JSON.parse(text) as ExtractedInsights;
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ExtractedInsights;
    }
    throw new Error('Failed to parse AI response as JSON');
  }
}

export async function generateFollowUpEmail(
  accountName: string,
  summary: string,
  actionItems: { text: string; owner: string }[],
  participants: string[]
): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Write a professional follow-up email after a customer meeting.

Account: ${accountName}
Participants: ${participants.join(', ')}
Meeting Summary: ${summary}
Action Items: ${actionItems.map(a => `- ${a.text} (Owner: ${a.owner})`).join('\n')}

Write a concise, professional email that:
1. Thanks the participants for their time
2. Briefly recaps the key discussion points
3. Lists the agreed action items with owners
4. Proposes next steps

Use a professional but warm tone. Just output the email body text, no subject line.`,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}

export async function generateVocSummary(
  product: string,
  painPoints: { text: string; count: number }[],
  featureRequests: { text: string; count: number }[],
  objections: { text: string; count: number }[],
  competitors: { name: string; count: number }[],
  totalMeetings: number
): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Generate an executive Voice of Customer (VoC) summary for the product "${product}" based on ${totalMeetings} customer meetings.

Top Pain Points:
${painPoints.slice(0, 5).map(p => `- ${p.text} (mentioned ${p.count} times)`).join('\n')}

Top Feature Requests:
${featureRequests.slice(0, 5).map(f => `- ${f.text} (mentioned ${f.count} times)`).join('\n')}

Top Objections:
${objections.slice(0, 5).map(o => `- ${o.text} (mentioned ${o.count} times)`).join('\n')}

Competitors Mentioned:
${competitors.slice(0, 5).map(c => `- ${c.name} (mentioned ${c.count} times)`).join('\n')}

Write a concise executive summary (3-4 paragraphs) that:
1. Highlights the most critical customer themes
2. Identifies competitive positioning insights
3. Suggests strategic implications
Keep it factual and data-driven.`,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}
