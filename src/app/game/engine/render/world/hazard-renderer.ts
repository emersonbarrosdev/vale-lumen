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
  const time = performance.now() * 0.0022;
  const surfaceY = hazard.y + 9;

  const body = ctx.createLinearGradient(0, hazard.y, 0, hazard.y + hazard.height);
  body.addColorStop(0, '#78ff8f');
  body.addColorStop(0.18, '#4fdc72');
  body.addColorStop(0.42, '#5e44a8');
  body.addColorStop(0.72, '#2f205b');
  body.addColorStop(1, '#10131c');

  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(hazard.x, hazard.y + hazard.height);
  ctx.lineTo(hazard.x, surfaceY);

  for (let offset = 0; offset <= hazard.width; offset += 10) {
    const wave =
      Math.sin(time * 2 + offset * 0.09 + hazard.x * 0.015) * 3.2 +
      Math.sin(time * 1.25 + offset * 0.05) * 1.3;

    ctx.lineTo(hazard.x + offset, surfaceY + wave);
  }

  ctx.lineTo(hazard.x + hazard.width, hazard.y + hazard.height);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(232, 255, 238, 0.5)';
  ctx.lineWidth = 1.3;
  ctx.beginPath();

  for (let offset = 0; offset <= hazard.width; offset += 10) {
    const wave =
      Math.sin(time * 2 + offset * 0.09 + hazard.x * 0.015) * 3.2 +
      Math.sin(time * 1.25 + offset * 0.05) * 1.3;

    const px = hazard.x + offset;
    const py = surfaceY + wave;

    if (offset === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }

  ctx.stroke();

  ctx.fillStyle = 'rgba(180, 255, 196, 0.08)';
  ctx.fillRect(hazard.x, surfaceY + 2, hazard.width, hazard.height - 2);

  for (let index = 0; index < 4; index += 1) {
    const bubbleX =
      hazard.x +
      22 +
      index * ((hazard.width - 44) / 3) +
      Math.sin(time * 1.4 + index) * 2.5;
    const bubbleY = surfaceY + 12 + Math.sin(time * 2.1 + index * 1.2) * 4;

    ctx.fillStyle = 'rgba(237, 255, 242, 0.22)';
    ctx.beginPath();
    ctx.arc(bubbleX, bubbleY, 2 + (index % 2), 0, Math.PI * 2);
    ctx.fill();
  }

  drawGooParticles(ctx, hazard, time, surfaceY);
}

function drawGooParticles(
  ctx: CanvasRenderingContext2D,
  hazard: Hazard,
  time: number,
  surfaceY: number,
): void {
  for (let index = 0; index < 2; index += 1) {
    const phase = time * 1.2 + index * 2.6 + hazard.x * 0.004;
    const x = hazard.x + hazard.width * (0.28 + index * 0.34) + Math.sin(phase) * 6;
    const y = surfaceY - 8 - Math.abs(Math.sin(phase * 1.3)) * 6;

    const glow = ctx.createRadialGradient(x, y, 1, x, y, 8);
    glow.addColorStop(0, 'rgba(170, 255, 188, 0.22)');
    glow.addColorStop(0.5, 'rgba(144, 104, 255, 0.14)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = index % 2 === 0
      ? 'rgba(188, 255, 204, 0.3)'
      : 'rgba(186, 126, 255, 0.24)';
    ctx.beginPath();
    ctx.arc(x, y, 2.2, 0, Math.PI * 2);
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
}

function drawSpikeHazard(
  ctx: CanvasRenderingContext2D,
  hazard: Hazard,
): void {
  const spikeCount = Math.max(4, Math.floor(hazard.width / 18));
  const spikeWidth = hazard.width / spikeCount;
  const baseY = hazard.y + hazard.height;

  ctx.fillStyle = '#7f8696';
  ctx.fillRect(hazard.x, baseY - 6, hazard.width, 6);

  ctx.strokeStyle = 'rgba(25, 28, 34, 0.45)';
  ctx.lineWidth = 1;
  ctx.strokeRect(hazard.x + 0.5, baseY - 5.5, hazard.width - 1, 5);

  for (let index = 0; index < spikeCount; index += 1) {
    const x = hazard.x + index * spikeWidth;
    const peakX = x + spikeWidth / 2;

    const metal = ctx.createLinearGradient(x, hazard.y, x, baseY);
    metal.addColorStop(0, '#ffffff');
    metal.addColorStop(0.18, '#eef2f8');
    metal.addColorStop(0.54, '#bbc3cf');
    metal.addColorStop(1, '#707887');

    ctx.fillStyle = metal;
    ctx.beginPath();
    ctx.moveTo(x, baseY - 1);
    ctx.lineTo(peakX, hazard.y);
    ctx.lineTo(x + spikeWidth, baseY - 1);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(34, 38, 46, 0.78)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.34)';
    ctx.beginPath();
    ctx.moveTo(peakX, hazard.y + 2);
    ctx.lineTo(peakX - spikeWidth * 0.16, baseY - 5);
    ctx.stroke();
  }
}

function drawCrystalHazard(
  ctx: CanvasRenderingContext2D,
  hazard: Hazard,
): void {
  const pulse = Math.sin(performance.now() * 0.004 + hazard.pulseOffset * 1.7) * 0.5 + 0.5;
  const centerX = hazard.x + hazard.width / 2;
  const baseY = hazard.y + hazard.height;

  const aura = ctx.createRadialGradient(centerX, hazard.y + 20, 2, centerX, hazard.y + 20, 48);
  aura.addColorStop(0, `rgba(168, 120, 255, ${0.16 + pulse * 0.08})`);
  aura.addColorStop(0.5, `rgba(84, 48, 146, ${0.12 + pulse * 0.06})`);
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
