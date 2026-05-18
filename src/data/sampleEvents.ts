import type { EventRecord } from '../types/events';

export const sampleEvents: EventRecord[] = [
  {
    id: 'rogers-arena-live-01',
    title: 'Rogers Arena Night Pulse',
    description:
      'A high-energy downtown concert night with layered light rigs, late transit access, and food stops clustered around the arena district.',
    date: '2026-06-21T20:00:00-07:00',
    address: '800 Griffiths Way',
    city: 'Vancouver',
    imageUrl:
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1400&auto=format&fit=crop',
    tags: ['EDM', 'Nighttime Events', 'New Skytrain'],
    source: 'ticketmaster',
    url: 'https://www.ticketmaster.ca/'
  },
  {
    id: 'stanley-park-day-ride',
    title: 'Seawall Picnic Circuit',
    description:
      'A flexible outdoor outing built around Stanley Park seawall stops, daytime photo breaks, and family-friendly picnic pockets near the water.',
    date: '2026-07-05T11:00:00-07:00',
    address: 'Stanley Park Drive',
    city: 'Vancouver',
    imageUrl:
      'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=1400&auto=format&fit=crop',
    tags: ['Outdoor', 'Daytime Events', 'Kid Friendly'],
    source: 'manual',
    url: 'https://vancouver.ca/parks-recreation-culture/stanley-park.aspx'
  },
  {
    id: 'christmas-market-2026',
    title: 'The Vancouver Christmas Market (2026)',
    description:
      'Vancouver’s historic, authentic German-inspired outdoor holiday village at Jack Poole Plaza. Stroll past 100+ interconnected wooden artisan stalls, experience the glittering Sky Curtain of Lights, ride the Aeroplan Holiday Carousel, and enjoy traditional seasonal treats like bratwurst, schnitzel, and hot Gluhwein.',
    date: '2026-11-14T12:00:00-08:00',
    address: '1055 Canada Place (Jack Poole Plaza)',
    city: 'Vancouver',
    imageUrl: 'https://images.unsplash.com/photo-1545231027-634d0f62f294?w=1200',
    tags: ['Outdoor', 'Daytime Events', 'Nighttime Events', 'Kid Friendly', 'New Skytrain'],
    source: 'christmas-market',
    url: 'https://www.vancouverchristmasmarket.com/'
  }
];
