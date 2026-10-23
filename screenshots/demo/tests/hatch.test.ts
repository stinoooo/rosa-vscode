import { describe, expect, it } from 'vitest';
import { hatchReady } from '../src/nesting/hatch';

describe('hatchReady', () => {
  it('hatches an egg once its time is up', () => {
    const laidAt = new Date('2026-10-23T08:00:00Z');
    const nest = { species: 'Maiasaura', motherId: 'a', fatherId: 'b', parentsNearby: 1, eggs: [{ id: '1', laidAt }] };
    const result = hatchReady(nest, new Date('2026-10-23T17:00:00Z'));
    expect(result.hatched).toHaveLength(1);
  });
});
