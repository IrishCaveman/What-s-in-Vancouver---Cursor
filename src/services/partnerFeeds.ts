import { extractDeepDescription, inspectIngestionCandidate } from './ingestionGuards';
import type { EventRecord, EventSource, EventTag } from '../types/events';

interface PartnerMapOptions {
  source: Extract<EventSource, 'showpass' | 'eventbrite'>;
  targetUrl?: string;
  defaultTags?: EventTag[];
}

export function mapShowpassEvents(payload: unknown, targetUrl?: string): EventRecord[] {
  return mapPartnerEvents(payload, {
    source: 'showpass',
    targetUrl,
    defaultTags: ['Nighttime Events']
  });
}

export function mapEventbriteEvents(payload: unknown, targetUrl?: string): EventRecord[] {
  return mapPartnerEvents(payload, {
    source: 'eventbrite',
    targetUrl,
    defaultTags: ['Daytime Events']
  });
}

function mapPartnerEvents(payload: unknown, options: PartnerMapOptions): EventRecord[] {
  const rows = extractRows(payload);

  return rows.flatMap((row) => {
    const description = extractDeepDescription(row);
    const inspected = inspectIngestionCandidate(
      {
        id: readString(row, ['id', 'event_id', 'slug'])
          ? `${options.source}_${readString(row, ['id', 'event_id', 'slug'])}`
          : undefined,
        title: readString(row, ['title', 'name']),
        description,
        date: readString(row, ['date', 'start_date', 'startDate', 'start.local']),
        address: readString(row, ['venue.address', 'address', 'location.address']),
        city: readString(row, ['venue.city', 'city', 'location.city']) || 'Vancouver',
        imageUrl: readString(row, ['image.url', 'imageUrl', 'logo.url', 'cover.url']),
        tags: options.defaultTags ?? [],
        source: options.source,
        url: readString(row, ['url', 'event_url']) || options.targetUrl,
        rawPayload: row
      },
      options.source,
      options.targetUrl
    );

    return inspected.event ? [inspected.event] : [];
  });
}

function extractRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const possibleArrays = ['events', 'data', 'results', 'items'];

  for (const key of possibleArrays) {
    if (Array.isArray(record[key])) {
      return record[key] as unknown[];
    }
  }

  return [payload];
}

function readString(value: unknown, paths: string[]) {
  for (const path of paths) {
    const resolved = path.split('.').reduce<unknown>((current, segment) => {
      if (!current || typeof current !== 'object') {
        return undefined;
      }

      return (current as Record<string, unknown>)[segment];
    }, value);

    if (typeof resolved === 'string' && resolved.trim()) {
      return resolved.trim();
    }
  }

  return '';
}
