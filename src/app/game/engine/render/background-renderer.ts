export function drawBackground(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  cameraX: number,
): void {
  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  skyGradient.addColorStop(0, '#04060a');
  skyGradient.addColorStop(0.18, '#0a1017');
  skyGradient.addColorStop(0.42, '#0d1118');
  skyGradient.addColorStop(0.72, '#0a0c11');
  skyGradient.addColorStop(1, '#020304');

  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawSkyVoidClouds(ctx, canvas, cameraX);
  drawFarStormGlow(ctx, canvas, cameraX);
  drawLightningCuts(ctx, canvas, cameraX);
  drawGreenStormSparks(ctx, canvas, cameraX);

  drawMountainLayer(
    ctx,
    cameraX,
    canvas.width,
    0.05,
    'rgba(9, 12, 18, 0.98)',
    [452, 330, 394, 250, 406, 218, 372, 238, 720],
  );

  drawMountainLayer(
    ctx,
    cameraX,
    canvas.width,
    0.1,
    'rgba(16, 19, 27, 0.94)',
    [520, 426, 476, 340, 502, 318, 460, 362, 720],
  );

  drawMountainLayer(
    ctx,
    cameraX,
    canvas.width,
    0.16,
    'rgba(24, 20, 30, 0.9)',
    [572, 496, 544, 444, 560, 416, 536, 466, 720],
  );

  drawRuinSilhouettes(ctx, cameraX, canvas.width);
  drawDeadForest(ctx, cameraX, canvas.width);
  drawForegroundFog(ctx, canvas);
  drawAbyssGlow(ctx, canvas);
}

function drawSkyVoidClouds(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  cameraX: number,
): void {
  const clouds = [
    { x: 140, y: 92, rx: 180, ry: 52, alpha: 0.06, parallax: 0.03 },
    { x: 520, y: 148, rx: 220, ry: 64, alpha: 0.045, parallax: 0.025 },
    { x: 930, y: 114, rx: 190, ry: 50, alpha: 0.055, parallax: 0.04 },
    { x: 1180, y: 186, rx: 260, ry: 72, alpha: 0.038, parallax: 0.03 },
  ];

  for (const cloud of clouds) {
    const x = ((cloud.x - cameraX * cloud.parallax) % (canvas.width + 420)) - 120;

    ctx.fillStyle = `rgba(8, 10, 14, ${cloud.alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, cloud.y, cloud.rx, cloud.ry, 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(20, 25, 32, ${cloud.alpha * 0.52})`;
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
): void {
  const orangeGlow = ctx.createRadialGradient(
    220 - cameraX * 0.02,
    130,
    10,
    220 - cameraX * 0.02,
    130,
    220,
  );
  orangeGlow.addColorStop(0, 'rgba(142, 34, 28, 0.12)');
  orangeGlow.addColorStop(0.4, 'rgba(84, 18, 22, 0.08)');
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
  greenGlow.addColorStop(0, 'rgba(80, 255, 160, 0.08)');
  greenGlow.addColorStop(0.5, 'rgba(36, 132, 92, 0.05)');
  greenGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = greenGlow;
  ctx.fillRect(0, 0, canvas.width, 320);
}

function drawLightningCuts(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  cameraX: number,
): void {
  const time = performance.now() * 0.0018;

  const strikes = [
    { baseX: 240, topY: 36, len: 126, amp: 22, alpha: 0.22, parallax: 0.02 },
    { baseX: 760, topY: 58, len: 102, amp: 16, alpha: 0.18, parallax: 0.015 },
    { baseX: 1130, topY: 30, len: 148, amp: 24, alpha: 0.16, parallax: 0.018 },
  ];

  for (let index = 0; index < strikes.length; index += 1) {
    const strike = strikes[index];
    const pulse = Math.sin(time + index * 1.7) * 0.5 + 0.5;
    const x = ((strike.baseX - cameraX * strike.parallax) % (canvas.width + 140)) - 70;

    ctx.strokeStyle = `rgba(182, 216, 255, ${strike.alpha * (0.35 + pulse * 0.65)})`;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(x, strike.topY);

    const segments = 6;
    for (let segment = 1; segment <= segments; segment += 1) {
      const t = segment / segments;
      const offsetX = Math.sin(time * 1.4 + segment * 0.9 + index) * strike.amp;
      const px = x + offsetX * (segment % 2 === 0 ? -1 : 1);
      const py = strike.topY + strike.len * t;
      ctx.lineTo(px, py);
    }

    ctx.stroke();

    ctx.strokeStyle = `rgba(230, 245, 255, ${strike.alpha * 0.45 * (0.4 + pulse * 0.6)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 3, strike.topY + 18);
    ctx.lineTo(x + 18, strike.topY + 50);
    ctx.lineTo(x + 6, strike.topY + 74);
    ctx.stroke();
  }
}

function drawGreenStormSparks(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  cameraX: number,
): void {
  const time = performance.now() * 0.0022;

  for (let index = 0; index < 18; index += 1) {
    const baseX = ((index * 93) - cameraX * 0.025) % (canvas.width + 90);
    const x = baseX < 0 ? baseX + canvas.width + 90 : baseX;
    const y = 110 + (index % 5) * 42 + Math.sin(time + index) * 8;
    const size = 1.2 + (index % 3) * 0.7;
    const alpha =
      0.14 + (Math.sin(time * 1.6 + index * 2.4) * 0.5 + 0.5) * 0.18;

    const glow = ctx.createRadialGradient(x, y, 0.5, x, y, 12);
    glow.addColorStop(0, `rgba(144, 255, 186, ${alpha + 0.15})`);
    glow.addColorStop(0.4, `rgba(65, 218, 132, ${alpha})`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(184, 255, 212, ${alpha + 0.2})`;
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
  for (let index = 0; index < 8; index += 1) {
    const x = ((index * 246) - cameraX * 0.12) % (canvasWidth + 220);

    ctx.fillStyle = 'rgba(12, 14, 20, 0.5)';
    ctx.fillRect(x + 20, 352, 42, 168);
    ctx.fillRect(x + 74, 400, 86, 120);

    ctx.fillStyle = 'rgba(28, 34, 40, 0.12)';
    ctx.fillRect(x + 32, 378, 10, 18);
    ctx.fillRect(x + 92, 434, 12, 20);
  }
}

function drawDeadForest(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  canvasWidth: number,
): void {
  for (let index = 0; index < 16; index += 1) {
    const x = ((index * 160) - cameraX * 0.21) % (canvasWidth + 220);

    ctx.fillStyle = 'rgba(17, 14, 18, 0.68)';
    ctx.fillRect(x + 38, 432, 18, 120);

    ctx.strokeStyle = 'rgba(42, 24, 28, 0.48)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x + 46, 454);
    ctx.lineTo(x + 24, 418);
    ctx.moveTo(x + 46, 474);
    ctx.lineTo(x + 72, 436);
    ctx.moveTo(x + 48, 494);
    ctx.lineTo(x + 22, 468);
    ctx.stroke();
  }
}

function drawForegroundFog(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
): void {
  const haze = ctx.createLinearGradient(0, 410, 0, canvas.height);
  haze.addColorStop(0, 'rgba(26, 18, 24, 0)');
  haze.addColorStop(0.36, 'rgba(36, 18, 22, 0.08)');
  haze.addColorStop(0.7, 'rgba(20, 16, 18, 0.14)');
  haze.addColorStop(1, 'rgba(6, 6, 8, 0.3)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, 390, canvas.width, canvas.height - 390);

  ctx.fillStyle = 'rgba(90, 110, 120, 0.035)';
  ctx.beginPath();
  ctx.ellipse(canvas.width * 0.28, 594, 250, 44, 0.02, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(canvas.width * 0.72, 620, 300, 54, -0.02, 0, Math.PI * 2);
  ctx.fill();
}

function drawAbyssGlow(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
): void {
  const abyss = ctx.createLinearGradient(0, 590, 0, canvas.height);
  abyss.addColorStop(0, 'rgba(255, 120, 56, 0)');
  abyss.addColorStop(0.08, 'rgba(134, 30, 22, 0.16)');
  abyss.addColorStop(0.22, 'rgba(56, 12, 16, 0.32)');
  abyss.addColorStop(0.52, 'rgba(10, 4, 8, 0.7)');
  abyss.addColorStop(1, 'rgba(0, 0, 0, 0.98)');
  ctx.fillStyle = abyss;
  ctx.fillRect(0, 590, canvas.width, canvas.height - 590);
}
