import { ExtractedInsights } from './types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'anthropic/claude-sonnet-4';

async function chatCompletion(messages: { role: string; content: string }[], maxTokens: number = 4096): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in environment variables');
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'CRM Sales App',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      max_tokens: maxTokens,
      messages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

export async function extractInsights(transcript: string): Promise<ExtractedInsights> {
  const text = await chatCompletion([
    {
      role: 'user',
      content: `You are a Salesforce CRM data extraction assistant. Analyze the following customer meeting transcript and extract structured insights in a Salesforce-compatible format.

Return a JSON object with exactly this structure (no markdown, no code fences, just raw JSON):
{
  "summary": "2-3 sentence summary of the meeting",
  "painPoints": [{"text": "short description of pain point", "snippet": "exact quote from transcript"}],
  "featureRequests": [{"text": "short description", "snippet": "exact quote from transcript"}],
  "objections": [{"text": "short description of objection or concern", "snippet": "exact quote from transcript"}],
  "competitors": [{"name": "competitor name", "context": "brief context of why/how mentioned", "snippet": "exact quote from transcript"}],
  "actionItems": [{"text": "action item description", "owner": "person responsible", "done": false}],
  "salesforce": {
    "nextSteps": "Clear description of the agreed next steps",
    "recommendedStage": "One of: Prospecting, Qualification, Discovery, Proposal, Negotiation, Closed Won, Closed Lost",
    "sentiment": "One of: Positive, Neutral, Negative, Mixed",
    "engagementLevel": "One of: High, Medium, Low",
    "dealRisk": "One of: Low, Medium, High",
    "dealRiskReason": "Brief reason for the risk level",
    "budgetDiscussed": true/false,
    "budgetNotes": "Any budget-related details mentioned, or empty string",
    "authorityIdentified": true/false,
    "decisionMaker": "Name/role of the decision maker if identified, or empty string",
    "needValidated": true/false,
    "needSummary": "Brief summary of the validated customer need",
    "timelineDiscussed": true/false,
    "timelineNotes": "Any timeline details mentioned, or empty string",
    "championIdentified": true/false,
    "championName": "Name of the internal champion if identified, or empty string",
    "keyTopics": ["topic1", "topic2"],
    "followUpDate": "YYYY-MM-DD if mentioned, or empty string",
    "callDisposition": "One of: Interested, Follow-up Needed, Not Interested, No Answer, Left Voicemail, Completed"
  }
}

Rules:
- Extract only what is explicitly stated or strongly implied in the transcript
- Snippets must be actual quotes or close paraphrases from the transcript
- If a category has no items, use an empty array
- Pain points are problems the customer currently faces
- Feature requests are capabilities the customer wants
- Objections are concerns, hesitations, or pushback about the proposed solution
- For action items, assign the owner based on who would logically take the action
- For Salesforce fields:
  - recommendedStage should reflect where this deal is based on the conversation
  - sentiment reflects overall customer tone toward the solution
  - BANT: Budget, Authority, Need, Timeline — mark as discussed/identified only if clearly mentioned
  - championIdentified: someone on the customer side actively advocating for the solution
  - callDisposition: summarize the outcome of this specific interaction
  - keyTopics: list the main subjects discussed (e.g., "compliance", "pricing", "integration")
  - dealRisk: assess based on objections, competition, timeline pressure, etc.

TRANSCRIPT:
${transcript}`,
    },
  ]);

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

export async function evaluateInsights(transcript: string, insights: ExtractedInsights): Promise<ExtractedInsights> {
  const text = await chatCompletion([
    {
      role: 'user',
      content: `You are an AI quality evaluator. You have been given a customer meeting transcript and the AI-extracted insights from that transcript. Your job is to evaluate each extracted item for accuracy and confidence.

For EACH item in painPoints, featureRequests, objections, competitors, and actionItems, you must:
1. Score confidence from 0 to 100 (how well-supported is this by the transcript?)
2. Assign a confidenceLabel: "High" (75-100), "Medium" (40-74), or "Low" (0-39)
3. Provide a brief reasoning (1 sentence) explaining the score
4. If the original text could be improved for clarity or accuracy, provide an improvedText (otherwise set to empty string)

Scoring criteria:
- 90-100: Directly quoted or explicitly stated in the transcript with clear evidence
- 70-89: Strongly implied, well-supported by context  
- 50-69: Reasonably inferred but not directly stated
- 30-49: Weakly implied, requires interpretation
- 0-29: Speculative, little to no direct support in transcript

Return a JSON object (no markdown, no code fences, just raw JSON) with the same structure as the input insights, but with confidence, confidenceLabel, reasoning, and improvedText added to each item:

{
  "painPoints": [{"text": "...", "snippet": "...", "confidence": 85, "confidenceLabel": "High", "reasoning": "Directly stated by customer with specific examples", "improvedText": ""}],
  "featureRequests": [{"text": "...", "snippet": "...", "confidence": 72, "confidenceLabel": "Medium", "reasoning": "...", "improvedText": "..."}],
  "objections": [{"text": "...", "snippet": "...", "confidence": 90, "confidenceLabel": "High", "reasoning": "...", "improvedText": ""}],
  "competitors": [{"name": "...", "context": "...", "snippet": "...", "confidence": 95, "confidenceLabel": "High", "reasoning": "..."}],
  "actionItems": [{"text": "...", "owner": "...", "done": false, "confidence": 60, "confidenceLabel": "Medium", "reasoning": "..."}]
}

ORIGINAL TRANSCRIPT:
${transcript}

EXTRACTED INSIGHTS TO EVALUATE:
${JSON.stringify({
  painPoints: insights.painPoints,
  featureRequests: insights.featureRequests,
  objections: insights.objections,
  competitors: insights.competitors,
  actionItems: insights.actionItems,
}, null, 2)}`,
    },
  ]);

  try {
    const evaluated = JSON.parse(text);
    // Merge evaluated scores back into the original insights
    return {
      ...insights,
      painPoints: (evaluated.painPoints || insights.painPoints).map((item: Record<string, unknown>, i: number) => ({
        ...insights.painPoints[i],
        ...item,
        text: insights.painPoints[i]?.text || item.text,
        snippet: insights.painPoints[i]?.snippet || item.snippet,
      })),
      featureRequests: (evaluated.featureRequests || insights.featureRequests).map((item: Record<string, unknown>, i: number) => ({
        ...insights.featureRequests[i],
        ...item,
        text: insights.featureRequests[i]?.text || item.text,
        snippet: insights.featureRequests[i]?.snippet || item.snippet,
      })),
      objections: (evaluated.objections || insights.objections).map((item: Record<string, unknown>, i: number) => ({
        ...insights.objections[i],
        ...item,
        text: insights.objections[i]?.text || item.text,
        snippet: insights.objections[i]?.snippet || item.snippet,
      })),
      competitors: (evaluated.competitors || insights.competitors).map((item: Record<string, unknown>, i: number) => ({
        ...insights.competitors[i],
        ...item,
        name: insights.competitors[i]?.name || item.name,
        context: insights.competitors[i]?.context || item.context,
        snippet: insights.competitors[i]?.snippet || item.snippet,
      })),
      actionItems: (evaluated.actionItems || insights.actionItems).map((item: Record<string, unknown>, i: number) => ({
        ...insights.actionItems[i],
        ...item,
        text: insights.actionItems[i]?.text || item.text,
        owner: insights.actionItems[i]?.owner || item.owner,
        done: insights.actionItems[i]?.done ?? item.done ?? false,
      })),
    };
  } catch {
    // If evaluation parsing fails, return original insights unchanged
    console.error('Failed to parse evaluation response, returning unscored insights');
    return insights;
  }
}

export async function generateFollowUpEmail(
  accountName: string,
  summary: string,
  actionItems: { text: string; owner: string }[],
  participants: string[]
): Promise<string> {
  return chatCompletion([
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
  ], 1024);
}

export async function generateVocSummary(
  product: string,
  painPoints: { text: string; count: number }[],
  featureRequests: { text: string; count: number }[],
  objections: { text: string; count: number }[],
  competitors: { name: string; count: number }[],
  totalMeetings: number
): Promise<string> {
  return chatCompletion([
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
  ], 1024);
}
