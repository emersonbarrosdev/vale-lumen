import { Hazard } from '../../../domain/world/hazard.model';

export function drawHazards(
  ctx: CanvasRenderingContext2D,
  hazards: Hazard[],
): void {
  for (const hazard of hazards) {
    if (!hazard.active) {
      continue;
    }

    if (hazard.type === 'goo') {
      drawGooHazard(ctx, hazard);
      continue;
    }

    drawCrystalHazard(ctx, hazard);
  }
}

function drawGooHazard(
  ctx: CanvasRenderingContext2D,
  hazard: Hazard,
): void {
  const pulse = Math.sin(hazard.pulseOffset) * 0.5 + 0.5;

  const glow = ctx.createRadialGradient(
    hazard.x + hazard.width / 2,
    hazard.y + hazard.height / 2,
    4,
    hazard.x + hazard.width / 2,
    hazard.y + hazard.height / 2,
    hazard.width * 0.7,
  );
  glow.addColorStop(0, `rgba(132, 255, 168, ${0.18 + pulse * 0.1})`);
  glow.addColorStop(0.45, `rgba(40, 194, 88, ${0.16 + pulse * 0.08})`);
  glow.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(
    hazard.x + hazard.width / 2,
    hazard.y + hazard.height / 2,
    hazard.width * 0.55,
    hazard.height * 1.8,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = '#1e6e34';
  ctx.beginPath();
  ctx.ellipse(
    hazard.x + hazard.width / 2,
    hazard.y + hazard.height / 2,
    hazard.width / 2,
    hazard.height / 2,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = '#44d767';
  ctx.beginPath();
  ctx.ellipse(
    hazard.x + hazard.width / 2,
    hazard.y + hazard.height / 2 - 1,
    hazard.width / 2.8,
    hazard.height / 3.2,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  for (let index = 0; index < 4; index += 1) {
    const bubbleX = hazard.x + 16 + index * ((hazard.width - 32) / 3);
    const bubbleY = hazard.y + hazard.height / 2 - 4 + Math.sin(hazard.pulseOffset + index) * 3;
    ctx.fillStyle = 'rgba(218, 255, 224, 0.55)';
    ctx.beginPath();
    ctx.arc(bubbleX, bubbleY, 2 + (index % 2), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCrystalHazard(
  ctx: CanvasRenderingContext2D,
  hazard: Hazard,
): void {
  const pulse = Math.sin(hazard.pulseOffset * 1.3) * 0.5 + 0.5;
  const centerX = hazard.x + hazard.width / 2;
  const baseY = hazard.y + hazard.height;

  const aura = ctx.createRadialGradient(centerX, hazard.y + 20, 2, centerX, hazard.y + 20, 48);
  aura.addColorStop(0, `rgba(168, 120, 255, ${0.18 + pulse * 0.08})`);
  aura.addColorStop(0.5, `rgba(84, 48, 146, ${0.14 + pulse * 0.06})`);
  aura.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(centerX, hazard.y + 20, 52, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#3e2466';
  ctx.beginPath();
  ctx.moveTo(centerX, hazard.y);
  ctx.lineTo(hazard.x + hazard.width * 0.18, baseY);
  ctx.lineTo(centerX, baseY - 18);
  ctx.lineTo(hazard.x + hazard.width * 0.82, baseY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#a77cff';
  ctx.beginPath();
  ctx.moveTo(centerX, hazard.y + 10);
  ctx.lineTo(hazard.x + hazard.width * 0.36, baseY - 8);
  ctx.lineTo(centerX, baseY - 20);
  ctx.lineTo(hazard.x + hazard.width * 0.64, baseY - 8);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(241, 231, 255, 0.42)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(centerX, hazard.y + 8);
  ctx.lineTo(centerX - 8, baseY - 18);
  ctx.lineTo(centerX + 2, baseY - 28);
  ctx.stroke();
}
