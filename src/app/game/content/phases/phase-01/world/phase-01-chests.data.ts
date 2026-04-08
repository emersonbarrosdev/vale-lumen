import { ChestData } from '../../../../domain/world/chest.model';

export function getPhase01Chests(): ChestData[] {
  return [
    /**
     * TRECHO 1
     * antes estava flutuando perto do primeiro grande vão.
     * agora fica apoiado na plataforma alta do trecho 1.
     */
    { x: 2420, y: 256, width: 38, height: 28, rare: false },

    /**
     * TÚNEL / TRECHO CENTRAL
     * antes estava em uma altura sem apoio real.
     * agora fica no chão firme, visível e alcançável.
     */
    { x: 3940, y: 592, width: 40, height: 28, rare: false },

    /**
     * TRECHO DAS PLATAFORMAS QUE CAEM
     * mantido como recompensa de risco.
     */
    { x: 5376, y: 374, width: 40, height: 28, rare: true },

    /**
     * SEGUNDA METADE
     * antes estava praticamente no vazio entre trechos.
     * agora fica sobre a plataforma média da segunda metade.
     */
    { x: 7666, y: 396, width: 40, height: 28, rare: false },

    /**
     * PLATAFORMA ALTA DE RECOMPENSA
     * antes estava abaixo da plataforma alta.
     * agora fica assentado sobre ela.
     */
    { x: 8306, y: 246, width: 40, height: 28, rare: true },

    /**
     * SEGUNDO TRECHO APÓS BURACO
     * antes estava em altura sem apoio correspondente.
     * agora fica sobre a plataforma intermediária do trecho.
     */
    { x: 9804, y: 404, width: 40, height: 28, rare: false },

    /**
     * TRECHO FINAL
     * antes estava "flutuando" muito abaixo da plataforma alta final.
     * agora fica corretamente apoiado nela.
     */
    { x: 11334, y: 216, width: 42, height: 30, rare: true },
  ];
}
