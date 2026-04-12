import { Platform } from '../../../domain/world/platform.model';

const GROUND_TOP_HEIGHT = 9;
const GROUND_FRINGE_DEPTH = 7;
const GROUND_BODY_OFFSET = GROUND_TOP_HEIGHT + GROUND_FRINGE_DEPTH - 3;
const PIT_WALL_WIDTH = 16;

const PLATFORM_TILE_SIZE = 44;
const SPECIAL_TILE_SIZE = 44;
const TILE_RADIUS = 8;

export function drawPlatforms(
  ctx: CanvasRenderingContext2D,
  platforms: Platform[],
): void {
  const activePlatforms = platforms.filter((platform) => platform.active !== false);

  const groundSegments = activePlatforms
    .filter((platform) => isGroundPlatform(platform))
    .sort((a, b) => a.x - b.x);

  for (let index = 0; index < groundSegments.length; index += 1) {
    const current = groundSegments[index];
    const next = groundSegments[index + 1];

    drawGroundSegment(ctx, current);

    if (next && next.x > current.x + current.width) {
      drawPitEdgeWalls(
        ctx,
        current.x + current.width,
        next.x,
        Math.min(current.y, next.y),
      );
    }
  }

  const elevatedPlatforms = activePlatforms
    .filter((platform) => !isGroundPlatform(platform))
    .sort((a, b) => a.y - b.y || a.x - b.x);

  drawGroupedRaisedPlatforms(ctx, elevatedPlatforms);
}

function isGroundPlatform(platform: Platform): boolean {
  if (platform.kind === 'ground') {
    return true;
  }

  return platform.kind === undefined && platform.height >= 70;
}

function drawGroundSegment(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
): void {
  drawGroundTop(ctx, platform);
  drawGroundBody(ctx, platform);
}

function drawGroundTop(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
): void {
  const topY = platform.y;
  const fringeBaseY = topY + GROUND_TOP_HEIGHT;

  ctx.fillStyle = '#63d64f';
  ctx.fillRect(platform.x, topY, platform.width, GROUND_TOP_HEIGHT);

  ctx.fillStyle = 'rgba(231, 255, 210, 0.18)';
  ctx.fillRect(platform.x, topY + 1, platform.width, 1.8);

  ctx.fillStyle = 'rgba(78, 146, 64, 0.22)';
  ctx.fillRect(platform.x, fringeBaseY - 1, platform.width, 2);

  ctx.fillStyle = '#39b63a';
  ctx.beginPath();
  ctx.moveTo(platform.x, fringeBaseY);

  for (let offset = 0; offset <= platform.width; offset += 6) {
    const x = platform.x + offset;
    const drop = getGrassDrop(x);
    ctx.lineTo(x, fringeBaseY + drop);
  }

  ctx.lineTo(platform.x + platform.width, fringeBaseY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(77, 138, 67, 0.30)';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(platform.x, fringeBaseY + 2.7);

  for (let offset = 0; offset <= platform.width; offset += 6) {
    const x = platform.x + offset;
    const drop = getGrassShadowDrop(x);
    ctx.lineTo(x, fringeBaseY + drop);
  }

  ctx.stroke();

  ctx.strokeStyle = 'rgba(173, 232, 136, 0.14)';
  ctx.lineWidth = 0.75;

  for (let x = platform.x + 4; x < platform.x + platform.width - 3; x += 8) {
    const drop = Math.min(GROUND_FRINGE_DEPTH, getGrassDrop(x));

    ctx.beginPath();
    ctx.moveTo(x, fringeBaseY - 0.3);
    ctx.lineTo(x + 0.25, fringeBaseY + drop - 0.45);
    ctx.stroke();
  }
}

function getGrassDrop(x: number): number {
  return (
    1 +
    ((Math.sin((x * 0.22) + 0.8) + 1) * 0.5) * 1.8 +
    ((Math.sin((x * 0.477) + 5.7) + 1) * 0.0) * 0.9
  );
}

function getGrassShadowDrop(x: number): number {
  return (
    2.4 +
    ((Math.sin((x * 0.22) + 0.8) + 1) * 0.5) * 1.5 +
    ((Math.sin((x * 0.47) + 1.7) + 1) * 0.5) * 0.7
  );
}

function drawGroundBody(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
): void {
  const bodyTop = platform.y + GROUND_BODY_OFFSET;
  const bodyHeight = platform.height - GROUND_BODY_OFFSET;

  if (bodyHeight <= 0) {
    return;
  }

  const dirt = ctx.createLinearGradient(0, bodyTop, 0, platform.y + platform.height);
  dirt.addColorStop(0, '#be8854');
  dirt.addColorStop(0.55, '#a26b3d');
  dirt.addColorStop(1, '#784727');

  ctx.fillStyle = dirt;
  ctx.fillRect(platform.x, bodyTop, platform.width, bodyHeight);

  drawSmwGroundBands(ctx, platform.x, platform.width, bodyTop, bodyHeight);

  ctx.strokeStyle = 'rgba(149, 93, 55, 0.42)';
  ctx.lineWidth = 1;
  ctx.strokeRect(
    platform.x + 0.5,
    bodyTop + 0.5,
    platform.width - 1,
    bodyHeight - 1,
  );
}

function drawSmwGroundBands(
  ctx: CanvasRenderingContext2D,
  x: number,
  width: number,
  bodyTop: number,
  bodyHeight: number,
): void {
  const endY = bodyTop + bodyHeight;

  for (let y = bodyTop + 8; y < endY - 5; y += 13) {
    ctx.strokeStyle = 'rgba(149, 93, 55, 0.42)';
    ctx.lineWidth = 2.35;
    ctx.beginPath();

    for (let offset = 0; offset <= width; offset += 7) {
      const px = x + offset;
      const wave = Math.sin((offset * 0.018) + (y * 0.05)) * 0.65;

      if (offset === 0) {
        ctx.moveTo(px, y + wave);
      } else {
        ctx.lineTo(px, y + wave);
      }
    }

    ctx.stroke();

    ctx.strokeStyle = 'rgba(235, 198, 136, 0.12)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();

    for (let offset = 0; offset <= width; offset += 7) {
      const px = x + offset;
      const wave = Math.sin((offset * 0.018) + (y * 0.05) + 0.8) * 0.4;

      if (offset === 0) {
        ctx.moveTo(px, y - 2.5 + wave);
      } else {
        ctx.lineTo(px, y - 2.5 + wave);
      }
    }

    ctx.stroke();
  }

  for (let py = bodyTop + 7; py < endY - 6; py += 11) {
    for (let px = x + 8; px < x + width - 6; px += 12) {
      ctx.fillStyle = 'rgba(236, 207, 149, 0.15)';
      ctx.fillRect(px, py, 2, 2);

      ctx.fillStyle = 'rgba(131, 81, 47, 0.08)';
      ctx.fillRect(px + 1, py + 3, 1, 1);
    }
  }
}

function drawPitEdgeWalls(
  ctx: CanvasRenderingContext2D,
  startX: number,
  endX: number,
  groundY: number,
): void {
  drawPitWall(ctx, startX - PIT_WALL_WIDTH - 1, groundY, PIT_WALL_WIDTH + 1);
  drawPitWall(ctx, endX, groundY, PIT_WALL_WIDTH + 1);
}

function drawPitWall(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  width: number,
): void {
  const topY = groundY;
  const fringeBaseY = topY + GROUND_TOP_HEIGHT;
  const bodyTop = topY + GROUND_BODY_OFFSET;
  const bodyHeight = 92;

  ctx.fillStyle = '#63d64f';
  ctx.fillRect(x, topY, width, GROUND_TOP_HEIGHT);

  ctx.fillStyle = 'rgba(231, 255, 210, 0.18)';
  ctx.fillRect(x, topY + 1, width, 1.8);

  ctx.fillStyle = 'rgba(78, 146, 64, 0.22)';
  ctx.fillRect(x, fringeBaseY - 1, width, 2);

  ctx.fillStyle = '#39b63a';
  ctx.beginPath();
  ctx.moveTo(x, fringeBaseY);

  for (let offset = 0; offset <= width; offset += 4) {
    const px = x + offset;
    ctx.lineTo(px, fringeBaseY + getGrassDrop(px));
  }

  ctx.lineTo(x + width, fringeBaseY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(77, 138, 67, 0.30)';
  ctx.lineWidth = 0.85;
  ctx.beginPath();
  ctx.moveTo(x, fringeBaseY + 2.7);

  for (let offset = 0; offset <= width; offset += 4) {
    const px = x + offset;
    ctx.lineTo(px, fringeBaseY + getGrassShadowDrop(px));
  }

  ctx.stroke();

  const dirt = ctx.createLinearGradient(0, bodyTop, 0, bodyTop + bodyHeight);
  dirt.addColorStop(0, '#be8854');
  dirt.addColorStop(0.55, '#a26b3d');
  dirt.addColorStop(1, '#784727');

  ctx.fillStyle = dirt;
  ctx.fillRect(x, bodyTop, width, bodyHeight);

  drawSmwGroundBands(ctx, x, width, bodyTop, bodyHeight);
}

function drawGroupedRaisedPlatforms(
  ctx: CanvasRenderingContext2D,
  platforms: Platform[],
): void {
  const groups: Platform[][] = [];
  const sorted = [...platforms].sort((a, b) => a.y - b.y || a.x - b.x);

  for (const platform of sorted) {
    const lastGroup = groups[groups.length - 1];
    const canJoin =
      lastGroup &&
      Math.abs(lastGroup[0].y - platform.y) <= 4 &&
      platform.x <= lastGroup[lastGroup.length - 1].x + lastGroup[lastGroup.length - 1].width + 2 &&
      sameRaisedFamily(lastGroup[0], platform);

    if (canJoin) {
      lastGroup.push(platform);
    } else {
      groups.push([platform]);
    }
  }

  for (const group of groups) {
    drawRaisedPlatformGroup(ctx, group);
  }
}

function sameRaisedFamily(a: Platform, b: Platform): boolean {
  return (a.kind ?? 'classicPlatform') === (b.kind ?? 'classicPlatform');
}

function drawRaisedPlatformGroup(
  ctx: CanvasRenderingContext2D,
  group: Platform[],
): void {
  const first = group[0];
  const kind = first.kind ?? 'classicPlatform';

  for (let index = 0; index < group.length; index += 1) {
    const block = group[index];
    const isLeft = index === 0;
    const isRight = index === group.length - 1;

    if (kind === 'movingPlatform') {
      drawMovingPlatform(ctx, block, isLeft, isRight);
      continue;
    }

    if (kind === 'fallBridge') {
      drawBridgeBlock(ctx, block, isLeft, isRight);
      continue;
    }

    if (kind === 'stone') {
      drawStoneBlock(ctx, block, isLeft, isRight);
      continue;
    }

    drawBrickPlatform(ctx, block, isLeft, isRight);
  }
}

function drawStoneBlock(
  ctx: CanvasRenderingContext2D,
  block: Platform,
  isLeft: boolean,
  isRight: boolean,
): void {
  drawBlockPlatform(ctx, block, isLeft, isRight, {
    light: '#d2ad82',
    base: '#b28758',
    dark: '#84603c',
    seam: 'rgba(115, 83, 52, 0.42)',
    shine: '#f0dcc3',
  });
}

function drawBrickPlatform(
  ctx: CanvasRenderingContext2D,
  block: Platform,
  isLeft: boolean,
  isRight: boolean,
): void {
  drawBlockPlatform(ctx, block, isLeft, isRight, {
    light: '#d98945',
    base: '#be6a31',
    dark: '#8f471f',
    seam: 'rgba(118, 58, 28, 0.42)',
    shine: '#ffd0a2',
  });
}

function drawMovingPlatform(
  ctx: CanvasRenderingContext2D,
  block: Platform,
  isLeft: boolean,
  isRight: boolean,
): void {
  const fill = ctx.createLinearGradient(0, block.y, 0, block.y + block.height);
  fill.addColorStop(0, '#c7b26e');
  fill.addColorStop(1, '#7e6738');

  ctx.fillStyle = fill;
  roundedJoinedRect(ctx, block.x, block.y, block.width, block.height, isLeft, isRight, 10);
  ctx.fill();

  ctx.strokeStyle = 'rgba(71, 53, 28, 0.55)';
  ctx.lineWidth = 1.2;
  roundedJoinedRect(
    ctx,
    block.x + 0.7,
    block.y + 0.7,
    block.width - 1.4,
    block.height - 1.4,
    isLeft,
    isRight,
    9,
  );
  ctx.stroke();

  ctx.fillStyle = '#5b4021';
  for (let x = block.x + 12; x <= block.x + block.width - 12; x += 18) {
    ctx.fillRect(x - 2, block.y + 6, 4, block.height - 12);
  }
}

function drawBridgeBlock(
  ctx: CanvasRenderingContext2D,
  block: Platform,
  isLeft: boolean,
  isRight: boolean,
): void {
  ctx.fillStyle = '#b98a52';
  roundedJoinedRect(ctx, block.x, block.y, block.width, block.height, isLeft, isRight, 8);
  ctx.fill();

  ctx.strokeStyle = 'rgba(94, 60, 31, 0.55)';
  ctx.lineWidth = 1.1;
  roundedJoinedRect(
    ctx,
    block.x + 0.6,
    block.y + 0.6,
    block.width - 1.2,
    block.height - 1.2,
    isLeft,
    isRight,
    7,
  );
  ctx.stroke();

  ctx.strokeStyle = '#7b522c';
  for (let x = block.x + 10; x < block.x + block.width - 6; x += 12) {
    ctx.beginPath();
    ctx.moveTo(x, block.y + 4);
    ctx.lineTo(x + 8, block.y + block.height - 4);
    ctx.stroke();
  }
}

function drawBlockPlatform(
  ctx: CanvasRenderingContext2D,
  block: Platform,
  isLeft: boolean,
  isRight: boolean,
  palette: {
    light: string;
    base: string;
    dark: string;
    seam: string;
    shine: string;
  },
): void {
  roundedJoinedRect(ctx, block.x, block.y, block.width, block.height, isLeft, isRight, TILE_RADIUS);
  ctx.save();
  ctx.clip();

  const fill = ctx.createLinearGradient(0, block.y, 0, block.y + block.height);
  fill.addColorStop(0, palette.light);
  fill.addColorStop(0.42, palette.base);
  fill.addColorStop(1, palette.dark);

  ctx.fillStyle = fill;
  ctx.fillRect(block.x, block.y, block.width, block.height);

  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  roundRect(ctx, block.x + 4, block.y + 4, Math.max(0, block.width - 8), 4, 2);
  ctx.fill();

  ctx.fillStyle = palette.shine;
  roundRect(
    ctx,
    block.x + 8,
    block.y + Math.max(10, Math.floor(block.height * 0.40)),
    Math.max(0, block.width - 20),
    3,
    2,
  );
  ctx.fill();

  drawInternalBlockSeams(ctx, block, palette.seam);

  const specialTile = getEmbeddedSpecialTile(block);
  if (specialTile) {
    if (block.used) {
      drawSpecialTileUsed(ctx, specialTile.x, specialTile.y, specialTile.width, specialTile.height, palette);
    } else {
      drawSpecialTile(ctx, specialTile.x, specialTile.y, specialTile.width, specialTile.height);
    }
  }

  ctx.restore();

  ctx.strokeStyle = 'rgba(103, 58, 30, 0.22)';
  ctx.lineWidth = 1;
  roundedJoinedRect(
    ctx,
    block.x + 0.7,
    block.y + 0.7,
    block.width - 1.4,
    block.height - 1.4,
    isLeft,
    isRight,
    TILE_RADIUS,
  );
  ctx.stroke();
}

function drawInternalBlockSeams(
  ctx: CanvasRenderingContext2D,
  block: Platform,
  seamColor: string,
): void {
  ctx.strokeStyle = seamColor;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.9;

  for (let x = block.x + PLATFORM_TILE_SIZE; x < block.x + block.width - 1; x += PLATFORM_TILE_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, block.y + 3);
    ctx.lineTo(x, block.y + block.height - 3);
    ctx.stroke();
  }

  for (let y = block.y + PLATFORM_TILE_SIZE; y < block.y + block.height - 1; y += PLATFORM_TILE_SIZE) {
    ctx.beginPath();
    ctx.moveTo(block.x + 3, y);
    ctx.lineTo(block.x + block.width - 3, y);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

function drawSpecialTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const fill = ctx.createLinearGradient(0, y, 0, y + height);
  fill.addColorStop(0, '#ffe36d');
  fill.addColorStop(0.48, '#f7bf30');
  fill.addColorStop(1, '#d9890e');

  ctx.fillStyle = fill;
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = 'rgba(145, 91, 13, 0.36)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, Math.max(0, width - 1), Math.max(0, height - 1));

  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(x + 3, y + 3, Math.max(0, width - 6), 3);

  ctx.fillStyle = '#fff4b5';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', x + width / 2, y + height / 2);

  ctx.fillRect(x + width / 2 - 3, y + height - 9, 6, 6);
}

function drawSpecialTileUsed(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  palette: {
    light: string;
    base: string;
    dark: string;
    seam: string;
    shine: string;
  },
): void {
  const fill = ctx.createLinearGradient(0, y, 0, y + height);
  fill.addColorStop(0, palette.light);
  fill.addColorStop(0.42, palette.base);
  fill.addColorStop(1, palette.dark);

  ctx.fillStyle = fill;
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = palette.seam;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, Math.max(0, width - 1), Math.max(0, height - 1));

  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(x + 3, y + 3, Math.max(0, width - 6), 3);

  ctx.strokeStyle = 'rgba(255, 242, 204, 0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 10);
  ctx.lineTo(x + width - 10, y + height - 10);
  ctx.moveTo(x + width - 10, y + 10);
  ctx.lineTo(x + 10, y + height - 10);
  ctx.stroke();
}

function getEmbeddedSpecialTile(
  platform: Platform,
): { x: number; y: number; width: number; height: number } | null {
  const canHaveEmbeddedSpecialTile =
    platform.turnsIntoReward === true &&
    platform.rewardType === 'bigCoin10' &&
    platform.kind !== 'movingPlatform' &&
    platform.kind !== 'fallBridge';

  if (!canHaveEmbeddedSpecialTile) {
    return null;
  }

  const cols = Math.max(1, Math.ceil(platform.width / PLATFORM_TILE_SIZE));
  const rows = Math.max(1, Math.ceil(platform.height / PLATFORM_TILE_SIZE));
  const specialCol = Math.floor((cols - 1) / 2);
  const specialRow = Math.floor((rows - 1) / 2);

  const x = platform.x + (specialCol * PLATFORM_TILE_SIZE);
  const y = platform.y + (specialRow * PLATFORM_TILE_SIZE);

  return {
    x,
    y,
    width: Math.min(PLATFORM_TILE_SIZE, platform.x + platform.width - x),
    height: Math.min(PLATFORM_TILE_SIZE, platform.y + platform.height - y),
  };
}

function roundedJoinedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isLeft: boolean,
  isRight: boolean,
  radius: number,
): void {
  const rLeft = isLeft ? radius : 0;
  const rRight = isRight ? radius : 0;

  ctx.beginPath();
  ctx.moveTo(x + rLeft, y);
  ctx.lineTo(x + width - rRight, y);

  if (rRight > 0) {
    ctx.quadraticCurveTo(x + width, y, x + width, y + rRight);
  } else {
    ctx.lineTo(x + width, y);
  }

  ctx.lineTo(x + width, y + height - rRight);

  if (rRight > 0) {
    ctx.quadraticCurveTo(x + width, y + height, x + width - rRight, y + height);
  } else {
    ctx.lineTo(x + width, y + height);
  }

  ctx.lineTo(x + rLeft, y + height);

  if (rLeft > 0) {
    ctx.quadraticCurveTo(x, y + height, x, y + height - rLeft);
  } else {
    ctx.lineTo(x, y + height);
  }

  ctx.lineTo(x, y + rLeft);

  if (rLeft > 0) {
    ctx.quadraticCurveTo(x, y, x + rLeft, y);
  } else {
    ctx.lineTo(x, y);
  }

  ctx.closePath();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
