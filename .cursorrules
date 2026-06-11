# What's In Vancouver (WIV)

Vancouver event aggregation app. Vite + React + TypeScript + Tailwind. Supabase backend (migrating to Neon). Deployed on Vercel.

## Collaboration Rules

Two contributors: Matt (Cursor + Gemini) and Jason (Claude Code). Same rules apply to all AI tools.

1. **Never commit directly to `main`.** Always create a feature branch first.
2. **Branch naming:** `yourname/feature-description` (e.g. `matt/celebrities-scraper`, `jason/showpass-api`)
3. **Commit messages:** Describe what changed, not how. One clear sentence.
4. **Always open a PR.** The other person reviews before merging.
5. **API keys go in GitHub Secrets** for production and `.env.local` for local dev. Never hardcode secrets.
6. **Pull before starting work.** Always pull the latest `main` before creating a new branch.

## Project Structure

- `src/` - React frontend (event display, filters, UI)
- `scripts/` - Ingestion pipeline (scraper + Gemini extraction)
- `supabase/` - Database schema and migrations
- `.env.example` - Template for local environment variables

## Local Dev

```bash
npm install
npm run dev          # Start dev server
npm run ingest:check # Validate source config
npm run ingest:dry-run # Test one source without writing to DB
npm run ingest       # Full ingestion run
```

## Event Sources

Task tracking: https://docs.google.com/spreadsheets/d/1CKcFvc57r_Wk7KZtksvgrR9C5qwY20llUl8NwMkjSb0/edit?gid=75745201#gid=75745201

### APIs (ready to integrate)
- **Ticketmaster** - Discovery API v2. Free, 5000 calls/day. Also covers Rogers Arena, Commodore, Vogue, BC Place, PNE, Live Nation.
- **Showpass** - Free public API. Good for local/indie events.
- **City of Vancouver Open Data** - Free municipal events API. No key needed for small queries.

### Scrape only (no usable API)
Celebrities, Daily Hive, Vancouver is Awesome, Miss604, Vancouver Magazine, Curiocity, Destination Vancouver, Red Room, Civic Theatres, Art Gallery, Science World, Bard on the Beach, VSO, Biltmore, The Pearl, Family Fun Vancouver, VPL, Dine Out, Whistler Blackcomb, MRG Live, tourism sites (Richmond, Burnaby, North Shore, Surrey, New West, Langley), Cypress, Grouse.

### Blocked / do not use
- Eventbrite: public search removed 2019, OAuth only per-org
- Meetup.com: requires paid Pro subscription
- Facebook Events: restricted app review
- Luma: $59-69/mo for API
- Bandsintown: per-artist only, not discovery
- EDM Train: terms prohibit combining with other sources

## Filter Categories

Tier 1: Live Events, Activities
Sub-filters: live music, comedy, theater, movies, festival, food, date night, family friendly, sports, car shows, arts, boys night, girls night, classes/workshops
Additional: location (broad zones), indoor/outdoor, daytime/nighttime, SkyTrain accessible, free/paid
Date range: default 3 months, options for 6/9/12 months
