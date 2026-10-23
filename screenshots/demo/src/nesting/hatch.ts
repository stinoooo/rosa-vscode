import type { Character, Nest } from './types';

/** How long an egg incubates before it can hatch, per species. */
export const INCUBATION_HOURS: Record<string, number> = {
  Pachycephalosaurus: 6,
  Hypsilophodon: 4,
  Maiasaura: 8,
};

export interface HatchResult {
  hatched: Character[];
  waiting: number;
}

// An egg hatches once its time is up and a parent is still nearby.
export function hatchReady(nest: Nest, now: Date = new Date()): HatchResult {
  const hours = INCUBATION_HOURS[nest.species] ?? 6;
  const ready = nest.eggs.filter((egg) => {
    const elapsed = (now.getTime() - egg.laidAt.getTime()) / 3_600_000;
    return elapsed >= hours && nest.parentsNearby > 0;
  });

  const hatched = ready.map((egg, i) => ({
    name: `${nest.species} hatchling ${i + 1}`,
    species: nest.species,
    growth: 0,
    parents: [nest.motherId, nest.fatherId],
    bornAt: now,
  }));

  return { hatched, waiting: nest.eggs.length - ready.length };
}
