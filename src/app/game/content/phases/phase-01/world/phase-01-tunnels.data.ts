import { TunnelData } from '../../../../domain/world/phase-playable-data.model';

export function getPhase01Tunnels(): TunnelData[] {
  return [
    /**
     * Túnel 1:
     * trecho curto, teto baixo, deixando um "canal" para o herói passar
     */
    {
      x: 2520,
      width: 330,
      ceilingY: 376,
      thickness: 24,
    },

    /**
     * Túnel 2:
     * mais para frente, estilo passagem comprimida
     */
    {
      x: 6320,
      width: 300,
      ceilingY: 392,
      thickness: 24,
    },

    /**
     * Túnel 3:
     * último túnel curto antes da parte final
     */
    {
      x: 9735,
      width: 340,
      ceilingY: 364,
      thickness: 24,
    },
  ];
}
