import { useEffect, useRef, useState } from 'react';
import { contextualFilters, structuralTransportTags, tierOneFilters } from '../data/filterMatrix';
import type { EventTag, TierOneFilter } from '../types/events';

interface FilterMatrixProps {
  activeTier: TierOneFilter;
  activeTags: EventTag[];
  onTierChange: (tier: TierOneFilter) => void;
  onToggleTag: (tag: EventTag) => void;
  onClearTag: (tag: EventTag) => void;
}

export function FilterMatrix({
  activeTier,
  activeTags,
  onTierChange,
  onToggleTag,
  onClearTag
}: FilterMatrixProps) {
  const [showRibbon, setShowRibbon] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowRibbon(!entry.isIntersecting);
      },
      { rootMargin: '-72px 0px 0px 0px', threshold: 0.08 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const visibleTags = contextualFilters[activeTier];
  const activeTierLabel = tierOneFilters.find((filter) => filter.id === activeTier)?.label ?? 'All';

  return (
    <>
      <div
        className={`sync-ribbon fixed left-0 right-0 top-0 z-50 border-b-2 border-charcoal-earth bg-canvas-base/95 px-3 py-2 shadow-[0px_4px_0px_0px_#564D4A] backdrop-blur ${
          showRibbon ? 'visible' : ''
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto">
          <span className="shrink-0 text-xs font-black uppercase tracking-[0.2em] text-deep-wine">
            Sync
          </span>
          <MiniBadge label={activeTierLabel} />
          {activeTags.map((tag) => (
            <MiniBadge key={tag} label={tag} onClear={() => onClearTag(tag)} />
          ))}
        </div>
      </div>

      <section ref={sentinelRef} className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="rounded-[2rem] border-2 border-charcoal-earth bg-canvas-base p-4 shadow-[8px_8px_0px_0px_#564D4A] sm:p-6">
          <div className="grid gap-3 md:grid-cols-3">
            {tierOneFilters.map((filter) => {
              const isActive = activeTier === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  className={`neo-brutal rounded-2xl px-5 py-5 text-left text-xl font-black text-charcoal-earth ${
                    isActive ? 'neo-brutal-active text-white' : 'bg-white'
                  }`}
                  style={{ backgroundColor: isActive ? filter.activeColor : undefined }}
                  onClick={() => onTierChange(filter.id)}
                  aria-pressed={isActive}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-3 transition-all duration-300" aria-live="polite">
            {visibleTags.map((tag) => {
              const isActive = activeTags.includes(tag);
              const isTransport = structuralTransportTags.has(tag);
              const activeColor =
                tag === 'New Skytrain'
                  ? '#E5A93C'
                  : activeTier === 'live'
                    ? '#F24333'
                    : activeTier === 'activities'
                      ? '#BA1B1D'
                      : '#5B2333';

              return (
                <button
                  key={`${activeTier}-${tag}`}
                  type="button"
                  className={`filter-sticker rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.08em] ${
                    isActive ? 'neo-brutal-active text-white' : 'bg-white text-charcoal-earth'
                  }`}
                  style={{
                    backgroundColor: isActive || isTransport ? activeColor : undefined,
                    color: isTransport ? '#564D4A' : undefined
                  }}
                  onClick={() => onToggleTag(tag)}
                  aria-pressed={isActive}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

interface MiniBadgeProps {
  label: string;
  onClear?: () => void;
}

function MiniBadge({ label, onClear }: MiniBadgeProps) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-charcoal-earth bg-warm-honey px-3 py-1 text-xs font-black text-charcoal-earth shadow-[2px_2px_0px_0px_#564D4A]">
      {label}
      {onClear ? (
        <button
          type="button"
          className="ml-1 rounded-full bg-canvas-base px-1 text-[10px] leading-4"
          onClick={onClear}
          aria-label={`Remove ${label}`}
        >
          ✕
        </button>
      ) : null}
    </span>
  );
}
