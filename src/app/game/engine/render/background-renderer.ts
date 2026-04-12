export function drawBackground(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  cameraX: number,
  effectsIntensity = 0.8,
): void {
  const fx = clamp01(effectsIntensity);

  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  skyGradient.addColorStop(0, '#030407');
  skyGradient.addColorStop(0.16, '#07090d');
  skyGradient.addColorStop(0.42, '#0a0d12');
  skyGradient.addColorStop(0.72, '#080a0f');
  skyGradient.addColorStop(1, '#040507');

  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawSkyVoidClouds(ctx, canvas, cameraX, fx);
  drawFarStormGlow(ctx, canvas, cameraX, fx);
  drawLightningCuts(ctx, canvas, cameraX, fx);
  drawGreenStormSparks(ctx, canvas, cameraX, fx);
  drawFloatingAsh(ctx, canvas, cameraX, fx);

  drawMountainLayer(
    ctx,
    cameraX,
    canvas.width,
    0.05,
    'rgba(8, 10, 14, 0.98)',
    [470, 360, 404, 286, 428, 240, 386, 264, 720],
  );

  drawMountainLayer(
    ctx,
    cameraX,
    canvas.width,
    0.1,
    'rgba(12, 15, 20, 0.94)',
    [548, 450, 500, 376, 522, 344, 486, 396, 720],
  );

  drawMountainLayer(
    ctx,
    cameraX,
    canvas.width,
    0.16,
    'rgba(18, 17, 24, 0.9)',
    [594, 528, 562, 466, 580, 432, 552, 486, 720],
  );

  drawRuinSilhouettes(ctx, cameraX, canvas.width);
  drawDeadForest(ctx, cameraX, canvas.width);
  drawForegroundTrees(ctx, cameraX, canvas.width);
  drawForegroundPlants(ctx, cameraX, canvas.width);
  drawForegroundFog(ctx, canvas, fx);
}

function drawSkyVoidClouds(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  cameraX: number,
  effectsIntensity: number,
): void {
  const alphaBoost = 0.58 + effectsIntensity * 0.85;

  const clouds = [
    { x: 140, y: 92, rx: 180, ry: 52, alpha: 0.055, parallax: 0.03 },
    { x: 620, y: 148, rx: 220, ry: 64, alpha: 0.045, parallax: 0.025 },
    { x: 1120, y: 124, rx: 200, ry: 54, alpha: 0.048, parallax: 0.032 },
    { x: 1480, y: 84, rx: 160, ry: 46, alpha: 0.042, parallax: 0.028 },
  ];

  for (const cloud of clouds) {
    const x = ((cloud.x - cameraX * cloud.parallax) % (canvas.width + 420)) - 120;

    ctx.fillStyle = `rgba(8, 10, 14, ${cloud.alpha * alphaBoost})`;
    ctx.beginPath();
    ctx.ellipse(x, cloud.y, cloud.rx, cloud.ry, 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(18, 24, 30, ${cloud.alpha * 0.55 * alphaBoost})`;
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
  const greenAlpha = 0.64 + effectsIntensity * 0.95;

  const greenGlowLeft = ctx.createRadialGradient(
    160 - cameraX * 0.018,
    146,
    6,
    160 - cameraX * 0.018,
    146,
    180,
  );
  greenGlowLeft.addColorStop(0, `rgba(74, 255, 156, ${0.08 * greenAlpha})`);
  greenGlowLeft.addColorStop(0.45, `rgba(30, 122, 82, ${0.05 * greenAlpha})`);
  greenGlowLeft.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = greenGlowLeft;
  ctx.fillRect(0, 0, canvas.width, 300);

  const greenGlowRight = ctx.createRadialGradient(
    canvas.width * 0.76 - cameraX * 0.015,
    156,
    8,
    canvas.width * 0.76 - cameraX * 0.015,
    156,
    210,
  );
  greenGlowRight.addColorStop(0, `rgba(90, 255, 164, ${0.075 * greenAlpha})`);
  greenGlowRight.addColorStop(0.5, `rgba(34, 132, 92, ${0.045 * greenAlpha})`);
  greenGlowRight.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = greenGlowRight;
  ctx.fillRect(0, 0, canvas.width, 330);
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
    { baseX: 260, topY: 36, len: 116, amp: 18, alpha: 0.1, parallax: 0.02 },
    { baseX: 980, topY: 48, len: 126, amp: 16, alpha: 0.085, parallax: 0.016 },
    { baseX: 520, topY: 24, len: 108, amp: 15, alpha: 0.075, parallax: 0.022 },
    { baseX: 1320, topY: 30, len: 132, amp: 20, alpha: 0.08, parallax: 0.018 },
  ];

  for (let index = 0; index < strikeCount; index += 1) {
    const strike = baseStrikes[index];
    const pulse = Math.sin(time + index * 1.6) * 0.5 + 0.5;
    const x = ((strike.baseX - cameraX * strike.parallax) % (canvas.width + 140)) - 70;

    ctx.strokeStyle = `rgba(168, 210, 255, ${strike.alpha * (0.35 + pulse * 0.65) * (0.5 + effectsIntensity * 0.7)})`;
    ctx.lineWidth = 1.1 + effectsIntensity * 0.7;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(x, strike.topY);

    const segments = 5;
    for (let segment = 1; segment <= segments; segment += 1) {
      const offsetX = Math.sin(time * 1.12 + segment * 0.8 + index) * strike.amp;
      const px = x + offsetX * (segment % 2 === 0 ? -1 : 1);
      const py = strike.topY + strike.len * (segment / segments);
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
  const time = performance.now() * 0.00125;
  const sparkCount =
    effectsIntensity <= 0.15
      ? 6
      : effectsIntensity <= 0.35
        ? 10
        : effectsIntensity <= 0.65
          ? 16
          : effectsIntensity <= 0.85
            ? 22
            : 28;

  for (let index = 0; index < sparkCount; index += 1) {
    const spacing = 108;
    const baseX = ((index * spacing) - cameraX * 0.026) % (canvas.width + 110);
    const x = baseX < 0 ? baseX + canvas.width + 110 : baseX;
    const y = 92 + (index % 6) * 44 + Math.sin(time + index * 0.8) * (5 + effectsIntensity * 6);
    const size = 0.9 + (index % 3) * 0.4 + effectsIntensity * 0.55;
    const alpha =
      0.06 + (Math.sin(time * 1.4 + index * 1.5) * 0.5 + 0.5) * (0.08 + effectsIntensity * 0.16);

    const glow = ctx.createRadialGradient(x, y, 0.5, x, y, 10 + effectsIntensity * 7);
    glow.addColorStop(0, `rgba(154, 255, 190, ${alpha + 0.18})`);
    glow.addColorStop(0.42, `rgba(78, 224, 142, ${alpha})`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, 7 + effectsIntensity * 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(214, 255, 226, ${alpha + 0.14})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFloatingAsh(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  cameraX: number,
  effectsIntensity: number,
): void {
  const time = performance.now() * 0.00042;
  const ashCount = 18 + Math.floor(effectsIntensity * 18);

  for (let index = 0; index < ashCount; index += 1) {
    const x =
      (((index * 82) - cameraX * 0.012 + Math.sin(time + index) * 24) % (canvas.width + 60)) + 8;
    const y = 50 + (index % 9) * 58 + Math.cos(time * 1.5 + index) * 8;

    ctx.fillStyle = 'rgba(190, 210, 196, 0.06)';
    ctx.beginPath();
    ctx.arc(x, y, 1 + (index % 2) * 0.6, 0, Math.PI * 2);
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

    ctx.fillStyle = 'rgba(12, 14, 20, 0.42)';
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

    ctx.fillStyle = 'rgba(17, 14, 18, 0.54)';
    ctx.fillRect(x + 38, 444, 18, 108);

    ctx.strokeStyle = 'rgba(42, 24, 28, 0.38)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x + 46, 460);
    ctx.lineTo(x + 24, 430);
    ctx.moveTo(x + 46, 482);
    ctx.lineTo(x + 72, 448);
    ctx.stroke();
  }
}

function drawForegroundTrees(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  canvasWidth: number,
): void {
  for (let index = 0; index < 7; index += 1) {
    const x = ((index * 310) - cameraX * 0.18) % (canvasWidth + 260);

    ctx.fillStyle = 'rgba(20, 17, 14, 0.34)';
    ctx.fillRect(x + 44, 404, 14, 140);

    ctx.fillStyle = 'rgba(18, 40, 22, 0.24)';
    ctx.beginPath();
    ctx.ellipse(x + 51, 410, 36, 24, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 30, 426, 28, 20, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 72, 430, 30, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(138, 46, 24, 0.16)';
    ctx.beginPath();
    ctx.arc(x + 28, 438, 3, 0, Math.PI * 2);
    ctx.arc(x + 66, 444, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawForegroundPlants(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  canvasWidth: number,
): void {
  for (let index = 0; index < 12; index += 1) {
    const x = ((index * 180) - cameraX * 0.23) % (canvasWidth + 180);

    ctx.fillStyle = 'rgba(20, 30, 20, 0.26)';
    ctx.fillRect(x + 18, 538, 8, 34);

    ctx.beginPath();
    ctx.ellipse(x + 10, 548, 14, 8, -0.4, 0, Math.PI * 2);
    ctx.ellipse(x + 34, 544, 16, 9, 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(76, 36, 22, 0.16)';
    ctx.beginPath();
    ctx.arc(x + 28, 548, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawForegroundFog(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  effectsIntensity: number,
): void {
  const haze = ctx.createLinearGradient(0, 410, 0, canvas.height);
  haze.addColorStop(0, 'rgba(20, 18, 22, 0)');
  haze.addColorStop(0.36, `rgba(24, 18, 20, ${0.025 + effectsIntensity * 0.035})`);
  haze.addColorStop(0.7, `rgba(16, 14, 18, ${0.05 + effectsIntensity * 0.05})`);
  haze.addColorStop(1, `rgba(6, 6, 8, ${0.1 + effectsIntensity * 0.1})`);
  ctx.fillStyle = haze;
  ctx.fillRect(0, 390, canvas.width, canvas.height - 390);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
