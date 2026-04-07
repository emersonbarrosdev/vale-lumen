import { Tunnel } from '../../../domain/world/tunnel.model';

export function drawTunnels(
  ctx: CanvasRenderingContext2D,
  tunnels: Tunnel[],
): void {
  for (const tunnel of tunnels) {
    drawTunnelCeiling(ctx, tunnel);
    drawTunnelTeeth(ctx, tunnel);
    drawTunnelShade(ctx, tunnel);
  }
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
  shadow.addColorStop(0, 'rgba(18, 18, 24, 0.96)');
  shadow.addColorStop(0.36, 'rgba(10, 10, 14, 0.98)');
  shadow.addColorStop(1, 'rgba(4, 4, 8, 1)');

  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.moveTo(tunnel.x, tunnel.ceilingY + 3);

  for (let offset = 0; offset <= tunnel.width; offset += 18) {
    const yOffset = Math.sin((tunnel.x + offset) * 0.06) * 2;
    ctx.lineTo(tunnel.x + offset, tunnel.ceilingY + yOffset);
  }

  ctx.lineTo(tunnel.x + tunnel.width, tunnel.ceilingY + tunnel.thickness);
  ctx.lineTo(tunnel.x, tunnel.ceilingY + tunnel.thickness);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(126, 114, 98, 0.24)';
  ctx.fillRect(tunnel.x, tunnel.ceilingY, tunnel.width, 3);

  ctx.strokeStyle = 'rgba(24, 18, 16, 0.82)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(tunnel.x, tunnel.ceilingY, tunnel.width, tunnel.thickness);
}

function drawTunnelTeeth(
  ctx: CanvasRenderingContext2D,
  tunnel: Tunnel,
): void {
  const toothCount = Math.max(5, Math.floor(tunnel.width / 42));
  const toothWidth = tunnel.width / toothCount;
  const baseY = tunnel.ceilingY + tunnel.thickness;

  ctx.fillStyle = 'rgba(34, 28, 30, 0.9)';

  for (let index = 0; index < toothCount; index += 1) {
    const x = tunnel.x + index * toothWidth;
    const tipDepth = 10 + (index % 2) * 6;

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
    tunnel.ceilingY + tunnel.thickness + 48,
  );
  shade.addColorStop(0, 'rgba(0, 0, 0, 0.34)');
  shade.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = shade;
  ctx.fillRect(
    tunnel.x,
    tunnel.ceilingY + tunnel.thickness,
    tunnel.width,
    48,
  );

  for (let index = 12; index < tunnel.width - 8; index += 34) {
    ctx.strokeStyle = 'rgba(46, 36, 32, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tunnel.x + index, tunnel.ceilingY + 2);
    ctx.lineTo(tunnel.x + index - 4, tunnel.ceilingY + tunnel.thickness - 2);
    ctx.stroke();
  }
}
