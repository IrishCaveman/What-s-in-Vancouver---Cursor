import { sampleEvents } from '../data/sampleEvents';
import type { EventRecord } from '../types/events';
import { getFailedIngestionLogs, inspectIngestionCandidate } from './ingestionGuards';

export async function fetchCuratedEvents(): Promise<EventRecord[]> {
  const guarded = sampleEvents.flatMap((event) => {
    const inspected = inspectIngestionCandidate(event, event.source, event.url);
    return inspected.event ? [inspected.event] : [];
  });

  return guarded;
}

export function fetchFailedIngestionLogs() {
  return getFailedIngestionLogs();
}
