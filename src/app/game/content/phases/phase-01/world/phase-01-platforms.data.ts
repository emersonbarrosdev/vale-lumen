import { PlatformData } from '../../../../domain/world/platform.model';

export const PHASE_01_WORLD_WIDTH = 12800;
export const PHASE_01_GROUND_Y = 620;

/**
 * Ajuste fino final:
 * - menos plataformas "suspeitas"
 * - nada de plataforma baixa demais
 * - menos chance de salto ruim
 * - mais leitura visual limpa
 */
export function getPhase01Platforms(): PlatformData[] {
  return [
    /**
     * INÍCIO
     */
    { x: 0, y: 620, width: 1500, height: 100 },
    { x: 320, y: 448, width: 160, height: 22 },

    /**
     * TRECHO 1
     */
    { x: 1760, y: 620, width: 1280, height: 100 },
    { x: 1990, y: 418, width: 160, height: 22 },
    { x: 2330, y: 286, width: 220, height: 22 },

    /**
     * TÚNEL
     * removidas plataformas próximas da zona visual problemática
     */
    { x: 3160, y: 620, width: 980, height: 100 },

    /**
     * TRECHO LINEAR
     */
    { x: 4300, y: 620, width: 760, height: 100 },

    /**
     * TRECHO ESPECIAL COM BURACO E PLATAFORMAS QUE CAEM
     */
    { x: 5800, y: 620, width: 1120, height: 100 },

    { x: 5130, y: 420, width: 128, height: 20, fallAway: true, fallDelay: 0.34, fallSpeed: 360 },
    { x: 5294, y: 420, width: 128, height: 20, fallAway: true, fallDelay: 0.34, fallSpeed: 360 },
    { x: 5458, y: 420, width: 128, height: 20, fallAway: true, fallDelay: 0.34, fallSpeed: 360 },
    { x: 5622, y: 420, width: 128, height: 20, fallAway: true, fallDelay: 0.34, fallSpeed: 360 },

    /**
     * TRECHO LINEAR GRANDE
     */
    { x: 7180, y: 620, width: 1720, height: 100 },
    { x: 7650, y: 424, width: 170, height: 22 },

    /**
     * PLATAFORMA ALTA DE RECOMPENSA
     */
    { x: 8120, y: 276, width: 280, height: 24 },

    /**
     * SEGUNDO BURACO
     */
    { x: 9300, y: 620, width: 1260, height: 100 },
    { x: 9740, y: 432, width: 180, height: 22 },

    /**
     * TRECHO FINAL
     */
    { x: 10840, y: 620, width: 920, height: 100 },
    { x: 11110, y: 246, width: 340, height: 24 },

    /**
     * PRÉ-BOSS
     */
    { x: 12010, y: 620, width: 790, height: 100 },
  ];
}
