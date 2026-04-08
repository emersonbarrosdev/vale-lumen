import { PlatformData } from '../../../../domain/world/platform.model';

export const PHASE_01_WORLD_WIDTH = 12800;
export const PHASE_01_GROUND_Y = 620;

/**
 * Ajuste estrutural da fase 1:
 * - mantém os trechos já corrigidos
 * - cria subida mais legível para plataformas altas
 * - elimina sensação de "entrada quebrada" no boss
 * - garante chão contínuo e seguro na pré-arena
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
     */
    { x: 3160, y: 620, width: 980, height: 100 },

    /**
     * TRECHO LINEAR
     * suavizado para não deixar salto seco demais
     */
    { x: 4260, y: 620, width: 800, height: 100 },

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
     * agora com apoio intermediário de subida
     */
    { x: 7860, y: 452, width: 150, height: 22 },
    { x: 8120, y: 276, width: 280, height: 24 },

    /**
     * SEGUNDO BURACO
     * agora com apoio intermediário claro
     */
    { x: 9050, y: 448, width: 180, height: 22 },
    { x: 9280, y: 620, width: 1280, height: 100 },
    { x: 9740, y: 432, width: 180, height: 22 },

    /**
     * TRECHO FINAL
     * suavizado e com progressão de subida
     */
    { x: 10800, y: 620, width: 960, height: 100 },
    { x: 10940, y: 438, width: 150, height: 22 },
    { x: 11110, y: 246, width: 340, height: 24 },

    /**
     * PRÉ-BOSS
     * agora é um chão contínuo, sem qualquer buraco visual ou lógico
     * até a entrada efetiva da arena.
     */
    { x: 11820, y: 620, width: 980, height: 100 },
  ];
}
