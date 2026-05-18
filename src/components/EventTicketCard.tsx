import type { MouseEvent } from 'react';
import type { EventRecord } from '../types/events';

interface EventTicketCardProps {
  event: EventRecord;
  onSelect: (event: EventRecord) => void;
}

export function EventTicketCard({ event, onSelect }: EventTicketCardProps) {
  function handleMouseMove(mouseEvent: MouseEvent<HTMLElement>) {
    const card = mouseEvent.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = mouseEvent.clientX - rect.left;
    const y = mouseEvent.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -7;
    const rotateY = ((x / rect.width) - 0.5) * 7;
    card.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  }

  function handleMouseLeave(mouseEvent: MouseEvent<HTMLElement>) {
    mouseEvent.currentTarget.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg)';
  }

  return (
    <article
      className="ticket-card neo-brutal glass-card group flex cursor-pointer flex-col overflow-hidden rounded-[1.8rem] md:flex-row"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(event)}
      onKeyDown={(keyboardEvent) => {
        if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
          keyboardEvent.preventDefault();
          onSelect(event);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open details for ${event.title}`}
    >
      <div className="ticket-edge relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-deep-wine md:w-2/5">
        <img
          src={event.imageUrl}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute left-4 top-4 rounded-full border-2 border-charcoal-earth bg-warm-honey px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-charcoal-earth shadow-[3px_3px_0px_0px_#564D4A]">
          {event.source}
        </div>
      </div>

      <div className="ticket-card-content flex min-w-0 flex-1 flex-col gap-4 p-5 sm:p-7">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-crimson-red">
            {formatEventDate(event.date)}
          </p>
          <h2 className="mt-2 text-3xl font-black leading-none tracking-[-0.04em] text-charcoal-earth">
            {event.title}
          </h2>
        </div>

        <p className="text-base font-semibold leading-7 text-deep-wine">{event.description}</p>

        <div className="mt-auto flex flex-wrap gap-2">
          {event.tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full border-2 border-charcoal-earth px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#564D4A] ${
                tag === 'New Skytrain'
                  ? 'bg-warm-honey text-charcoal-earth'
                  : 'bg-canvas-base text-deep-wine'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t-2 border-dashed border-charcoal-earth/50 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-charcoal-earth">
            {event.address}, {event.city}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border-2 border-charcoal-earth bg-white/70 px-3 py-2 text-sm font-black text-deep-wine shadow-[2px_2px_0px_0px_#564D4A] backdrop-blur">
              {event.price ?? 'Price varies'}
            </span>
            {event.url ? (
              <a
                className="micro-button neo-brutal inline-flex items-center justify-center rounded-full bg-vibrant-vermillion px-4 py-2 text-sm font-black text-white"
                href={event.url}
                target="_blank"
                rel="noreferrer"
                onClick={(clickEvent) => clickEvent.stopPropagation()}
              >
                View source
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat('en-CA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
}
