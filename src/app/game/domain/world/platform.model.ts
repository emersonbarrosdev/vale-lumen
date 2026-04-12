export type PlatformKind =
  | 'ground'
  | 'stone'
  | 'brickBlock'
  | 'breakableBlock'
  | 'questionBlock'
  | 'movingPlatform'
  | 'fallBridge';

export type PlatformRewardType =
  | 'coin'
  | 'coin10'
  | 'bigCoin10'
  | 'lifeFragment'
  | 'specialSpark'
  | 'heart'
  | 'ray'
  | 'flameVial'
  | 'shieldOrb';

export interface PlatformData {
  x: number;
  y: number;
  width: number;
  height: number;
  fallAway?: boolean;
  fallDelay?: number;
  fallSpeed?: number;
  kind?: PlatformKind;
  breakableByShot?: boolean;
  turnsIntoReward?: boolean;
  rewardType?: PlatformRewardType;
  moveBetweenX1?: number;
  moveBetweenX2?: number;
  moveSpeed?: number;
  startMovingRight?: boolean;
  moveAxis?: 'x' | 'y';
  moveRange?: number;
}

export interface Platform extends PlatformData {
  triggered?: boolean;
  triggerTimer?: number;
  falling?: boolean;
  active?: boolean;
  startX?: number;
  startY?: number;
  used?: boolean;
  broken?: boolean;
  movingRight?: boolean;
  moveDirection?: 1 | -1;
}
