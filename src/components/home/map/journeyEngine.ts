import { US_STATES, US_CITIES, type UsCity } from "../usMapGeo";
import { NON_CONTINENTAL } from "./stateAbbr";

/**
 * Journey generation engine — behavior preserved exactly from the previous
 * implementation (50 randomized journeys per loop, distance-scaled duration,
 * alternating natural curves). Only continental origins/destinations are used
 * so routes match the reference's lower-48 presentation.
 */
export const JOURNEYS_PER_LOOP = 50;

export interface Journey {
  originState: string;
  origin: { x: number; y: number };
  dest: UsCity;
  path: string;
  travelMs: number;
}

export function buildJourneys(): Journey[] {
  const journeys: Journey[] = [];
  const continental = US_STATES.filter((s) => !NON_CONTINENTAL.has(s.name));
  let originPool = shuffle([...continental]);

  for (let i = 0; i < JOURNEYS_PER_LOOP; i++) {
    if (originPool.length === 0) originPool = shuffle([...continental]);
    const originState = originPool.pop()!;
    const destChoices = US_CITIES.filter(
      (c) => c.state !== originState.name && !NON_CONTINENTAL.has(c.state),
    );
    const dest = destChoices[Math.floor(Math.random() * destChoices.length)];

    const from = { x: originState.cx, y: originState.cy };
    const dist = Math.hypot(dest.x - from.x, dest.y - from.y);
    journeys.push({
      originState: originState.name,
      origin: from,
      dest,
      path: curvedPath(from, dest, i),
      travelMs: 1400 + Math.min(2200, dist * 4.5),
    });
  }
  return journeys;
}

export function curvedPath(a: { x: number; y: number }, b: { x: number; y: number }, seed: number): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 1;
  const side = seed % 2 === 0 ? 1 : -1;
  const bow = Math.min(64, dist * 0.22) * side;
  return `M ${a.x} ${a.y} Q ${mx - (dy / dist) * bow} ${my + (dx / dist) * bow} ${b.x} ${b.y}`;
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
