import { PlatformData } from '../../../../domain/world/platform.model';

export const PHASE_01_WORLD_WIDTH = 6400;
export const PHASE_01_GROUND_Y = 620;

export function getPhase01Platforms(): PlatformData[] {
  return [
    { x: 0, y: 620, width: 380, height: 100 },
    { x: 560, y: 620, width: 320, height: 100 },
    { x: 1060, y: 600, width: 360, height: 120 },
    { x: 1610, y: 620, width: 320, height: 100 },
    { x: 2160, y: 620, width: 340, height: 100 },
    { x: 2720, y: 588, width: 380, height: 132 },
    { x: 3290, y: 620, width: 330, height: 100 },
    { x: 3830, y: 598, width: 360, height: 122 },
    { x: 4380, y: 620, width: 340, height: 100 },
    { x: 4910, y: 620, width: 320, height: 100 },
    { x: 5230, y: 620, width: 1170, height: 100 },

    { x: 170, y: 528, width: 120, height: 24 },
    { x: 640, y: 528, width: 130, height: 24 },
    { x: 1140, y: 500, width: 138, height: 24 },
    { x: 1710, y: 528, width: 126, height: 24 },
    { x: 2250, y: 510, width: 132, height: 24 },
    { x: 2810, y: 484, width: 134, height: 24 },
    { x: 3380, y: 528, width: 130, height: 24 },
    { x: 3920, y: 500, width: 136, height: 24 },
    { x: 4470, y: 514, width: 124, height: 24 },

    { x: 1210, y: 360, width: 112, height: 24 },
    { x: 2340, y: 330, width: 124, height: 24 },
    { x: 2890, y: 300, width: 124, height: 24 },
    { x: 4010, y: 324, width: 126, height: 24 },

    { x: 900, y: 486, width: 92, height: 20 },
    { x: 2035, y: 468, width: 94, height: 20 },
    { x: 3685, y: 462, width: 94, height: 20 },

    { x: 1260, y: 228, width: 104, height: 22 },
    { x: 2940, y: 196, width: 108, height: 22 },
    { x: 4060, y: 212, width: 108, height: 22 },
  ];
}
