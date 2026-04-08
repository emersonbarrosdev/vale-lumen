import { HazardData } from '../../../../domain/world/phase-playable-data.model';

export function getPhase01Hazards(): HazardData[] {
  return [
    /**
     * BURACO 1
     * Gap entre:
     * chão 1500..1760
     */
    { type: 'goo', x: 1500, y: 628, width: 260, height: 92, damage: 20 },

    /**
     * BURACO 2
     * vazio
     */

    /**
     * BURACO 3
     * vazio
     */

    /**
     * TRECHO ESPECIAL
     * espinho cobrindo o fundo inteiro do vão
     */
    { type: 'spike', x: 5060, y: 606, width: 740, height: 22, damage: 28 },

    /**
     * TRECHO LINEAR GRANDE
     * perigo em chão firme
     */
    { type: 'crystal', x: 7440, y: 534, width: 68, height: 86, damage: 24 },

    /**
     * SEGUNDO BURACO
     * mantém a leitura do perigo verde no fundo do vão,
     * agora alinhado ao apoio intermediário
     */
    { type: 'geyser', x: 9138, y: 610, width: 50, height: 32, damage: 28 },

    /**
     * TRECHO FINAL
     */
    { type: 'spike', x: 10942, y: 606, width: 84, height: 18, damage: 24 },

    /**
     * PRÉ-BOSS
     */
    { type: 'spike', x: 11908, y: 606, width: 84, height: 18, damage: 26 },
  ];
}
