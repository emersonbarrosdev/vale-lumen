export interface RectLike {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function rectsOverlap(a: RectLike, b: RectLike): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function circleRectOverlap(
  cx: number,
  cy: number,
  radius: number,
  rect: RectLike,
): boolean {
  const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));
  const dx = cx - closestX;
  const dy = cy - closestY;

  return dx * dx + dy * dy <= radius * radius;
}
