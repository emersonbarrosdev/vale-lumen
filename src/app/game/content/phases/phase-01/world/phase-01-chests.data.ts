import { ChestData } from '../../../../domain/world/chest.model';

export function getPhase01Chests(): ChestData[] {
  return [
    /**
     * Início/meio inicial
     */
    { x: 1488, y: 308, width: 38, height: 28, rare: false },

    /**
     * Meio da fase
     */
    { x: 3980, y: 304, width: 40, height: 28, rare: false },
    { x: 5376, y: 374, width: 40, height: 28, rare: true },

    /**
     * Segunda metade
     */
    { x: 7060, y: 298, width: 40, height: 28, rare: false },
    { x: 8392, y: 368, width: 40, height: 28, rare: true },

    /**
     * Final da exploração
     */
    { x: 10226, y: 336, width: 40, height: 28, rare: false },
    { x: 11334, y: 372, width: 42, height: 30, rare: true },
  ];
}
