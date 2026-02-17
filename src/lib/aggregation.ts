import { Meeting, VocData, AggregatedTheme, AggregatedCompetitor } from './types';

function aggregateInsightItems(
  meetings: Meeting[],
  field: 'painPoints' | 'featureRequests' | 'objections'
): AggregatedTheme[] {
  const themeMap = new Map<string, AggregatedTheme>();

  for (const meeting of meetings) {
    if (!meeting.insights) continue;
    const items = meeting.insights[field];
    for (const item of items) {
      const key = item.text.toLowerCase();
      const existing = themeMap.get(key);
      const who = (meeting.participants || []).join(', ');
      if (existing) {
        existing.count++;
        existing.snippets.push({
          meetingId: meeting.id,
          meetingTitle: meeting.title,
          date: meeting.date,
          snippet: item.snippet,
          who,
        });
      } else {
        themeMap.set(key, {
          text: item.text,
          count: 1,
          snippets: [{
            meetingId: meeting.id,
            meetingTitle: meeting.title,
            date: meeting.date,
            snippet: item.snippet,
            who,
          }],
        });
      }
    }
  }

  return Array.from(themeMap.values()).sort((a, b) => b.count - a.count);
}

function aggregateCompetitors(meetings: Meeting[]): AggregatedCompetitor[] {
  const compMap = new Map<string, AggregatedCompetitor>();

  for (const meeting of meetings) {
    if (!meeting.insights) continue;
    for (const comp of meeting.insights.competitors) {
      const key = comp.name.toLowerCase();
      const existing = compMap.get(key);
      if (existing) {
        existing.count++;
        existing.contexts.push({
          meetingId: meeting.id,
          meetingTitle: meeting.title,
          date: meeting.date,
          context: comp.context,
          snippet: comp.snippet,
        });
      } else {
        compMap.set(key, {
          name: comp.name,
          count: 1,
          contexts: [{
            meetingId: meeting.id,
            meetingTitle: meeting.title,
            date: meeting.date,
            context: comp.context,
            snippet: comp.snippet,
          }],
        });
      }
    }
  }

  return Array.from(compMap.values()).sort((a, b) => b.count - a.count);
}

export function aggregateVocData(meetings: Meeting[]): VocData {
  const meetingsWithInsights = meetings.filter(m => m.insights !== null);
  return {
    painPoints: aggregateInsightItems(meetingsWithInsights, 'painPoints'),
    featureRequests: aggregateInsightItems(meetingsWithInsights, 'featureRequests'),
    objections: aggregateInsightItems(meetingsWithInsights, 'objections'),
    competitors: aggregateCompetitors(meetingsWithInsights),
    totalMeetings: meetingsWithInsights.length,
  };
}
