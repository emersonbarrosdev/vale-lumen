import { ChestData } from '../../../../domain/world/chest.model';

export function getPhase01Chests(): ChestData[] {
  return [
    { x: 1280, y: 200, width: 38, height: 28, rare: false },
    { x: 2978, y: 168, width: 40, height: 28, rare: false },
    { x: 4092, y: 184, width: 42, height: 30, rare: true },
  ];
}
