import { TunnelData } from '../../../../domain/world/phase-playable-data.model';

export function getPhase01Tunnels(): TunnelData[] {
  return [
    {
      x: 2140,
      width: 220,
      ceilingY: 404,
      thickness: 22,
    },
    {
      x: 4445,
      width: 210,
      ceilingY: 428,
      thickness: 22,
    },
  ];
}
