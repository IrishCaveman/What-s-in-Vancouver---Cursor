import { inspectIngestionCandidate, stripHtml } from './ingestionGuards';
import type { EventRecord } from '../types/events';

export const ROGERS_ARENA_VANCOUVER_VENUE_ID = '139269';
const TICKETMASTER_BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';

interface TicketmasterFetchOptions {
  apiKey: string;
  size?: number;
  startDateTime?: string;
  endDateTime?: string;
}

interface TicketmasterImage {
  url?: string;
  ratio?: string;
  width?: number;
}

interface TicketmasterEvent {
  id?: string;
  name?: string;
  url?: string;
  dates?: {
    start?: {
      dateTime?: string;
      localDate?: string;
      localTime?: string;
    };
  };
  info?: string;
  pleaseNote?: string;
  images?: TicketmasterImage[];
  _embedded?: {
    venues?: Array<{
      name?: string;
      address?: { line1?: string };
      city?: { name?: string };
    }>;
    attractions?: Array<{
      description?: string;
      externalLinks?: Record<string, unknown>;
    }>;
  };
}

interface TicketmasterResponse {
  _embedded?: {
    events?: TicketmasterEvent[];
  };
}

export function buildRogersArenaTicketmasterUrl({
  apiKey,
  size = 40,
  startDateTime,
  endDateTime
}: TicketmasterFetchOptions) {
  const params = new URLSearchParams({
    apikey: apiKey,
    city: 'Vancouver',
    countryCode: 'CA',
    venueId: ROGERS_ARENA_VANCOUVER_VENUE_ID,
    size: String(size),
    sort: 'date,asc'
  });

  if (startDateTime) {
    params.set('startDateTime', startDateTime);
  }

  if (endDateTime) {
    params.set('endDateTime', endDateTime);
  }

  return `${TICKETMASTER_BASE_URL}?${params.toString()}`;
}

export async function fetchRogersArenaEvents(options: TicketmasterFetchOptions): Promise<EventRecord[]> {
  const endpoint = buildRogersArenaTicketmasterUrl(options);
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Ticketmaster fetch failed: ${response.status}`);
  }

  const payload = (await response.json()) as TicketmasterResponse;
  return mapTicketmasterEvents(payload, endpoint);
}

export function mapTicketmasterEvents(payload: TicketmasterResponse, targetUrl = TICKETMASTER_BASE_URL) {
  const events = payload._embedded?.events ?? [];

  return events.flatMap((event) => {
    const venue = event._embedded?.venues?.[0];
    const attraction = event._embedded?.attractions?.[0];
    const description = stripHtml(event.info || event.pleaseNote || attraction?.description || '');
    const imageUrl = selectTicketmasterHeroImage(event.images);
    const inspected = inspectIngestionCandidate(
      {
        id: event.id ? `ticketmaster_${event.id}` : undefined,
        title: event.name,
        description,
        date: buildTicketmasterDate(event),
        address: venue?.address?.line1 || venue?.name || 'Rogers Arena',
        city: venue?.city?.name || 'Vancouver',
        imageUrl,
        tags: ['Nighttime Events', 'New Skytrain'],
        source: 'ticketmaster',
        url: event.url,
        rawPayload: event
      },
      'ticketmaster',
      targetUrl
    );

    return inspected.event ? [inspected.event] : [];
  });
}

export function selectTicketmasterHeroImage(images: TicketmasterImage[] = []) {
  const sixteenNineLarge = images
    .filter((image) => image.ratio === '16_9' && (image.width ?? 0) > 1000 && image.url)
    .sort((left, right) => (right.width ?? 0) - (left.width ?? 0))[0];

  return sixteenNineLarge?.url ?? images.find((image) => image.url)?.url ?? '';
}

function buildTicketmasterDate(event: TicketmasterEvent) {
  const start = event.dates?.start;

  if (start?.dateTime) {
    return start.dateTime;
  }

  if (start?.localDate && start.localTime) {
    return `${start.localDate}T${start.localTime}`;
  }

  return start?.localDate ?? new Date().toISOString();
}
