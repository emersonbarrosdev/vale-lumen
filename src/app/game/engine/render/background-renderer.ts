export function drawBackground(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  cameraX: number,
  effectsIntensity = 0.8,
): void {
  const fx = clamp01(effectsIntensity);

  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  skyGradient.addColorStop(0, '#04060a');
  skyGradient.addColorStop(0.18, '#0a1017');
  skyGradient.addColorStop(0.42, '#0d1118');
  skyGradient.addColorStop(0.72, '#0a0c11');
  skyGradient.addColorStop(1, '#020304');

  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawSkyVoidClouds(ctx, canvas, cameraX, fx);
  drawFarStormGlow(ctx, canvas, cameraX, fx);
  drawLightningCuts(ctx, canvas, cameraX, fx);
  drawGreenStormSparks(ctx, canvas, cameraX, fx);

  drawMountainLayer(
    ctx,
    cameraX,
    canvas.width,
    0.05,
    'rgba(9, 12, 18, 0.98)',
    [470, 360, 404, 286, 428, 240, 386, 264, 720],
  );

  drawMountainLayer(
    ctx,
    cameraX,
    canvas.width,
    0.1,
    'rgba(16, 19, 27, 0.94)',
    [548, 450, 500, 376, 522, 344, 486, 396, 720],
  );

  drawMountainLayer(
    ctx,
    cameraX,
    canvas.width,
    0.16,
    'rgba(24, 20, 30, 0.9)',
    [594, 528, 562, 466, 580, 432, 552, 486, 720],
  );

  drawRuinSilhouettes(ctx, cameraX, canvas.width);
  drawDeadForest(ctx, cameraX, canvas.width);
  drawForegroundFog(ctx, canvas, fx);
  drawAbyssGlow(ctx, canvas, fx);
}

function drawSkyVoidClouds(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  cameraX: number,
  effectsIntensity: number,
): void {
  const alphaBoost = 0.55 + effectsIntensity * 0.8;

  const clouds = [
    { x: 140, y: 92, rx: 180, ry: 52, alpha: 0.05, parallax: 0.03 },
    { x: 620, y: 148, rx: 220, ry: 64, alpha: 0.04, parallax: 0.025 },
    { x: 1120, y: 124, rx: 200, ry: 54, alpha: 0.045, parallax: 0.032 },
  ];

  for (const cloud of clouds) {
    const x = ((cloud.x - cameraX * cloud.parallax) % (canvas.width + 420)) - 120;

    ctx.fillStyle = `rgba(8, 10, 14, ${cloud.alpha * alphaBoost})`;
    ctx.beginPath();
    ctx.ellipse(x, cloud.y, cloud.rx, cloud.ry, 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(20, 25, 32, ${cloud.alpha * 0.5 * alphaBoost})`;
    ctx.beginPath();
    ctx.ellipse(
      x + 40,
      cloud.y + 8,
      cloud.rx * 0.62,
      cloud.ry * 0.56,
      -0.12,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

function drawFarStormGlow(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  cameraX: number,
  effectsIntensity: number,
): void {
  const orangeAlpha = 0.45 + effectsIntensity * 0.9;
  const greenAlpha = 0.5 + effectsIntensity * 0.95;

  const orangeGlow = ctx.createRadialGradient(
    220 - cameraX * 0.02,
    130,
    10,
    220 - cameraX * 0.02,
    130,
    220,
  );
  orangeGlow.addColorStop(0, `rgba(142, 34, 28, ${0.1 * orangeAlpha})`);
  orangeGlow.addColorStop(0.4, `rgba(84, 18, 22, ${0.06 * orangeAlpha})`);
  orangeGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = orangeGlow;
  ctx.fillRect(0, 0, canvas.width, 280);

  const greenGlow = ctx.createRadialGradient(
    canvas.width * 0.72 - cameraX * 0.015,
    160,
    8,
    canvas.width * 0.72 - cameraX * 0.015,
    160,
    170,
  );
  greenGlow.addColorStop(0, `rgba(80, 255, 160, ${0.06 * greenAlpha})`);
  greenGlow.addColorStop(0.5, `rgba(36, 132, 92, ${0.04 * greenAlpha})`);
  greenGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = greenGlow;
  ctx.fillRect(0, 0, canvas.width, 320);
}

function drawLightningCuts(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  cameraX: number,
  effectsIntensity: number,
): void {
  const time = performance.now() * 0.00065;
  const strikeCount = effectsIntensity >= 0.9 ? 4 : effectsIntensity >= 0.55 ? 3 : 2;

  const baseStrikes = [
    { baseX: 260, topY: 36, len: 116, amp: 18, alpha: 0.12, parallax: 0.02 },
    { baseX: 980, topY: 48, len: 126, amp: 16, alpha: 0.1, parallax: 0.016 },
    { baseX: 520, topY: 24, len: 108, amp: 15, alpha: 0.09, parallax: 0.022 },
    { baseX: 1320, topY: 30, len: 132, amp: 20, alpha: 0.1, parallax: 0.018 },
  ];

  for (let index = 0; index < strikeCount; index += 1) {
    const strike = baseStrikes[index];
    const pulse = Math.sin(time + index * 1.6) * 0.5 + 0.5;
    const x = ((strike.baseX - cameraX * strike.parallax) % (canvas.width + 140)) - 70;

    ctx.strokeStyle = `rgba(182, 216, 255, ${strike.alpha * (0.35 + pulse * 0.65) * (0.55 + effectsIntensity * 0.85)})`;
    ctx.lineWidth = 1.3 + effectsIntensity * 0.8;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(x, strike.topY);

    const segments = 5;
    for (let segment = 1; segment <= segments; segment += 1) {
      const t = segment / segments;
      const offsetX = Math.sin(time * 1.12 + segment * 0.8 + index) * strike.amp;
      const px = x + offsetX * (segment % 2 === 0 ? -1 : 1);
      const py = strike.topY + strike.len * t;
      ctx.lineTo(px, py);
    }

    ctx.stroke();
  }
}

function drawGreenStormSparks(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  cameraX: number,
  effectsIntensity: number,
): void {
  const time = performance.now() * 0.0012;
  const sparkCount =
    effectsIntensity <= 0.15
      ? 2
      : effectsIntensity <= 0.35
        ? 4
        : effectsIntensity <= 0.65
          ? 8
          : effectsIntensity <= 0.85
            ? 12
            : 16;

  for (let index = 0; index < sparkCount; index += 1) {
    const spacing = 150 - Math.floor(effectsIntensity * 35);
    const baseX = ((index * spacing) - cameraX * 0.02) % (canvas.width + 90);
    const x = baseX < 0 ? baseX + canvas.width + 90 : baseX;
    const y = 120 + (index % 4) * 54 + Math.sin(time + index) * (4 + effectsIntensity * 4);
    const size = 0.8 + (index % 2) * 0.45 + effectsIntensity * 0.5;
    const alpha =
      0.04 + (Math.sin(time * 1.2 + index * 1.8) * 0.5 + 0.5) * (0.06 + effectsIntensity * 0.12);

    const glow = ctx.createRadialGradient(x, y, 0.5, x, y, 8 + effectsIntensity * 6);
    glow.addColorStop(0, `rgba(144, 255, 186, ${alpha + 0.12})`);
    glow.addColorStop(0.4, `rgba(65, 218, 132, ${alpha})`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, 6 + effectsIntensity * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(184, 255, 212, ${alpha + 0.16})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMountainLayer(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  canvasWidth: number,
  parallax: number,
  color: string,
  heights: number[],
): void {
  const offset = -((cameraX * parallax) % canvasWidth);

  ctx.fillStyle = color;

  for (let layer = -1; layer <= 1; layer += 1) {
    const startX = offset + layer * canvasWidth;

    ctx.beginPath();
    ctx.moveTo(startX, heights[0]);

    const segmentWidth = canvasWidth / (heights.length - 2);

    for (let index = 1; index < heights.length - 1; index += 1) {
      ctx.lineTo(startX + segmentWidth * index, heights[index]);
    }

    ctx.lineTo(startX + canvasWidth, heights[heights.length - 2]);
    ctx.lineTo(startX + canvasWidth, heights[heights.length - 1]);
    ctx.lineTo(startX, heights[heights.length - 1]);
    ctx.closePath();
    ctx.fill();
  }
}

function drawRuinSilhouettes(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  canvasWidth: number,
): void {
  for (let index = 0; index < 5; index += 1) {
    const x = ((index * 360) - cameraX * 0.12) % (canvasWidth + 260);

    ctx.fillStyle = 'rgba(12, 14, 20, 0.4)';
    ctx.fillRect(x + 20, 370, 42, 150);
    ctx.fillRect(x + 80, 412, 96, 108);
  }
}

function drawDeadForest(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  canvasWidth: number,
): void {
  for (let index = 0; index < 9; index += 1) {
    const x = ((index * 250) - cameraX * 0.2) % (canvasWidth + 220);

    ctx.fillStyle = 'rgba(17, 14, 18, 0.52)';
    ctx.fillRect(x + 38, 444, 18, 108);

    ctx.strokeStyle = 'rgba(42, 24, 28, 0.36)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x + 46, 460);
    ctx.lineTo(x + 24, 430);
    ctx.moveTo(x + 46, 482);
    ctx.lineTo(x + 72, 448);
    ctx.stroke();
  }
}

function drawForegroundFog(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  effectsIntensity: number,
): void {
  const haze = ctx.createLinearGradient(0, 410, 0, canvas.height);
  haze.addColorStop(0, 'rgba(26, 18, 24, 0)');
  haze.addColorStop(0.36, `rgba(36, 18, 22, ${0.03 + effectsIntensity * 0.04})`);
  haze.addColorStop(0.7, `rgba(20, 16, 18, ${0.06 + effectsIntensity * 0.06})`);
  haze.addColorStop(1, `rgba(6, 6, 8, ${0.12 + effectsIntensity * 0.12})`);
  ctx.fillStyle = haze;
  ctx.fillRect(0, 390, canvas.width, canvas.height - 390);
}

function drawAbyssGlow(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  effectsIntensity: number,
): void {
  const abyss = ctx.createLinearGradient(0, 598, 0, canvas.height);
  abyss.addColorStop(0, 'rgba(255, 120, 56, 0)');
  abyss.addColorStop(0.08, `rgba(134, 30, 22, ${0.04 + effectsIntensity * 0.06})`);
  abyss.addColorStop(0.22, `rgba(56, 12, 16, ${0.09 + effectsIntensity * 0.12})`);
  abyss.addColorStop(0.52, `rgba(10, 4, 8, ${0.22 + effectsIntensity * 0.22})`);
  abyss.addColorStop(1, 'rgba(0, 0, 0, 0.86)');
  ctx.fillStyle = abyss;
  ctx.fillRect(0, 598, canvas.width, canvas.height - 598);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
