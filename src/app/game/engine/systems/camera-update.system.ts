import { Hero } from '../../domain/hero/hero.model';

export function calculateCameraX(
  hero: Hero,
  canvasWidth: number,
  worldWidth: number,
): number {
  const target = hero.x - canvasWidth / 2 + hero.width / 2;

  return Math.max(
    0,
    Math.min(target, worldWidth - canvasWidth),
  );
}
