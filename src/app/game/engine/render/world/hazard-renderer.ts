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
  const surfaceY = hazard.y + 10;

  /**
   * fundo da lava/gosma preenchendo o buraco inteiro
   * sem oval/sombra estranha
   */
  const body = ctx.createLinearGradient(
    0,
    hazard.y,
    0,
    hazard.y + hazard.height,
  );
  body.addColorStop(0, '#63ff8e');
  body.addColorStop(0.16, '#35d86b');
  body.addColorStop(0.46, '#178b3b');
  body.addColorStop(1, '#082412');

  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(hazard.x, hazard.y + hazard.height);
  ctx.lineTo(hazard.x, surfaceY);

  for (let offset = 0; offset <= hazard.width; offset += 14) {
    const wave =
      Math.sin(time * 2.1 + offset * 0.08 + hazard.x * 0.01) * 3 +
      Math.sin(time * 1.1 + offset * 0.035) * 1.4;

    ctx.lineTo(hazard.x + offset, surfaceY + wave);
  }

  ctx.lineTo(hazard.x + hazard.width, hazard.y + hazard.height);
  ctx.closePath();
  ctx.fill();

  /**
   * brilho só na superfície
   */
  ctx.strokeStyle = 'rgba(220, 255, 226, 0.42)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();

  for (let offset = 0; offset <= hazard.width; offset += 10) {
    const wave =
      Math.sin(time * 2.1 + offset * 0.08 + hazard.x * 0.01) * 3 +
      Math.sin(time * 1.1 + offset * 0.035) * 1.4;

    const px = hazard.x + offset;
    const py = surfaceY + wave;

    if (offset === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }

  ctx.stroke();

  /**
   * reflexo interno suave
   */
  const innerGlow = ctx.createLinearGradient(
    0,
    surfaceY,
    0,
    hazard.y + hazard.height,
  );
  innerGlow.addColorStop(0, 'rgba(180, 255, 190, 0.18)');
  innerGlow.addColorStop(0.22, 'rgba(120, 255, 156, 0.08)');
  innerGlow.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = innerGlow;
  ctx.fillRect(hazard.x, surfaceY + 2, hazard.width, hazard.height - 2);

  /**
   * bolhas leves
   */
  for (let index = 0; index < 6; index += 1) {
    const bubbleX =
      hazard.x +
      18 +
      index * ((hazard.width - 36) / 5) +
      Math.sin(time * 1.5 + index) * 3;

    const bubbleY =
      surfaceY +
      10 +
      Math.sin(time * 2 + index * 1.2) * 4;

    ctx.fillStyle = 'rgba(225, 255, 230, 0.28)';
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
}

function drawSpikeHazard(
  ctx: CanvasRenderingContext2D,
  hazard: Hazard,
): void {
  const spikeCount = Math.max(4, Math.floor(hazard.width / 14));
  const spikeWidth = hazard.width / spikeCount;
  const baseY = hazard.y + hazard.height;

  ctx.fillStyle = '#4a4c54';
  ctx.fillRect(hazard.x, baseY - 5, hazard.width, 5);

  for (let index = 0; index < spikeCount; index += 1) {
    const x = hazard.x + index * spikeWidth;
    const peakX = x + spikeWidth / 2;

    const metal = ctx.createLinearGradient(x, hazard.y, x, baseY);
    metal.addColorStop(0, '#f5f7fa');
    metal.addColorStop(0.18, '#cfd6de');
    metal.addColorStop(0.5, '#8a919b');
    metal.addColorStop(1, '#484e56');

    ctx.fillStyle = metal;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(peakX, hazard.y);
    ctx.lineTo(x + spikeWidth, baseY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(35, 38, 44, 0.85)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
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
