import { Hero } from '../../domain/hero/hero.model';

export function calculateCameraX(
  hero: Hero,
  canvasWidth: number,
  worldWidth: number,
): number {
  /**
   * Mantém a câmera estável e sem "snap" no início.
   * O herói fica um pouco mais à esquerda da tela,
   * mostrando mais caminho à frente sem troca brusca
   * de offset nos primeiros frames.
   */
  const heroScreenAnchor = canvasWidth * 0.38;
  const target = hero.x - heroScreenAnchor + hero.width / 2;

  return Math.max(
    0,
    Math.min(target, worldWidth - canvasWidth),
  );
}
