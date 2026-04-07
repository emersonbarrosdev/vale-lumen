import { PlatformData } from '../../../../domain/world/platform.model';

export const PHASE_01_WORLD_WIDTH = 12800;
export const PHASE_01_GROUND_Y = 620;

export function getPhase01Platforms(): PlatformData[] {
  return [
    /**
     * Trecho inicial
     * chão mais estável para começar e já dar espaço para retorno depois
     */
    { x: 0, y: 620, width: 520, height: 100 },

    /**
     * Bloco 1
     */
    { x: 720, y: 620, width: 340, height: 100 },
    { x: 820, y: 494, width: 120, height: 22 },
    { x: 980, y: 430, width: 104, height: 20 },

    /**
     * Bloco 2
     */
    { x: 1260, y: 612, width: 420, height: 108 },
    { x: 1365, y: 500, width: 132, height: 22 },
    { x: 1545, y: 444, width: 112, height: 20 },
    { x: 1460, y: 336, width: 104, height: 20 },

    /**
     * Bloco 3
     */
    { x: 1920, y: 620, width: 360, height: 100 },
    { x: 2035, y: 500, width: 126, height: 22 },

    /**
     * Bloco 4 - trecho de túnel baixo estilo Metroid
     * chão sobe um pouco e há plataformas para guiar
     */
    { x: 2480, y: 604, width: 430, height: 116 },
    { x: 2595, y: 520, width: 128, height: 22 },
    { x: 2760, y: 468, width: 110, height: 20 },

    /**
     * Bloco 5
     */
    { x: 3180, y: 620, width: 360, height: 100 },
    { x: 3290, y: 502, width: 132, height: 22 },
    { x: 3460, y: 430, width: 112, height: 20 },

    /**
     * Bloco 6
     */
    { x: 3780, y: 610, width: 420, height: 110 },
    { x: 3895, y: 494, width: 136, height: 22 },
    { x: 4055, y: 434, width: 112, height: 20 },
    { x: 3940, y: 332, width: 104, height: 20 },

    /**
     * Bloco 7 - espaço maior com travessia por plataformas
     */
    { x: 4480, y: 620, width: 320, height: 100 },
    { x: 4910, y: 532, width: 110, height: 20 },
    { x: 5110, y: 468, width: 116, height: 20 },
    { x: 5315, y: 404, width: 124, height: 20 },

    /**
     * Bloco 8
     */
    { x: 5600, y: 612, width: 420, height: 108 },
    { x: 5715, y: 500, width: 132, height: 22 },
    { x: 5895, y: 440, width: 112, height: 20 },

    /**
     * Bloco 9 - novo trecho com túnel curto
     */
    { x: 6250, y: 620, width: 380, height: 100 },
    { x: 6360, y: 514, width: 126, height: 22 },

    /**
     * Bloco 10
     */
    { x: 6840, y: 606, width: 450, height: 114 },
    { x: 6970, y: 498, width: 136, height: 22 },
    { x: 7140, y: 438, width: 112, height: 20 },
    { x: 7020, y: 326, width: 102, height: 20 },

    /**
     * Bloco 11 - travessia com plataformas entre os vãos
     */
    { x: 7520, y: 620, width: 300, height: 100 },
    { x: 7930, y: 534, width: 110, height: 20 },
    { x: 8120, y: 470, width: 116, height: 20 },
    { x: 8325, y: 412, width: 122, height: 20 },

    /**
     * Bloco 12
     */
    { x: 8610, y: 612, width: 430, height: 108 },
    { x: 8740, y: 498, width: 132, height: 22 },
    { x: 8920, y: 438, width: 112, height: 20 },

    /**
     * Bloco 13
     */
    { x: 9210, y: 620, width: 370, height: 100 },
    { x: 9325, y: 514, width: 126, height: 22 },

    /**
     * Bloco 14 - mais vertical
     */
    { x: 9720, y: 604, width: 440, height: 116 },
    { x: 9840, y: 508, width: 128, height: 22 },
    { x: 10010, y: 444, width: 112, height: 20 },
    { x: 10180, y: 372, width: 108, height: 20 },

    /**
     * Bloco 15
     */
    { x: 10460, y: 620, width: 360, height: 100 },
    { x: 10575, y: 514, width: 126, height: 22 },

    /**
     * Bloco 16
     */
    { x: 10990, y: 612, width: 430, height: 108 },
    { x: 11115, y: 498, width: 132, height: 22 },
    { x: 11295, y: 438, width: 112, height: 20 },

    /**
     * Pré-arena do boss
     */
    { x: 11660, y: 620, width: 340, height: 100 },
    { x: 12010, y: 620, width: 790, height: 100 },
  ];
}
