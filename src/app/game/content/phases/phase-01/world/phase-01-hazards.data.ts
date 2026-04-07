import { HazardData } from '../../../../domain/world/phase-playable-data.model';

export function getPhase01Hazards(): HazardData[] {
  return [
    /**
     * Bloco 1 - gosma expelindo entre trechos
     */
    { type: 'goo', x: 540, y: 642, width: 120, height: 26, damage: 20 },

    /**
     * Bloco 2
     */
    { type: 'goo', x: 1090, y: 642, width: 130, height: 28, damage: 22 },
    { type: 'spike', x: 1688, y: 594, width: 72, height: 18, damage: 24 },

    /**
     * Bloco 3
     */
    { type: 'goo', x: 2310, y: 642, width: 130, height: 28, damage: 22 },

    /**
     * Bloco 4 - túnel com perigo no chão
     */
    { type: 'geyser', x: 2925, y: 610, width: 44, height: 32, damage: 26 },

    /**
     * Bloco 5
     */
    { type: 'goo', x: 3565, y: 642, width: 140, height: 28, damage: 24 },

    /**
     * Bloco 6
     */
    { type: 'crystal', x: 4218, y: 530, width: 70, height: 80, damage: 24 },

    /**
     * Bloco 7 - travessia
     */
    { type: 'spike', x: 4818, y: 614, width: 64, height: 16, damage: 24 },
    { type: 'spike', x: 5044, y: 516, width: 52, height: 16, damage: 24 },
    { type: 'spike', x: 5248, y: 452, width: 58, height: 16, damage: 24 },

    /**
     * Bloco 8
     */
    { type: 'goo', x: 6050, y: 642, width: 140, height: 28, damage: 24 },

    /**
     * Bloco 9 - trecho mais limpo com buraco vazio, sem hazard extra
     */

    /**
     * Bloco 10
     */
    { type: 'geyser', x: 7315, y: 610, width: 46, height: 32, damage: 28 },
    { type: 'crystal', x: 7260, y: 528, width: 68, height: 82, damage: 24 },

    /**
     * Bloco 11
     */
    { type: 'spike', x: 7830, y: 614, width: 64, height: 16, damage: 24 },
    { type: 'spike', x: 8038, y: 516, width: 56, height: 16, damage: 24 },

    /**
     * Bloco 12
     */
    { type: 'goo', x: 9068, y: 642, width: 138, height: 28, damage: 24 },

    /**
     * Bloco 13
     */
    { type: 'spike', x: 9592, y: 614, width: 62, height: 16, damage: 24 },

    /**
     * Bloco 14
     */
    { type: 'crystal', x: 10298, y: 566, width: 68, height: 54, damage: 24 },

    /**
     * Bloco 15
     */
    { type: 'goo', x: 10855, y: 642, width: 140, height: 28, damage: 26 },

    /**
     * Bloco 16
     */
    { type: 'geyser', x: 11448, y: 610, width: 46, height: 32, damage: 28 },

    /**
     * Pré-boss sem poluir muito
     */
    { type: 'spike', x: 11910, y: 614, width: 72, height: 16, damage: 26 },
  ];
}
