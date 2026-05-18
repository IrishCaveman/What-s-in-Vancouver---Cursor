import { useEffect, useMemo, useState } from 'react';
import { EventDetailModal } from './components/EventDetailModal';
import { EventTicketCard } from './components/EventTicketCard';
import { FilterMatrix } from './components/FilterMatrix';
import { Hero } from './components/Hero';
import { IngestionErrorQueue } from './components/IngestionErrorQueue';
import { contextualFilters } from './data/filterMatrix';
import { fetchCuratedEvents, fetchFailedIngestionLogs } from './services/eventsApi';
import type { EventRecord, EventTag, FailedIngestionLog, TierOneFilter } from './types/events';

export default function App() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [logs, setLogs] = useState<FailedIngestionLog[]>([]);
  const [activeTier, setActiveTier] = useState<TierOneFilter>('all');
  const [activeTags, setActiveTags] = useState<EventTag[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);

  useEffect(() => {
    void fetchCuratedEvents().then((records) => {
      setEvents(records);
      setLogs(fetchFailedIngestionLogs());
    });
  }, []);

  function handleTierChange(tier: TierOneFilter) {
    setActiveTier(tier);
    const nextAllowedTags = new Set(contextualFilters[tier]);
    setActiveTags((current) => current.filter((tag) => nextAllowedTags.has(tag)));
  }

  function handleToggleTag(tag: EventTag) {
    setActiveTags((current) =>
      current.includes(tag) ? current.filter((activeTag) => activeTag !== tag) : [...current, tag]
    );
  }

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const tierMatch =
        activeTier === 'all' ||
        (activeTier === 'live' &&
          event.tags.some((tag) => ['EDM', 'Country', 'Nighttime Events', 'New Skytrain'].includes(tag))) ||
        (activeTier === 'activities' &&
          event.tags.some((tag) =>
            ['Indoor', 'Outdoor', 'Daytime Events', 'Boys Night', 'Girls Night', 'Kid Friendly', 'I have a car'].includes(
              tag
            )
          ));

      const tagMatch = activeTags.length === 0 || activeTags.every((tag) => event.tags.includes(tag));
      return tierMatch && tagMatch;
    });
  }, [activeTags, activeTier, events]);

  return (
    <main className="min-h-screen bg-canvas-base">
      <Hero />
      <FilterMatrix
        activeTier={activeTier}
        activeTags={activeTags}
        onTierChange={handleTierChange}
        onToggleTag={handleToggleTag}
        onClearTag={(tag) => setActiveTags((current) => current.filter((activeTag) => activeTag !== tag))}
      />

      <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8 lg:px-10">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-crimson-red">
              {filteredEvents.length} verified listings
            </p>
            <h2 className="text-4xl font-black tracking-[-0.06em] text-charcoal-earth sm:text-5xl">
              Landscape ticket board
            </h2>
          </div>
          <p className="max-w-md text-sm font-bold leading-6 text-deep-wine">
            Rows with empty titles, thin descriptions, or missing imagery are blocked and surfaced in
            the diagnostic queue below.
          </p>
        </div>

        <div className="grid gap-8">
          {filteredEvents.map((event) => (
            <EventTicketCard key={event.id} event={event} onSelect={setSelectedEvent} />
          ))}
        </div>
      </section>

      <IngestionErrorQueue logs={logs} />
      {selectedEvent ? <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} /> : null}
    </main>
  );
}
