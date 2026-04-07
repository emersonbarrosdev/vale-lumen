import { Chest } from '../../../domain/world/chest.model';

export function drawChests(
  ctx: CanvasRenderingContext2D,
  chests: Chest[],
): void {
  for (const chest of chests) {
    if (!chest.active && chest.breakTimer <= 0) {
      continue;
    }

    if (!chest.active) {
      drawBrokenRelic(ctx, chest);
      continue;
    }

    drawClosedRelic(ctx, chest);
  }
}

function drawClosedRelic(
  ctx: CanvasRenderingContext2D,
  chest: Chest,
): void {
  const isRare = chest.rare === true;
  const centerX = chest.x + chest.width / 2;
  const centerY = chest.y + chest.height / 2;

  const glowColor = isRare
    ? 'rgba(130, 232, 255, 0.34)'
    : 'rgba(255, 181, 92, 0.22)';

  const crystalColor = isRare ? '#82e8ff' : '#ffb15c';
  const crystalInner = isRare ? '#d6fbff' : '#ffe1a8';
  const frameDark = isRare ? '#1c2430' : '#2b241d';
  const frameMid = isRare ? '#34465d' : '#5a4023';
  const runeColor = isRare ? '#b9f4ff' : '#ffd38f';

  const glow = ctx.createRadialGradient(
    centerX,
    centerY,
    1,
    centerX,
    centerY,
    chest.width * 1.25,
  );
  glow.addColorStop(0, glowColor);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, chest.width * 1.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = frameDark;
  ctx.beginPath();
  ctx.moveTo(chest.x + 3, chest.y + chest.height);
  ctx.lineTo(chest.x + chest.width - 3, chest.y + chest.height);
  ctx.lineTo(chest.x + chest.width - 8, chest.y + chest.height - 7);
  ctx.lineTo(chest.x + 8, chest.y + chest.height - 7);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = frameMid;
  ctx.beginPath();
  ctx.moveTo(centerX, chest.y);
  ctx.lineTo(chest.x + chest.width - 3, chest.y + chest.height * 0.28);
  ctx.lineTo(chest.x + chest.width - 6, chest.y + chest.height * 0.8);
  ctx.lineTo(centerX, chest.y + chest.height);
  ctx.lineTo(chest.x + 6, chest.y + chest.height * 0.8);
  ctx.lineTo(chest.x + 3, chest.y + chest.height * 0.28);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(12, 10, 8, 0.72)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(centerX, chest.y + 2);
  ctx.lineTo(chest.x + chest.width - 5, chest.y + chest.height * 0.29);
  ctx.lineTo(chest.x + chest.width - 7, chest.y + chest.height * 0.78);
  ctx.lineTo(centerX, chest.y + chest.height - 2);
  ctx.lineTo(chest.x + 7, chest.y + chest.height * 0.78);
  ctx.lineTo(chest.x + 5, chest.y + chest.height * 0.29);
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = crystalColor;
  ctx.beginPath();
  ctx.moveTo(centerX, chest.y + 8);
  ctx.lineTo(centerX + 8, chest.y + chest.height * 0.46);
  ctx.lineTo(centerX, chest.y + chest.height - 8);
  ctx.lineTo(centerX - 8, chest.y + chest.height * 0.46);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = crystalInner;
  ctx.beginPath();
  ctx.moveTo(centerX, chest.y + 13);
  ctx.lineTo(centerX + 4.4, chest.y + chest.height * 0.46);
  ctx.lineTo(centerX, chest.y + chest.height - 13);
  ctx.lineTo(centerX - 4.4, chest.y + chest.height * 0.46);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = runeColor;
  ctx.lineWidth = 1.4;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(chest.x + 10, chest.y + 12);
  ctx.lineTo(chest.x + 14, chest.y + 18);
  ctx.lineTo(chest.x + 10, chest.y + 24);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(chest.x + chest.width - 10, chest.y + 12);
  ctx.lineTo(chest.x + chest.width - 14, chest.y + 18);
  ctx.lineTo(chest.x + chest.width - 10, chest.y + 24);
  ctx.stroke();

  if (isRare) {
    const rareAura = ctx.createRadialGradient(centerX, chest.y + 16, 1, centerX, chest.y + 16, 18);
    rareAura.addColorStop(0, 'rgba(214, 251, 255, 0.30)');
    rareAura.addColorStop(0.55, 'rgba(130, 232, 255, 0.16)');
    rareAura.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rareAura;
    ctx.beginPath();
    ctx.arc(centerX, chest.y + 16, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.moveTo(centerX, chest.y + 4);
  ctx.lineTo(centerX + 10, chest.y + 10);
  ctx.lineTo(centerX, chest.y + 14);
  ctx.lineTo(centerX - 10, chest.y + 10);
  ctx.closePath();
  ctx.fill();
}

function drawBrokenRelic(
  ctx: CanvasRenderingContext2D,
  chest: Chest,
): void {
  const isRare = chest.rare === true;
  const centerX = chest.x + chest.width / 2;
  const centerY = chest.y + chest.height / 2;
  const crystalColor = isRare ? '#82e8ff' : '#ffb15c';
  const crystalInner = isRare ? '#d6fbff' : '#ffe1a8';
  const frameDark = isRare ? '#1c2430' : '#2b241d';
  const frameMid = isRare ? '#34465d' : '#5a4023';

  const fade = Math.max(0, Math.min(1, chest.breakTimer / 0.28));
  const pulse = Math.sin(performance.now() * 0.018) * 0.5 + 0.5;
  const energyColor = isRare
    ? `rgba(130, 232, 255, ${0.30 * fade + pulse * 0.12})`
    : `rgba(255, 181, 92, ${0.18 * fade + pulse * 0.08})`;

  ctx.save();
  ctx.globalAlpha = Math.max(0.35, fade);

  const glow = ctx.createRadialGradient(
    centerX,
    centerY - 8,
    1,
    centerX,
    centerY - 8,
    chest.width * 1.25,
  );
  glow.addColorStop(0, isRare ? 'rgba(130, 232, 255, 0.30)' : 'rgba(255, 181, 92, 0.18)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(centerX, centerY - 6, chest.width, 0, Math.PI * 2);
  ctx.fill();

  const beam = ctx.createLinearGradient(centerX, chest.y + 6, centerX, chest.y - 28);
  beam.addColorStop(0, energyColor);
  beam.addColorStop(0.55, isRare ? 'rgba(214, 251, 255, 0.30)' : 'rgba(255, 225, 168, 0.18)');
  beam.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(centerX - 5, chest.y + 18);
  ctx.quadraticCurveTo(centerX - 9, chest.y + 2, centerX - 3, chest.y - 20);
  ctx.lineTo(centerX + 3, chest.y - 20);
  ctx.quadraticCurveTo(centerX + 9, chest.y + 2, centerX + 5, chest.y + 18);
  ctx.closePath();
  ctx.fill();

  drawEnergyArc(ctx, centerX - 10, chest.y + 14, -1, isRare);
  drawEnergyArc(ctx, centerX + 10, chest.y + 10, 1, isRare);
  drawEnergyArc(ctx, centerX, chest.y + 6, 1, isRare);

  if (isRare) {
    drawRareSpark(ctx, centerX - 6, chest.y - 6);
    drawRareSpark(ctx, centerX + 7, chest.y - 10);
    drawRareSpark(ctx, centerX + 1, chest.y - 16);
  }

  ctx.fillStyle = frameDark;
  ctx.beginPath();
  ctx.moveTo(chest.x + 4, chest.y + chest.height - 2);
  ctx.lineTo(centerX - 2, chest.y + chest.height - 10);
  ctx.lineTo(centerX - 6, chest.y + 12);
  ctx.lineTo(chest.x + 8, chest.y + 15);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(chest.x + chest.width - 4, chest.y + chest.height - 2);
  ctx.lineTo(centerX + 2, chest.y + chest.height - 10);
  ctx.lineTo(centerX + 6, chest.y + 12);
  ctx.lineTo(chest.x + chest.width - 8, chest.y + 15);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = frameMid;
  ctx.beginPath();
  ctx.moveTo(chest.x + 10, chest.y + chest.height - 8);
  ctx.lineTo(chest.x + chest.width - 10, chest.y + chest.height - 8);
  ctx.lineTo(chest.x + chest.width - 14, chest.y + chest.height - 2);
  ctx.lineTo(chest.x + 14, chest.y + chest.height - 2);
  ctx.closePath();
  ctx.fill();

  drawCrystalShard(
    ctx,
    centerX - 6,
    chest.y + 18,
    6,
    11,
    -0.25,
    crystalColor,
    crystalInner,
  );

  drawCrystalShard(
    ctx,
    centerX + 4,
    chest.y + 14,
    5,
    9,
    0.2,
    crystalColor,
    crystalInner,
  );

  drawCrystalShard(
    ctx,
    centerX,
    chest.y + 24,
    4,
    7,
    0.05,
    crystalColor,
    crystalInner,
  );

  drawSmallFragment(ctx, chest.x + 8, chest.y + chest.height - 4, crystalColor);
  drawSmallFragment(ctx, chest.x + 14, chest.y + chest.height - 1, crystalInner);
  drawSmallFragment(ctx, chest.x + chest.width - 12, chest.y + chest.height - 5, crystalColor);
  drawSmallFragment(ctx, chest.x + chest.width - 6, chest.y + chest.height - 2, crystalInner);

  ctx.strokeStyle = isRare
    ? 'rgba(185, 244, 255, 0.48)'
    : 'rgba(255, 211, 143, 0.34)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(centerX - 12, chest.y + 16);
  ctx.lineTo(centerX - 6, chest.y + 20);
  ctx.lineTo(centerX - 1, chest.y + 17);

  ctx.moveTo(centerX + 2, chest.y + 22);
  ctx.lineTo(centerX + 7, chest.y + 17);
  ctx.lineTo(centerX + 11, chest.y + 21);
  ctx.stroke();

  ctx.restore();
}

function drawEnergyArc(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: 1 | -1,
  rare: boolean,
): void {
  ctx.strokeStyle = rare
    ? 'rgba(185, 244, 255, 0.50)'
    : 'rgba(255, 211, 143, 0.38)';
  ctx.lineWidth = rare ? 1.7 : 1.4;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 4 * dir, y - 5);
  ctx.lineTo(x + 1 * dir, y - 10);
  ctx.lineTo(x + 7 * dir, y - 14);
  ctx.stroke();
}

function drawRareSpark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
): void {
  ctx.strokeStyle = 'rgba(214, 251, 255, 0.72)';
  ctx.lineWidth = 1.1;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(x - 2, y);
  ctx.lineTo(x + 2, y);
  ctx.moveTo(x, y - 2);
  ctx.lineTo(x, y + 2);
  ctx.stroke();
}

function drawCrystalShard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  halfWidth: number,
  height: number,
  tilt: number,
  outerColor: string,
  innerColor: string,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);

  ctx.fillStyle = outerColor;
  ctx.beginPath();
  ctx.moveTo(0, -height);
  ctx.lineTo(halfWidth, 0);
  ctx.lineTo(0, height * 0.35);
  ctx.lineTo(-halfWidth, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = innerColor;
  ctx.beginPath();
  ctx.moveTo(0, -height * 0.55);
  ctx.lineTo(halfWidth * 0.45, 0);
  ctx.lineTo(0, height * 0.12);
  ctx.lineTo(-halfWidth * 0.35, 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawSmallFragment(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - 3);
  ctx.lineTo(x + 3, y);
  ctx.lineTo(x, y + 2);
  ctx.lineTo(x - 2, y);
  ctx.closePath();
  ctx.fill();
}
