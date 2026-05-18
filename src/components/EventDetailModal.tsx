import { CalendarDays, ExternalLink, Tag, Ticket, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import type { EventRecord } from '../types/events';

interface EventDetailModalProps {
  event: EventRecord;
  onClose: () => void;
}

export function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  const ticketHref = event.ticketUrl ?? event.url;
  const moreInfoHref = event.moreInfoUrl ?? event.url;

  useEffect(() => {
    function handleKeyDown(keyboardEvent: KeyboardEvent) {
      if (keyboardEvent.key === 'Escape') {
        onClose();
      }
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="modal-backdrop fixed inset-0 z-[80] flex items-end justify-center bg-charcoal-earth/55 px-3 py-5 backdrop-blur-xl sm:items-center sm:px-6"
      onClick={onClose}
      role="presentation"
    >
      <section
        className="modal-card glass-panel relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[2rem] border-2 border-white/60 shadow-[0_24px_80px_rgba(86,77,74,0.35)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-detail-title"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        <button
          type="button"
          className="micro-button absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-charcoal-earth bg-canvas-base/90 text-charcoal-earth shadow-[3px_3px_0px_0px_#564D4A] backdrop-blur"
          onClick={onClose}
          aria-label="Close event details"
        >
          <X size={20} aria-hidden="true" />
        </button>

        <div className="grid max-h-[92vh] overflow-y-auto lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[280px] overflow-hidden bg-deep-wine lg:min-h-full">
            <img src={event.imageUrl} alt="" className="h-full min-h-[280px] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-earth/70 via-charcoal-earth/10 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <span className="glass-chip inline-flex items-center rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white">
                {event.source}
              </span>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-8">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-crimson-red">
                Event details
              </p>
              <h2
                id="event-detail-title"
                className="mt-3 text-4xl font-black leading-none tracking-[-0.06em] text-charcoal-earth sm:text-5xl"
              >
                {event.title}
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <InfoTile label="Date" value={formatEventDate(event.date)} icon={<CalendarDays size={18} />} />
              <InfoTile label="Time" value={formatEventTime(event.date)} icon={<CalendarDays size={18} />} />
              <InfoTile label="Price" value={event.price ?? 'Check listing'} icon={<Ticket size={18} />} />
            </div>

            <div className="glass-panel-soft rounded-3xl p-5">
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-deep-wine">Description</h3>
              <p className="mt-3 text-base font-semibold leading-8 text-charcoal-earth">{event.description}</p>
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-deep-wine">
                Venue and location
              </p>
              <p className="mt-2 text-lg font-black text-charcoal-earth">
                {event.address}, {event.city}
              </p>
            </div>

            <div>
              <p className="mb-3 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-deep-wine">
                <Tag size={16} aria-hidden="true" />
                Associated tags
              </p>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`tag-pop rounded-full border-2 border-charcoal-earth px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#564D4A] ${
                      tag === 'New Skytrain'
                        ? 'bg-warm-honey text-charcoal-earth'
                        : 'bg-white/75 text-deep-wine backdrop-blur'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t-2 border-dashed border-charcoal-earth/40 pt-5 sm:flex-row">
              {ticketHref ? (
                <a
                  className="micro-button neo-brutal inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-vibrant-vermillion px-5 py-3 text-sm font-black text-white"
                  href={ticketHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Ticket size={18} aria-hidden="true" />
                  Buy tickets
                </a>
              ) : null}
              {moreInfoHref ? (
                <a
                  className="micro-button neo-brutal inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-canvas-base px-5 py-3 text-sm font-black text-charcoal-earth"
                  href={moreInfoHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={18} aria-hidden="true" />
                  Find out more
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoTile({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="glass-panel-soft rounded-2xl p-4">
      <div className="mb-2 inline-flex text-crimson-red">{icon}</div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-deep-wine">{label}</p>
      <p className="mt-1 text-base font-black text-charcoal-earth">{value}</p>
    </div>
  );
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat('en-CA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));
}

function formatEventTime(value: string) {
  return new Intl.DateTimeFormat('en-CA', {
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
}
