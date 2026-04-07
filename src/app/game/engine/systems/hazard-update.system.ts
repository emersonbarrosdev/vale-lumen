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
      return 3.2;
    case 'goo':
      return 1.8;
    case 'spike':
      return 0.9;
    case 'crystal':
      return 1.4;
    default:
      return 1.8;
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

    case 'geyser': {
      const pulse = Math.sin(hazard.pulseOffset) * 0.5 + 0.5;
      const activeHeight = 22 + pulse * 38;

      return {
        x: hazard.x + hazard.width * 0.18,
        y: hazard.y - activeHeight,
        width: hazard.width * 0.64,
        height: hazard.height + activeHeight,
      };
    }

    case 'goo':
      return {
        x: hazard.x + 6,
        y: hazard.y + 3,
        width: Math.max(0, hazard.width - 12),
        height: Math.max(0, hazard.height - 4),
      };

    case 'crystal':
      return {
        x: hazard.x + hazard.width * 0.18,
        y: hazard.y + 2,
        width: hazard.width * 0.64,
        height: hazard.height - 4,
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
