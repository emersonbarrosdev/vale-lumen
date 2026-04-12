import { PlatformData } from '../../../../domain/world/platform.model';

export const PHASE_01_WORLD_WIDTH = 12800;
export const PHASE_01_GROUND_Y = 620;

export function getPhase01Platforms(): PlatformData[] {
  return [
    { x: 0, y: 620, width: 1500, height: 100 },

    {
      x: 320,
      y: 440,
      width: 176,
      height: 44,
      turnsIntoReward: true,
      rewardType: 'bigCoin10',
    },

    { x: 1760, y: 620, width: 1280, height: 100 },

    {
      x: 1990,
      y: 408,
      width: 176,
      height: 44,
      turnsIntoReward: true,
      rewardType: 'bigCoin10',
    },
    {
      x: 2330,
      y: 270,
      width: 264,
      height: 44,
    },

    { x: 3160, y: 620, width: 980, height: 100 },

    { x: 4260, y: 620, width: 800, height: 100 },

    { x: 5800, y: 620, width: 1120, height: 100 },

    { x: 5130, y: 420, width: 128, height: 20, fallAway: true, fallDelay: 0.62, fallSpeed: 145 },
    { x: 5294, y: 420, width: 128, height: 20, fallAway: true, fallDelay: 0.62, fallSpeed: 145 },
    { x: 5458, y: 420, width: 128, height: 20, fallAway: true, fallDelay: 0.62, fallSpeed: 145 },
    { x: 5622, y: 420, width: 128, height: 20, fallAway: true, fallDelay: 0.62, fallSpeed: 145 },

    { x: 7180, y: 620, width: 1720, height: 100 },

    {
      x: 7650,
      y: 414,
      width: 176,
      height: 44,
      turnsIntoReward: true,
      rewardType: 'bigCoin10',
    },

    {
      x: 7860,
      y: 442,
      width: 176,
      height: 44,
    },
    {
      x: 8120,
      y: 258,
      width: 308,
      height: 44,
      turnsIntoReward: true,
      rewardType: 'bigCoin10',
    },

    {
      x: 8960,
      y: 620,
      width: 180,
      height: 20,
      kind: 'movingPlatform',
      moveAxis: 'x',
      moveRange: 260,
      moveSpeed: 92,
      startMovingRight: true,
    },

    { x: 9400, y: 620, width: 3400, height: 100 },

    {
      x: 9740,
      y: 422,
      width: 220,
      height: 44,
      turnsIntoReward: true,
      rewardType: 'bigCoin10',
    },
    {
      x: 10940,
      y: 428,
      width: 176,
      height: 44,
    },
    {
      x: 11110,
      y: 228,
      width: 352,
      height: 44,
      turnsIntoReward: true,
      rewardType: 'bigCoin10',
    },
  ];
}
