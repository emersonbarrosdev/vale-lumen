import { PlatformData } from '../../../../domain/world/platform.model';

export const PHASE_01_WORLD_WIDTH = 12800;
export const PHASE_01_GROUND_Y = 620;

export function getPhase01Platforms(): PlatformData[] {
  return [
    /**
     * INÍCIO
     * começo mais linear, estilo Sonic/Mario World
     * espaço para o jogador voltar e pegar a vida escondida
     */
    { x: 0, y: 620, width: 1380, height: 100 },

    /**
     * Pequeno trecho alto para recompensa visual, sem exagero
     */
    { x: 260, y: 500, width: 120, height: 22 },

    /**
     * PRIMEIRO BURACO MÉDIO
     */
    { x: 1600, y: 620, width: 1180, height: 100 },

    /**
     * Algumas plataformas, mas poucas
     */
    { x: 1830, y: 500, width: 130, height: 22 },
    { x: 2140, y: 436, width: 118, height: 20 },

    /**
     * TRECHO DE TÚNEL
     * chão contínuo com teto baixo depois
     */
    { x: 2960, y: 620, width: 920, height: 100 },
    { x: 3260, y: 508, width: 126, height: 22 },

    /**
     * TRECHO LINEAR LONGO
     */
    { x: 4040, y: 620, width: 660, height: 100 },

    /**
     * BURACO GRANDE ~40% DA TELA
     * com plataformas que caem estilo Sonic
     * 1280 * 0.4 = 512px aprox
     */
    { x: 5220, y: 620, width: 1080, height: 100 },

    { x: 4720, y: 486, width: 114, height: 20, fallAway: true, fallDelay: 0.34, fallSpeed: 360 },
    { x: 4895, y: 430, width: 114, height: 20, fallAway: true, fallDelay: 0.34, fallSpeed: 380 },
    { x: 5070, y: 372, width: 114, height: 20, fallAway: true, fallDelay: 0.34, fallSpeed: 400 },

    /**
     * TRECHO LINEAR DE RESPIRO
     */
    { x: 6520, y: 620, width: 1480, height: 100 },

    /**
     * Pouca verticalidade aqui
     */
    { x: 6940, y: 500, width: 132, height: 22 },
    { x: 7320, y: 438, width: 118, height: 20 },

    /**
     * SEGUNDO BURACO MENOR
     */
    { x: 8240, y: 620, width: 980, height: 100 },

    { x: 8480, y: 512, width: 128, height: 22 },

    /**
     * TRECHO MAIS LONGO DE CHÃO
     */
    { x: 9440, y: 620, width: 1560, height: 100 },

    { x: 9860, y: 504, width: 128, height: 22 },
    { x: 10220, y: 436, width: 118, height: 20 },

    /**
     * TRECHO FINAL DE EXPLORAÇÃO
     */
    { x: 11240, y: 620, width: 520, height: 100 },

    { x: 11410, y: 504, width: 126, height: 22 },

    /**
     * PRÉ-BOSS
     */
    { x: 12010, y: 620, width: 790, height: 100 },
  ];
}
