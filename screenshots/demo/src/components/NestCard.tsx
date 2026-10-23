import { hatchReady } from '../nesting/hatch';
import type { Nest } from '../nesting/types';

export function NestCard({ nest }: { nest: Nest }) {
  const { hatched, waiting } = hatchReady(nest);
  return (
    <article className="nest-card">
      <h2>{nest.species} nest</h2>
      <p>
        {hatched.length} ready to hatch, {waiting} still warm.
      </p>
      <button type="button" disabled={hatched.length === 0}>
        Hatch {hatched.length} eggs
      </button>
    </article>
  );
}
