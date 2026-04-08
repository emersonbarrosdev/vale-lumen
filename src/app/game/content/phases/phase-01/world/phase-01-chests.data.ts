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
     * removido do chão e levado para plataforma do primeiro trecho alto
     */
    { x: 2012, y: 390, width: 40, height: 28, rare: false },

    /**
     * TRECHO DAS PLATAFORMAS QUE CAEM
     * mantido como recompensa de risco
     */
    { x: 5376, y: 374, width: 40, height: 28, rare: true },

    /**
     * SEGUNDA METADE
     * removido do chão e levado para plataforma média acessível
     */
    { x: 7664, y: 396, width: 40, height: 28, rare: false },

    /**
     * PLATAFORMA ALTA DE RECOMPENSA
     * mantido em ponto elevado
     */
    { x: 8308, y: 248, width: 40, height: 28, rare: true },

    /**
     * TRECHO FINAL INTERMEDIÁRIO
     * removido do chão e levado para plataforma média antes da alta final
     */
    { x: 10946, y: 410, width: 40, height: 28, rare: false },

    /**
     * PLATAFORMA ALTA FINAL
     * mantido no ponto alto como grande recompensa
     */
    { x: 11336, y: 216, width: 42, height: 30, rare: true },
  ];
}
