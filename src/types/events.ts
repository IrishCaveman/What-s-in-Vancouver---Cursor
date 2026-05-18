export type TierOneFilter = 'all' | 'live' | 'activities';

export type EventTag =
  | 'Indoor'
  | 'Outdoor'
  | 'Daytime Events'
  | 'Nighttime Events'
  | 'Kid Friendly'
  | 'EDM'
  | 'Country'
  | 'New Skytrain'
  | 'Boys Night'
  | 'Girls Night'
  | 'I have a car';

export type EventSource = 'ticketmaster' | 'christmas-market' | 'showpass' | 'eventbrite' | 'manual';

export interface EventRecord {
  id: string;
  title: string;
  description: string;
  date: string;
  address: string;
  city: string;
  imageUrl: string;
  tags: EventTag[];
  source: EventSource;
  price?: string;
  ticketUrl?: string;
  moreInfoUrl?: string;
  url?: string;
}

export interface FailedIngestionLog {
  id: string;
  source: EventSource | 'unknown';
  targetUrl?: string;
  missingProperties: string[];
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  rawPayload?: unknown;
  createdAt: string;
}
