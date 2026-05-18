import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import { createHash } from 'node:crypto';
import { extname } from 'node:path';
import { chromium } from 'playwright';
import { eventSourceTargets, type EventSourceTarget } from '../src/config/eventSources';

loadEnv({ path: '.env.local', quiet: true });
loadEnv({ quiet: true });

interface ExtractedEvent {
  title: string;
  description: string;
  date_time: string;
  venue: string;
  neighborhood: string;
  ticket_link: string;
  image_url: string;
  category?: string;
  tags?: string[];
}

interface EventRow {
  id: string;
  title: string;
  description: string;
  date: string;
  date_time: string;
  venue: string;
  neighborhood: string | null;
  address: string;
  city: string;
  image_url: string;
  image_storage_path: string | null;
  image_fallback_required: boolean;
  tags: string[];
  category: string;
  source: string;
  source_url: string;
  ticket_link: string;
  url: string;
  extraction_model: string;
  raw_payload: Record<string, unknown>;
}

const SUPABASE_URL = requiredEnv('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
const GEMINI_API_KEY = requiredEnv('GEMINI_API_KEY');
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';
const STORAGE_BUCKET = process.env.SUPABASE_EVENT_IMAGE_BUCKET || 'event-images';
const SCRAPER_USER_AGENT =
  process.env.SCRAPER_USER_AGENT ||
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const gemini = new GoogleGenerativeAI(GEMINI_API_KEY);

async function main() {
  const args = new Set(process.argv.slice(2));
  const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined;
  const dryRun = args.has('--dry-run');
  const validateConfig = args.has('--validate-config');
  const targets = Number.isFinite(limit) ? eventSourceTargets.slice(0, limit) : eventSourceTargets;

  validateTargets(eventSourceTargets);

  if (validateConfig) {
    console.log(`Validated ${eventSourceTargets.length} source targets.`);
    return;
  }

  if (!dryRun) {
    await ensureStorageBucket();
  }

  for (const target of targets) {
    await ingestTarget(target, { dryRun });
  }
}

async function ingestTarget(target: EventSourceTarget, options: { dryRun: boolean }) {
  console.log(`Scraping ${target.name} -> ${target.url}`);

  try {
    const html = await fetchSourceHtml(target.url);
    const extractedEvents = await extractEventsWithGemini(target, html);

    if (extractedEvents.length === 0) {
      await logFailedIngestion(target, ['no_events_extracted'], {
        source_url: target.url,
        raw_length: html.length
      }, options.dryRun);
      return;
    }

    for (const extractedEvent of extractedEvents) {
      const validationErrors = validateExtractedEvent(extractedEvent);

      if (validationErrors.length > 0) {
        await logFailedIngestion(target, validationErrors, extractedEvent, options.dryRun);
        continue;
      }

      const imageAsset = await persistImage(extractedEvent.image_url, target, options.dryRun);
      const row = toEventRow(target, extractedEvent, imageAsset);

      if (options.dryRun) {
        console.log(`DRY RUN ${target.id}: ${row.title}`);
        continue;
      }

      const { error } = await supabase.from('events').upsert(row, { onConflict: 'source_url' });
      if (error) {
        await logFailedIngestion(target, ['database_upsert_failed'], {
          error: error.message,
          row
        }, options.dryRun);
        continue;
      }

      console.log(`Upserted ${row.title}`);
    }
  } catch (error) {
    await logFailedIngestion(target, ['scrape_or_extract_failed'], {
      message: error instanceof Error ? error.message : String(error)
    }, options.dryRun);
  }
}

async function fetchSourceHtml(url: string) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: SCRAPER_USER_AGENT,
    locale: 'en-CA',
    timezoneId: 'America/Vancouver',
    extraHTTPHeaders: {
      'accept-language': 'en-CA,en;q=0.9'
    }
  });

  try {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForLoadState('networkidle');
    return await page.content();
  } finally {
    await context.close();
    await browser.close();
  }
}

async function extractEventsWithGemini(target: EventSourceTarget, pageText: string): Promise<ExtractedEvent[]> {
  const model = gemini.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            description: { type: SchemaType.STRING },
            date_time: { type: SchemaType.STRING },
            venue: { type: SchemaType.STRING },
            neighborhood: { type: SchemaType.STRING },
            ticket_link: { type: SchemaType.STRING },
            image_url: { type: SchemaType.STRING },
            category: { type: SchemaType.STRING },
            tags: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING }
            }
          },
          required: ['title', 'description', 'date_time', 'venue', 'neighborhood', 'ticket_link', 'image_url']
        }
      }
    }
  });

  const prompt = `You are normalizing messy Vancouver event listing text into strict JSON.

Source name: ${target.name}
Source URL: ${target.url}
Default venue: ${target.venue ?? 'infer from listing'}
Default category: ${target.category}
Default neighborhood: ${target.neighborhood ?? 'infer from listing'}
Extra hints: ${(target.extractionHints ?? []).join(' ')}

Rules:
- Return a JSON array only. No Markdown.
- Extract every real upcoming event visible in the page text.
- date_time must be ISO-8601. If the page gives no year, infer the next plausible upcoming Vancouver date.
- ticket_link should be the event detail or ticket URL; use the source URL only if no event-specific link is available.
- image_url should be an absolute URL if present; otherwise return an empty string.
- description must be specific and at least 50 characters.
- Do not invent events that are not present in the text.

PAGE TEXT:
${pageText}`;

  const result = await model.generateContent(prompt);
  return parseGeminiJson(result.response.text());
}

async function persistImage(
  imageUrl: string,
  target: EventSourceTarget,
  dryRun: boolean
): Promise<{ imageUrl: string; storagePath: string | null; fallbackRequired: boolean }> {
  if (!imageUrl) {
    return { imageUrl: '', storagePath: null, fallbackRequired: true };
  }

  if (dryRun) {
    return { imageUrl, storagePath: null, fallbackRequired: false };
  }

  try {
    const absoluteImageUrl = new URL(imageUrl, target.url).toString();
    const response = await fetch(absoluteImageUrl);

    if (!response.ok) {
      throw new Error(`Image fetch failed: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const extension = extensionFromContentType(contentType) || extname(new URL(absoluteImageUrl).pathname) || '.jpg';
    const arrayBuffer = await response.arrayBuffer();
    const hash = createHash('sha256').update(Buffer.from(arrayBuffer)).digest('hex').slice(0, 16);
    const storagePath = `${target.id}/${hash}${extension}`;

    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, arrayBuffer, {
      cacheControl: '31536000',
      contentType,
      upsert: true
    });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
    return {
      imageUrl: data.publicUrl,
      storagePath,
      fallbackRequired: false
    };
  } catch (error) {
    await logFailedIngestion(target, ['image_storage_failed'], {
      image_url: imageUrl,
      error: error instanceof Error ? error.message : String(error)
    }, dryRun);

    return { imageUrl, storagePath: null, fallbackRequired: true };
  }
}

async function ensureStorageBucket() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    throw new Error(`Unable to list Supabase buckets: ${listError.message}`);
  }

  if (buckets.some((bucket) => bucket.name === STORAGE_BUCKET)) {
    return;
  }

  const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  });

  if (error) {
    throw new Error(`Unable to create ${STORAGE_BUCKET} bucket: ${error.message}`);
  }
}

function toEventRow(
  target: EventSourceTarget,
  event: ExtractedEvent,
  imageAsset: { imageUrl: string; storagePath: string | null; fallbackRequired: boolean }
): EventRow {
  const sourceUrl = event.ticket_link || `${target.url}#${slugify(`${event.title}-${event.date_time}`)}`;
  const id = stableId(`${target.id}|${event.venue}|${event.date_time}|${sourceUrl}`);
  const venue = event.venue || target.venue || target.name;
  const normalizedDate = new Date(event.date_time).toISOString();

  return {
    id,
    title: event.title.trim(),
    description: event.description.trim(),
    date: normalizedDate,
    date_time: normalizedDate,
    venue,
    neighborhood: event.neighborhood || target.neighborhood || null,
    address: venue,
    city: inferCity(target),
    image_url: imageAsset.imageUrl,
    image_storage_path: imageAsset.storagePath,
    image_fallback_required: imageAsset.fallbackRequired,
    tags: normalizeTags(event.tags),
    category: event.category || target.category,
    source: target.name,
    source_url: sourceUrl,
    ticket_link: event.ticket_link || target.url,
    url: event.ticket_link || target.url,
    extraction_model: GEMINI_MODEL,
    raw_payload: {
      source_target: target,
      extracted_event: event
    }
  };
}

async function logFailedIngestion(
  target: EventSourceTarget,
  missingProperties: string[],
  rawPayload: unknown,
  dryRun = false
) {
  const payload = rawPayload && typeof rawPayload === 'object' ? (rawPayload as Record<string, unknown>) : {};

  if (dryRun) {
    console.warn(`DRY RUN failure ${target.id}: ${missingProperties.join(', ')}`);
    return;
  }

  const { error } = await supabase.from('failed_ingestion_logs').insert({
    source: target.name,
    target_url: target.url,
    missing_properties: missingProperties,
    title: typeof payload.title === 'string' ? payload.title : null,
    description: typeof payload.description === 'string' ? payload.description : null,
    image_url: typeof payload.image_url === 'string' ? payload.image_url : null,
    raw_payload: rawPayload
  });

  if (error) {
    console.warn(`Failed to record ingestion log for ${target.name}: ${error.message}`);
  }
}

function validateExtractedEvent(event: ExtractedEvent) {
  const errors: string[] = [];

  if (!event.title?.trim()) {
    errors.push('title');
  }

  if (!event.description?.trim() || event.description.trim().length < 50) {
    errors.push('description');
  }

  if (!event.date_time || Number.isNaN(new Date(event.date_time).getTime())) {
    errors.push('date_time');
  }

  if (!event.venue?.trim()) {
    errors.push('venue');
  }

  if (!event.ticket_link?.trim()) {
    errors.push('ticket_link');
  }

  return errors;
}

function parseGeminiJson(text: string): ExtractedEvent[] {
  const clean = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  const parsed = JSON.parse(clean) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error('Gemini response was not a JSON array');
  }

  return parsed as ExtractedEvent[];
}

function validateTargets(targets: EventSourceTarget[]) {
  const ids = new Set<string>();

  for (const target of targets) {
    if (ids.has(target.id)) {
      throw new Error(`Duplicate source id: ${target.id}`);
    }

    ids.add(target.id);
    new URL(target.url);
  }
}

function normalizeTags(tags: string[] | undefined) {
  return Array.from(new Set((tags ?? []).map((tag) => tag.trim()).filter(Boolean))).slice(0, 12);
}

function inferCity(target: EventSourceTarget) {
  if (target.neighborhood === 'Burnaby') {
    return 'Burnaby';
  }

  if (target.neighborhood === 'Richmond') {
    return 'Richmond';
  }

  if (target.neighborhood === 'Coquitlam') {
    return 'Coquitlam';
  }

  if (target.neighborhood === 'Port Moody') {
    return 'Port Moody';
  }

  if (target.neighborhood === 'New Westminster') {
    return 'New Westminster';
  }

  if (target.neighborhood === 'Whistler') {
    return 'Whistler';
  }

  return 'Vancouver';
}

function stableId(input: string) {
  return `evt_${createHash('sha256').update(input).digest('hex').slice(0, 24)}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function extensionFromContentType(contentType: string) {
  if (contentType.includes('png')) {
    return '.png';
  }

  if (contentType.includes('webp')) {
    return '.webp';
  }

  if (contentType.includes('gif')) {
    return '.gif';
  }

  if (contentType.includes('jpeg') || contentType.includes('jpg')) {
    return '.jpg';
  }

  return '';
}

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
