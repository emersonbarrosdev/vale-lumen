export interface PlatformData {
  x: number;
  y: number;
  width: number;
  height: number;
  fallAway?: boolean;
  fallDelay?: number;
  fallSpeed?: number;
}

export interface Platform extends PlatformData {
  triggered?: boolean;
  triggerTimer?: number;
  falling?: boolean;
  active?: boolean;
  startY?: number;
}
