import { beforeEach, describe, expect, it } from 'vitest';
import { resetFailedIngestionLogs } from './ingestionGuards';
import { mapEventbriteEvents, mapShowpassEvents } from './partnerFeeds';

describe('partner feed deep descriptions', () => {
  beforeEach(() => {
    resetFailedIngestionLogs();
  });

  it('reads Showpass nested HTML/text descriptions instead of shallow summaries', () => {
    const events = mapShowpassEvents({
      events: [
        {
          id: 'show-1',
          title: 'Deep Club Night',
          summary: 'Short shallow summary',
          descriptionBlocks: [
            { html: '<p>This full Showpass description contains venue details, set times, entry notes, and transit context.</p>' }
          ],
          date: '2026-08-01T22:00:00-07:00',
          image: { url: 'https://example.com/show.jpg' }
        }
      ]
    });

    expect(events[0]?.description).toContain('full Showpass description');
  });

  it('reads Eventbrite description arrays deeply', () => {
    const events = mapEventbriteEvents({
      data: [
        {
          id: 'eventbrite-1',
          name: 'Maker Day',
          description: {
            text: ['This Eventbrite listing has a full maker-market description with workshops, vendors, food, and access notes.']
          },
          start: { local: '2026-09-10T10:00:00-07:00' },
          logo: { url: 'https://example.com/eventbrite.jpg' }
        }
      ]
    });

    expect(events[0]?.description).toContain('maker-market description');
  });
});
