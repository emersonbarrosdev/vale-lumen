import { Hero } from '../../domain/hero/hero.model';
import { Hazard } from '../../domain/world/hazard.model';

export interface HazardUpdateSystemParams {
  hazards: Hazard[];
  hero: Hero;
  deltaTime: number;
  applyHeroDamage: (damage?: number) => void;
}

export function updateHazardsSystem({
  hazards,
  hero,
  deltaTime,
  applyHeroDamage,
}: HazardUpdateSystemParams): void {
  for (const hazard of hazards) {
    hazard.pulseOffset += deltaTime * 1.8;

    if (!hazard.active) {
      continue;
    }

    if (hero.invulnerabilityTimer <= 0 && rectsOverlap(hero, hazard)) {
      applyHeroDamage(hazard.damage);
    }
  }
}

function rectsOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
