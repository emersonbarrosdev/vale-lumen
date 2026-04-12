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

export function pointInCircle(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  radius: number,
): boolean {
  const dx = x - centerX;
  const dy = y - centerY;

  return dx * dx + dy * dy <= radius * radius;
}

export function pointInRect(
  x: number,
  y: number,
  rect: RectLike,
): boolean {
  return (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height
  );
}

export function expandRect(
  rect: RectLike,
  paddingX: number,
  paddingY = paddingX,
): RectLike {
  return {
    x: rect.x - paddingX,
    y: rect.y - paddingY,
    width: rect.width + paddingX * 2,
    height: rect.height + paddingY * 2,
  };
}

export function rectContainsRect(
  outer: RectLike,
  inner: RectLike,
): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}
