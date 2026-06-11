import { chromium, type Page } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const BASE = 'https://www.celebritiesnightclub.com';
const EVENTS_URL = `${BASE}/events`;
const CONCURRENCY = 3;
const OUTPUT_DIR = 'data';
const OUTPUT_FILE = `${OUTPUT_DIR}/celebrities-events.json`;

interface ScrapedEvent {
  title: string;
  date_iso: string;
  date_text: string;
  time_text: string;
  description: string;
  image_url: string;
  event_url: string;
  ticket_url: string;
  venue: string;
  neighborhood: string;
  city: string;
  tags: string[];
}

async function main() {
  console.log(`Fetching ${EVENTS_URL}...\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'en-CA',
    timezoneId: 'America/Vancouver'
  });

  try {
    const page = await context.newPage();
    await page.goto(EVENTS_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForLoadState('networkidle');

    const listItems = await page.evaluate((base) => {
      const cards = document.querySelectorAll('.eventlist-event');
      return Array.from(cards).map((card) => {
        const titleEl = card.querySelector('.eventlist-title a, .eventlist-title');
        const dateEl = card.querySelector('.event-date');
        const timeEl = card.querySelector('.event-time-localized-inner, time.event-time-localized');
        const imgEl = card.querySelector('img');
        const linkEl = card.querySelector('a[href*="/events/"]');
        const startAttr = card.querySelector('time[datetime]');

        const href = linkEl?.getAttribute('href') ?? '';
        return {
          title: titleEl?.textContent?.trim() ?? '',
          date_text: dateEl?.textContent?.trim() ?? '',
          date_iso: startAttr?.getAttribute('datetime') ?? '',
          time_text: timeEl?.textContent?.trim() ?? '',
          image_url: imgEl?.getAttribute('data-src') || imgEl?.getAttribute('src') || '',
          event_url: href.startsWith('http') ? href : `${base}${href}`
        };
      });
    }, BASE);

    const now = new Date();
    const upcoming = listItems.filter((e) => {
      if (!e.date_iso) return true;
      return new Date(e.date_iso) >= now;
    });

    console.log(`Found ${listItems.length} total, ${upcoming.length} upcoming. Fetching details...\n`);

    const events: ScrapedEvent[] = [];
    for (let i = 0; i < upcoming.length; i += CONCURRENCY) {
      const batch = upcoming.slice(i, i + CONCURRENCY);
      const details = await Promise.all(
        batch.map((item) => fetchEventDetail(context, item))
      );
      events.push(...details);
    }

    console.log(`\n=== ${events.length} events with details ===\n`);
    for (const event of events) {
      console.log(`  ${event.title}`);
      console.log(`    Date:  ${event.date_text || event.date_iso}`);
      console.log(`    Time:  ${event.time_text}`);
      console.log(`    URL:   ${event.event_url}`);
      console.log(`    Image: ${event.image_url ? 'yes' : 'no'}`);
      console.log(`    Tags:  ${event.tags.join(', ') || 'none'}`);
      console.log(`    Desc:  ${event.description.slice(0, 120)}${event.description.length > 120 ? '...' : ''}`);
      console.log('');
    }

    mkdirSync(OUTPUT_DIR, { recursive: true });
    writeFileSync(OUTPUT_FILE, JSON.stringify(events, null, 2));
    console.log(`Wrote ${events.length} events to ${OUTPUT_FILE}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

async function fetchEventDetail(
  context: Awaited<ReturnType<typeof chromium.launch>>['contexts'][0],
  item: { title: string; date_text: string; date_iso: string; time_text: string; image_url: string; event_url: string }
): Promise<ScrapedEvent> {
  const fallback: ScrapedEvent = {
    ...item,
    description: '',
    ticket_url: '',
    venue: 'Celebrities Nightclub',
    neighborhood: 'Davie Village',
    city: 'Vancouver',
    tags: []
  };

  if (!item.event_url) return fallback;

  let page: Page | null = null;
  try {
    page = await context.newPage();
    await page.goto(item.event_url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});

    const detail = await page.evaluate(() => {
      const descEl =
        document.querySelector('.eventitem-column-content .sqs-html-content') ||
        document.querySelector('.eventitem-column-content') ||
        document.querySelector('.entry-content');

      let description = '';
      if (descEl) {
        const paras = descEl.querySelectorAll('p, li, h2, h3');
        if (paras.length > 0) {
          description = Array.from(paras)
            .map((p) => p.textContent?.trim())
            .filter((t) => t && !t.match(/^(BUY TICKETS|RSVP|#block-)/i))
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        } else {
          description = descEl.textContent?.trim().replace(/\s+/g, ' ') ?? '';
        }
      }

      const ticketLink =
        document.querySelector('a[href*="eventbrite"], a[href*="ticket"], a[href*="showpass"], a[href*="admitad"]');
      const ticketUrl = ticketLink?.getAttribute('href') ?? '';

      return { description, ticket_url: ticketUrl };
    });

    const cleanDesc = detail.description
      .replace(/BUY TICKETS!?/gi, '')
      .replace(/#block-[a-f0-9]+\.{0,3}/g, '')
      .trim();

    console.log(`  [detail] ${item.title} -> ${cleanDesc.length} chars`);

    return {
      ...fallback,
      description: cleanDesc,
      ticket_url: detail.ticket_url
    };
  } catch (err) {
    console.log(`  [detail] ${item.title} -> failed: ${err instanceof Error ? err.message : String(err)}`);
    return fallback;
  } finally {
    if (page) await page.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
