import type { EventTag, TierOneFilter } from '../types/events';

export const tierOneFilters: Array<{
  id: TierOneFilter;
  label: string;
  activeColor: string;
}> = [
  { id: 'all', label: '✨ All Experiences', activeColor: '#564D4A' },
  { id: 'live', label: '🎵 Live Events & Clubs', activeColor: '#F24333' },
  { id: 'activities', label: '🎯 Activities & Outings', activeColor: '#BA1B1D' }
];

export const contextualFilters: Record<TierOneFilter, EventTag[]> = {
  all: ['Indoor', 'Outdoor', 'Daytime Events', 'Nighttime Events', 'Kid Friendly'],
  live: ['EDM', 'Country', 'Nighttime Events', 'New Skytrain'],
  activities: [
    'Indoor',
    'Outdoor',
    'Daytime Events',
    'Boys Night',
    'Girls Night',
    'Kid Friendly',
    'I have a car'
  ]
};

export const structuralTransportTags = new Set<EventTag>(['New Skytrain']);
