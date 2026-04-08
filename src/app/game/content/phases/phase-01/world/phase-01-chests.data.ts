import { ChestData } from '../../../../domain/world/chest.model';

export function getPhase01Chests(): ChestData[] {
  return [
    /**
     * TRECHO 1
     * baú reposicionado para plataforma alta acessível
     */
    { x: 2408, y: 258, width: 38, height: 28, rare: false },

    /**
     * TRECHO CENTRAL
     * recompensa intermediária cedo na fase
     */
    { x: 2012, y: 390, width: 40, height: 28, rare: false },

    /**
     * TRECHO DAS PLATAFORMAS QUE CAEM
     * risco maior, então continua raro
     */
    { x: 5376, y: 374, width: 40, height: 28, rare: true },

    /**
     * SEGUNDA METADE
     * reforça exploração da rota média
     */
    { x: 7664, y: 396, width: 40, height: 28, rare: false },

    /**
     * PLATAFORMA ALTA DE RECOMPENSA
     * ponto alto da segunda metade
     */
    { x: 8308, y: 248, width: 40, height: 28, rare: true },

    /**
     * TRECHO FINAL INTERMEDIÁRIO
     */
    { x: 10946, y: 410, width: 40, height: 28, rare: false },

    /**
     * PLATAFORMA ALTA FINAL
     * última grande recompensa opcional antes do boss
     */
    { x: 11336, y: 216, width: 42, height: 30, rare: true },
  ];
}
