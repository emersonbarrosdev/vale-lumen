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
      drawBrokenChest(ctx, chest);
      continue;
    }

    drawClosedChest(ctx, chest);
  }
}

function drawClosedChest(
  ctx: CanvasRenderingContext2D,
  chest: Chest,
): void {
  const glowColor = chest.rare
    ? 'rgba(125, 232, 255, 0.28)'
    : 'rgba(255, 210, 120, 0.22)';

  const glow = ctx.createRadialGradient(
    chest.x + chest.width / 2,
    chest.y + chest.height / 2,
    1,
    chest.x + chest.width / 2,
    chest.y + chest.height / 2,
    chest.width,
  );
  glow.addColorStop(0, glowColor);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(chest.x + chest.width / 2, chest.y + chest.height / 2, chest.width, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = chest.rare ? '#4c3469' : '#6a4420';
  ctx.fillRect(chest.x, chest.y + 6, chest.width, chest.height - 6);

  ctx.fillStyle = chest.rare ? '#7b5bc2' : '#8b6132';
  ctx.fillRect(chest.x, chest.y, chest.width, 10);

  ctx.fillStyle = '#d3b06a';
  ctx.fillRect(chest.x + 4, chest.y + 10, chest.width - 8, 4);
  ctx.fillRect(chest.x + chest.width / 2 - 3, chest.y + 6, 6, chest.height - 8);

  ctx.fillStyle = '#f3e1a5';
  ctx.fillRect(chest.x + chest.width / 2 - 2, chest.y + chest.height / 2 - 2, 4, 6);

  ctx.strokeStyle = 'rgba(20, 12, 10, 0.78)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(chest.x, chest.y, chest.width, chest.height);
}

function drawBrokenChest(
  ctx: CanvasRenderingContext2D,
  chest: Chest,
): void {
  ctx.fillStyle = 'rgba(255, 210, 120, 0.15)';
  ctx.fillRect(chest.x - 4, chest.y - 4, chest.width + 8, chest.height + 8);

  ctx.fillStyle = '#4a2f18';
  ctx.beginPath();
  ctx.moveTo(chest.x, chest.y + chest.height);
  ctx.lineTo(chest.x + chest.width * 0.45, chest.y + chest.height - 10);
  ctx.lineTo(chest.x + chest.width * 0.3, chest.y + 10);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(chest.x + chest.width, chest.y + chest.height);
  ctx.lineTo(chest.x + chest.width * 0.55, chest.y + chest.height - 10);
  ctx.lineTo(chest.x + chest.width * 0.7, chest.y + 8);
  ctx.closePath();
  ctx.fill();
}
