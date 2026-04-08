import { Tunnel } from '../../../domain/world/tunnel.model';

export function drawTunnels(
  ctx: CanvasRenderingContext2D,
  tunnels: Tunnel[],
): void {
  for (const tunnel of tunnels) {
    drawTunnelBackWall(ctx, tunnel);
    drawTunnelSideFrames(ctx, tunnel);
    drawTunnelCeiling(ctx, tunnel);
    drawTunnelTeeth(ctx, tunnel);
    drawTunnelShade(ctx, tunnel);
    drawTunnelFloorHint(ctx, tunnel);
  }
}

function drawTunnelBackWall(
  ctx: CanvasRenderingContext2D,
  tunnel: Tunnel,
): void {
  const recessHeight = 86;

  const backWall = ctx.createLinearGradient(
    tunnel.x,
    tunnel.ceilingY + tunnel.thickness,
    tunnel.x,
    tunnel.ceilingY + tunnel.thickness + recessHeight,
  );
  backWall.addColorStop(0, 'rgba(18, 16, 22, 0.22)');
  backWall.addColorStop(0.35, 'rgba(12, 10, 16, 0.16)');
  backWall.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = backWall;
  ctx.fillRect(
    tunnel.x + 8,
    tunnel.ceilingY + tunnel.thickness,
    Math.max(0, tunnel.width - 16),
    recessHeight,
  );
}

function drawTunnelSideFrames(
  ctx: CanvasRenderingContext2D,
  tunnel: Tunnel,
): void {
  const frameHeight = 64;
  const baseY = tunnel.ceilingY + tunnel.thickness - 4;

  const leftFrame = ctx.createLinearGradient(
    tunnel.x,
    baseY - 22,
    tunnel.x + 18,
    baseY + frameHeight,
  );
  leftFrame.addColorStop(0, 'rgba(84, 66, 50, 0.32)');
  leftFrame.addColorStop(1, 'rgba(28, 22, 20, 0.04)');
  ctx.fillStyle = leftFrame;
  ctx.beginPath();
  ctx.moveTo(tunnel.x, tunnel.ceilingY + 6);
  ctx.lineTo(tunnel.x + 16, baseY + 6);
  ctx.lineTo(tunnel.x + 6, baseY + frameHeight);
  ctx.lineTo(tunnel.x, baseY + frameHeight);
  ctx.closePath();
  ctx.fill();

  const rightFrame = ctx.createLinearGradient(
    tunnel.x + tunnel.width - 18,
    baseY - 22,
    tunnel.x + tunnel.width,
    baseY + frameHeight,
  );
  rightFrame.addColorStop(0, 'rgba(84, 66, 50, 0.32)');
  rightFrame.addColorStop(1, 'rgba(28, 22, 20, 0.04)');
  ctx.fillStyle = rightFrame;
  ctx.beginPath();
  ctx.moveTo(tunnel.x + tunnel.width, tunnel.ceilingY + 6);
  ctx.lineTo(tunnel.x + tunnel.width - 16, baseY + 6);
  ctx.lineTo(tunnel.x + tunnel.width - 6, baseY + frameHeight);
  ctx.lineTo(tunnel.x + tunnel.width, baseY + frameHeight);
  ctx.closePath();
  ctx.fill();
}

function drawTunnelCeiling(
  ctx: CanvasRenderingContext2D,
  tunnel: Tunnel,
): void {
  const shadow = ctx.createLinearGradient(
    tunnel.x,
    tunnel.ceilingY,
    tunnel.x,
    tunnel.ceilingY + tunnel.thickness,
  );
  shadow.addColorStop(0, 'rgba(42, 36, 30, 0.72)');
  shadow.addColorStop(0.38, 'rgba(26, 22, 22, 0.82)');
  shadow.addColorStop(1, 'rgba(12, 12, 16, 0.88)');

  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.moveTo(tunnel.x, tunnel.ceilingY + 2);

  for (let offset = 0; offset <= tunnel.width; offset += 18) {
    const yOffset = Math.sin((tunnel.x + offset) * 0.05) * 1.4;
    ctx.lineTo(tunnel.x + offset, tunnel.ceilingY + yOffset);
  }

  ctx.lineTo(tunnel.x + tunnel.width, tunnel.ceilingY + tunnel.thickness);
  ctx.lineTo(tunnel.x, tunnel.ceilingY + tunnel.thickness);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(240, 202, 138, 0.16)';
  ctx.fillRect(tunnel.x + 4, tunnel.ceilingY, Math.max(0, tunnel.width - 8), 2);

  ctx.strokeStyle = 'rgba(18, 14, 14, 0.42)';
  ctx.lineWidth = 1;
  ctx.strokeRect(tunnel.x, tunnel.ceilingY, tunnel.width, tunnel.thickness);
}

function drawTunnelTeeth(
  ctx: CanvasRenderingContext2D,
  tunnel: Tunnel,
): void {
  const toothCount = Math.max(5, Math.floor(tunnel.width / 42));
  const toothWidth = tunnel.width / toothCount;
  const baseY = tunnel.ceilingY + tunnel.thickness;

  ctx.fillStyle = 'rgba(42, 34, 30, 0.5)';

  for (let index = 0; index < toothCount; index += 1) {
    const x = tunnel.x + index * toothWidth;
    const tipDepth = 7 + (index % 2) * 4;

    ctx.beginPath();
    ctx.moveTo(x + 3, baseY - 1);
    ctx.lineTo(x + toothWidth / 2, baseY + tipDepth);
    ctx.lineTo(x + toothWidth - 3, baseY - 1);
    ctx.closePath();
    ctx.fill();
  }
}

function drawTunnelShade(
  ctx: CanvasRenderingContext2D,
  tunnel: Tunnel,
): void {
  const shade = ctx.createLinearGradient(
    tunnel.x,
    tunnel.ceilingY + tunnel.thickness,
    tunnel.x,
    tunnel.ceilingY + tunnel.thickness + 30,
  );
  shade.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
  shade.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = shade;
  ctx.fillRect(
    tunnel.x,
    tunnel.ceilingY + tunnel.thickness,
    tunnel.width,
    30,
  );

  for (let index = 14; index < tunnel.width - 8; index += 36) {
    ctx.strokeStyle = 'rgba(58, 44, 34, 0.24)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(tunnel.x + index, tunnel.ceilingY + 2);
    ctx.lineTo(tunnel.x + index - 3, tunnel.ceilingY + tunnel.thickness - 2);
    ctx.stroke();
  }
}

function drawTunnelFloorHint(
  ctx: CanvasRenderingContext2D,
  tunnel: Tunnel,
): void {
  const floorY = tunnel.ceilingY + tunnel.thickness + 54;

  const glow = ctx.createLinearGradient(
    tunnel.x,
    floorY,
    tunnel.x,
    floorY + 16,
  );
  glow.addColorStop(0, 'rgba(255, 176, 104, 0.08)');
  glow.addColorStop(1, 'rgba(255, 176, 104, 0)');

  ctx.fillStyle = glow;
  ctx.fillRect(tunnel.x + 12, floorY, Math.max(0, tunnel.width - 24), 16);

  ctx.strokeStyle = 'rgba(255, 206, 144, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(tunnel.x + 18, floorY + 1);
  ctx.lineTo(tunnel.x + tunnel.width - 18, floorY + 1);
  ctx.stroke();
}
