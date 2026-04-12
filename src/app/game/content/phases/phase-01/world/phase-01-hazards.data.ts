import { HazardData } from '../../../../domain/world/phase-playable-data.model';

export function getPhase01Hazards(): HazardData[] {
  return [
    /**
     * BURACO 1
     * água ocupando o vão inteiro, sem passar da borda
     */
    { type: 'goo', x: 1500, y: 628, width: 260, height: 92, damage: 20 },

    /**
     * GRANDE BURACO CENTRAL
     * espinhos posicionados no fundo do buraco
     */
    { type: 'spike', x: 5060, y: 694, width: 740, height: 26, damage: 28 },

    /**
     * BURACO APÓS O VÃO PEQUENO
     * alargado e com espinhos no fundo
     */
    { type: 'spike', x: 8900, y: 694, width: 500, height: 26, damage: 28 },

    /**
     * TRECHO LINEAR GRANDE
     */
    { type: 'crystal', x: 7440, y: 534, width: 68, height: 86, damage: 24 },
  ];
}
