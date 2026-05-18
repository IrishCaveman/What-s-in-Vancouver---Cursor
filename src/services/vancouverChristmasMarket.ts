import { inspectIngestionCandidate, stripHtml } from './ingestionGuards';
import type { EventRecord, EventTag } from '../types/events';

const CHRISTMAS_MARKET_URL = 'https://www.vancouverchristmasmarket.com/';
const SEASON_START = new Date('2026-11-12T00:00:00-08:00');
const SEASON_END = new Date('2026-12-24T23:59:59-08:00');

export const christmasMarketFallback: EventRecord = {
  id: 'vancouver-christmas-market-2026',
  title: 'The Vancouver Christmas Market (2026)',
  description:
    'Vancouver’s historic, authentic German-inspired outdoor holiday village at Jack Poole Plaza. Stroll past 100+ interconnected wooden artisan stalls, experience the glittering Sky Curtain of Lights, ride the Aeroplan Holiday Carousel, and enjoy traditional seasonal treats like bratwurst, schnitzel, and hot Glühwein.',
  address: '1055 Canada Place (Jack Poole Plaza)',
  city: 'Vancouver',
  date: '2026-11-13T12:00:00-08:00',
  imageUrl: 'https://images.unsplash.com/photo-1545231027-634d0f62f294?w=1200',
  tags: ['Outdoor', 'Daytime Events', 'Nighttime Events', 'Kid Friendly', 'New Skytrain'],
  source: 'christmas-market',
  url: CHRISTMAS_MARKET_URL
};

export interface ChristmasMarketScrapeRow {
  title?: string;
  description?: string;
  date?: string;
  address?: string;
  city?: string;
  imageUrl?: string;
  tags?: EventTag[];
  url?: string;
  rawPayload?: unknown;
}

export interface SupabaseLikeClient {
  from: (table: 'events' | 'failed_ingestion_logs') => {
    upsert?: (row: unknown, options?: { onConflict?: string }) => Promise<unknown>;
    insert?: (row: unknown) => Promise<unknown>;
  };
}

export async function normalizeChristmasMarketRows(
  rows: ChristmasMarketScrapeRow[],
  supabase?: SupabaseLikeClient
): Promise<EventRecord[]> {
  const guardedRows = rows.filter((row) => isWithinChristmasMarketSeason(row.date));

  const mapped = guardedRows.flatMap((row) => {
    const inspected = inspectIngestionCandidate(
      {
        id: row.title && row.date ? `christmas_market_${slugify(row.title)}_${row.date}` : undefined,
        title: row.title,
        description: stripHtml(row.description ?? ''),
        date: row.date,
        address: row.address || christmasMarketFallback.address,
        city: row.city || 'Vancouver',
        imageUrl: row.imageUrl,
        tags: row.tags || christmasMarketFallback.tags,
        source: 'christmas-market',
        url: row.url || CHRISTMAS_MARKET_URL,
        rawPayload: row.rawPayload ?? row
      },
      'christmas-market',
      row.url || CHRISTMAS_MARKET_URL
    );

    return inspected.event ? [inspected.event] : [];
  });

  if (mapped.length > 0) {
    return mapped;
  }

  await commitChristmasMarketFallback(supabase);
  return [christmasMarketFallback];
}

export function isWithinChristmasMarketSeason(dateValue?: string) {
  if (!dateValue) {
    return false;
  }

  const eventDate = new Date(dateValue);

  if (Number.isNaN(eventDate.getTime())) {
    return false;
  }

  const isMay2026 = eventDate.getUTCFullYear() === 2026 && eventDate.getUTCMonth() === 4;
  if (isMay2026) {
    return false;
  }

  return eventDate >= SEASON_START && eventDate <= SEASON_END;
}

async function commitChristmasMarketFallback(supabase?: SupabaseLikeClient) {
  if (!supabase?.from('events').upsert) {
    return;
  }

  await supabase.from('events').upsert?.(toSupabaseEventRow(christmasMarketFallback), { onConflict: 'id' });
}

export function toSupabaseEventRow(event: EventRecord) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    address: event.address,
    city: event.city,
    image_url: event.imageUrl,
    tags: event.tags,
    source: event.source,
    url: event.url
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
