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
    hazard.pulseOffset += deltaTime * getHazardPulseSpeed(hazard);

    if (!hazard.active) {
      continue;
    }

    if (hero.invulnerabilityTimer > 0) {
      continue;
    }

    const hitbox = getHazardHitbox(hazard);

    if (!rectsOverlap(hero, hitbox)) {
      continue;
    }

    applyHeroDamage(hazard.damage);
  }
}

function getHazardPulseSpeed(hazard: Hazard): number {
  switch (hazard.type) {
    case 'geyser':
      return 3.1;
    case 'goo':
      return 1.5;
    case 'spike':
      return 0.85;
    case 'crystal':
      return 1.2;
    default:
      return 1.4;
  }
}

function getHazardHitbox(hazard: Hazard): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  switch (hazard.type) {
    case 'spike':
      return {
        x: hazard.x + 4,
        y: hazard.y + 2,
        width: Math.max(0, hazard.width - 8),
        height: Math.max(0, hazard.height - 2),
      };

    case 'goo':
      return {
        x: hazard.x + 6,
        y: hazard.y + 6,
        width: Math.max(0, hazard.width - 12),
        height: Math.max(0, hazard.height - 8),
      };

    case 'geyser': {
      const pulse = Math.sin(hazard.pulseOffset) * 0.5 + 0.5;
      const activeHeight = 24 + pulse * 34;

      return {
        x: hazard.x + hazard.width * 0.18,
        y: hazard.y - activeHeight,
        width: hazard.width * 0.64,
        height: hazard.height + activeHeight,
      };
    }

    case 'crystal':
      return {
        x: hazard.x + hazard.width * 0.16,
        y: hazard.y + 4,
        width: hazard.width * 0.68,
        height: hazard.height - 6,
      };

    default:
      return hazard;
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
