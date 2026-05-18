# What's in Vancouver

Local event discovery UI plus an automated ingestion pipeline for Vancouver venue and event sources.

## Local development

```bash
npm install
npm run dev
```

## Ingestion setup

Create `.env.local` from `.env.example` and fill in the Supabase service-role key plus Gemini API key.
The real `.env.local` file is git-ignored and must never be committed.

```bash
npm run ingest:check
npm run ingest:dry-run
npm run ingest
```

- `ingest:check` validates the configured source registry.
- `ingest:dry-run` scrapes one source and runs Gemini extraction without Supabase writes.
- `ingest` scrapes all configured sources, uploads images to the `event-images` bucket, and upserts into Supabase.
