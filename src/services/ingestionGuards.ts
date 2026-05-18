import type { EventRecord, EventSource, FailedIngestionLog } from '../types/events';

export interface CandidateEventRecord extends Partial<EventRecord> {
  rawPayload?: unknown;
}

const failedIngestionLogs: FailedInestionLogStore = [];

type FailedInestionLogStore = FailedIngestionLog[];

export function inspectIngestionCandidate(
  candidate: CandidateEventRecord,
  source: EventSource | 'unknown',
  targetUrl?: string
): { event?: EventRecord; log?: FailedIngestionLog } {
  const missingProperties: string[] = [];
  const title = candidate.title?.trim() ?? '';
  const description = normalizeWhitespace(candidate.description ?? '');
  const imageUrl = candidate.imageUrl?.trim() ?? '';

  if (!title) {
    missingProperties.push('title');
  }

  if (description.length < 50) {
    missingProperties.push('description');
  }

  if (!imageUrl) {
    missingProperties.push('imageUrl');
  }

  if (missingProperties.length > 0) {
    const log = recordFailedIngestion({
      source,
      targetUrl,
      missingProperties,
      title: candidate.title ?? null,
      description: candidate.description ?? null,
      imageUrl: candidate.imageUrl ?? null,
      rawPayload: candidate.rawPayload
    });

    return { log };
  }

  return {
    event: {
      id: candidate.id || stableEventId(source, title, candidate.date || targetUrl || ''),
      title,
      description,
      date: candidate.date || new Date().toISOString(),
      address: candidate.address || 'Vancouver',
      city: candidate.city || 'Vancouver',
      imageUrl,
      tags: candidate.tags || [],
      source: source === 'unknown' ? 'manual' : source,
      url: candidate.url || targetUrl
    }
  };
}

export function recordFailedIngestion(
  input: Omit<FailedIngestionLog, 'id' | 'createdAt'>
): FailedIngestionLog {
  const log: FailedIngestionLog = {
    ...input,
    id: stableEventId(input.source, input.targetUrl ?? JSON.stringify(input.missingProperties), Date.now().toString()),
    createdAt: new Date().toISOString()
  };

  failedIngestionLogs.push(log);
  return log;
}

export function getFailedIngestionLogs() {
  return [...failedIngestionLogs];
}

export function resetFailedIngestionLogs() {
  failedIngestionLogs.splice(0, failedIngestionLogs.length);
}

export function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export function stripHtml(value: string) {
  if (!value) {
    return '';
  }

  return normalizeWhitespace(value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' '));
}

export function extractDeepDescription(payload: unknown): string {
  const pieces: string[] = [];

  walk(payload, (value, key) => {
    const normalizedKey = key.toLowerCase();
    if (
      typeof value === 'string' &&
      ['description', 'descriptions', 'body', 'html', 'text'].some((target) => normalizedKey.includes(target))
    ) {
      pieces.push(stripHtml(value));
    }
  });

  return normalizeWhitespace(pieces.filter(Boolean).join(' '));
}

function walk(value: unknown, visitor: (value: unknown, key: string) => void, key = '') {
  visitor(value, key);

  if (Array.isArray(value)) {
    value.forEach((entry, index) => walk(entry, visitor, `${key}.${index}`));
    return;
  }

  if (value && typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([entryKey, entryValue]) => {
      walk(entryValue, visitor, entryKey);
    });
  }
}

function stableEventId(...parts: string[]) {
  const input = parts.join('|');
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }

  return `evt_${Math.abs(hash).toString(36)}`;
}
