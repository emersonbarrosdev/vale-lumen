import { Hero } from '../../domain/hero/hero.model';

export function calculateCameraX(
  hero: Hero,
  canvasWidth: number,
  worldWidth: number,
): number {
  /**
   * Antes a câmera centralizava demais no herói.
   * Agora ela deixa o herói mais para a esquerda da tela,
   * mostrando mais caminho à frente, mas ainda permitindo
   * enxergar um trecho para trás no início da fase.
   */
  const heroScreenAnchor = canvasWidth * 0.38;
  const target = hero.x - heroScreenAnchor + hero.width / 2;

  return Math.max(
    0,
    Math.min(target, worldWidth - canvasWidth),
  );
}
