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

    if (hazard.type === 'geyser') {
      drawGeyserHazard(ctx, hazard);
      continue;
    }

    if (hazard.type === 'spike') {
      drawSpikeHazard(ctx, hazard);
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
    const bubbleY =
      hazard.y + hazard.height / 2 - 4 + Math.sin(hazard.pulseOffset + index) * 3;

    ctx.fillStyle = 'rgba(218, 255, 224, 0.55)';
    ctx.beginPath();
    ctx.arc(bubbleX, bubbleY, 2 + (index % 2), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGeyserHazard(
  ctx: CanvasRenderingContext2D,
  hazard: Hazard,
): void {
  const time = performance.now() * 0.007;
  const pulse = Math.sin(hazard.pulseOffset * 1.9 + time) * 0.5 + 0.5;
  const centerX = hazard.x + hazard.width / 2;
  const baseY = hazard.y + hazard.height;

  const plumeHeight = 34 + pulse * 34;
  const plumeWidth = hazard.width * (0.44 + pulse * 0.18);

  const glow = ctx.createRadialGradient(centerX, hazard.y, 4, centerX, hazard.y, 36);
  glow.addColorStop(0, `rgba(122, 255, 154, ${0.28 + pulse * 0.14})`);
  glow.addColorStop(0.45, `rgba(48, 208, 104, ${0.18 + pulse * 0.08})`);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(centerX, hazard.y - plumeHeight * 0.2, 38, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#154b24';
  ctx.beginPath();
  ctx.ellipse(centerX, baseY - 5, hazard.width / 2, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#2ed36c';
  ctx.beginPath();
  ctx.moveTo(centerX, hazard.y - plumeHeight);
  ctx.quadraticCurveTo(
    centerX + plumeWidth,
    hazard.y - plumeHeight * 0.35,
    centerX + hazard.width * 0.2,
    baseY - 6,
  );
  ctx.lineTo(centerX - hazard.width * 0.2, baseY - 6);
  ctx.quadraticCurveTo(
    centerX - plumeWidth,
    hazard.y - plumeHeight * 0.35,
    centerX,
    hazard.y - plumeHeight,
  );
  ctx.fill();

  ctx.fillStyle = 'rgba(210, 255, 220, 0.55)';
  for (let index = 0; index < 4; index += 1) {
    const bubbleX =
      centerX +
      (index - 1.5) * 7 +
      Math.sin(time * 1.1 + index + hazard.x * 0.02) * 3;
    const bubbleY = hazard.y - 6 - index * 10 - pulse * 10;

    ctx.beginPath();
    ctx.arc(bubbleX, bubbleY, 2 + (index % 2), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(236, 255, 240, 0.35)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(centerX, hazard.y - plumeHeight + 6);
  ctx.lineTo(centerX + plumeWidth * 0.18, hazard.y - plumeHeight * 0.38);
  ctx.lineTo(centerX, hazard.y - 8);
  ctx.stroke();
}

function drawSpikeHazard(
  ctx: CanvasRenderingContext2D,
  hazard: Hazard,
): void {
  const spikeCount = Math.max(3, Math.floor(hazard.width / 12));
  const spikeWidth = hazard.width / spikeCount;
  const baseY = hazard.y + hazard.height;

  ctx.fillStyle = '#3e3f45';
  ctx.fillRect(hazard.x, hazard.y + hazard.height - 4, hazard.width, 4);

  for (let index = 0; index < spikeCount; index += 1) {
    const x = hazard.x + index * spikeWidth;
    const peakX = x + spikeWidth / 2;

    const metal = ctx.createLinearGradient(x, hazard.y, x, baseY);
    metal.addColorStop(0, '#f1f4f8');
    metal.addColorStop(0.18, '#c8d0d8');
    metal.addColorStop(0.5, '#818a95');
    metal.addColorStop(1, '#444a52');

    ctx.fillStyle = metal;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(peakX, hazard.y);
    ctx.lineTo(x + spikeWidth, baseY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(35, 38, 44, 0.9)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.moveTo(peakX, hazard.y + 2);
    ctx.lineTo(peakX - spikeWidth * 0.18, baseY - 4);
    ctx.stroke();
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
