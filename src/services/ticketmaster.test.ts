import { beforeEach, describe, expect, it } from 'vitest';
import { resetFailedIngestionLogs } from './ingestionGuards';
import {
  ROGERS_ARENA_VANCOUVER_VENUE_ID,
  buildRogersArenaTicketmasterUrl,
  mapTicketmasterEvents,
  selectTicketmasterHeroImage
} from './ticketmaster';

describe('Ticketmaster Rogers Arena guardrails', () => {
  beforeEach(() => {
    resetFailedIngestionLogs();
  });

  it('strictly binds the venue query to Rogers Arena Vancouver', () => {
    const url = buildRogersArenaTicketmasterUrl({ apiKey: 'test-key' });

    expect(url).toContain(`venueId=${ROGERS_ARENA_VANCOUVER_VENUE_ID}`);
    expect(url).not.toContain('8214');
  });

  it('selects only large 16:9 hero imagery first', () => {
    const selected = selectTicketmasterHeroImage([
      { url: 'small.jpg', ratio: '16_9', width: 800 },
      { url: 'portrait.jpg', ratio: '3_2', width: 1800 },
      { url: 'large.jpg', ratio: '16_9', width: 1600 }
    ]);

    expect(selected).toBe('large.jpg');
  });

  it('falls through info, pleaseNote, and attraction bio descriptions', () => {
    const mapped = mapTicketmasterEvents({
      _embedded: {
        events: [
          {
            id: 'abc',
            name: 'Arena Test Night',
            dates: { start: { dateTime: '2026-06-01T20:00:00Z' } },
            images: [{ url: 'large.jpg', ratio: '16_9', width: 1600 }],
            _embedded: {
              venues: [{ address: { line1: '800 Griffiths Way' }, city: { name: 'Vancouver' } }],
              attractions: [
                {
                  description:
                    'A detailed attraction biography with more than fifty characters for guard validation.'
                }
              ]
            }
          }
        ]
      }
    });

    expect(mapped[0]?.description).toContain('detailed attraction biography');
  });
});
