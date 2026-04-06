import { Tunnel } from '../../../domain/world/tunnel.model';

export function drawTunnels(
  ctx: CanvasRenderingContext2D,
  tunnels: Tunnel[],
): void {
  for (const tunnel of tunnels) {
    const shadow = ctx.createLinearGradient(
      tunnel.x,
      tunnel.ceilingY,
      tunnel.x,
      tunnel.ceilingY + tunnel.thickness,
    );
    shadow.addColorStop(0, 'rgba(18, 18, 24, 0.94)');
    shadow.addColorStop(1, 'rgba(8, 8, 12, 0.98)');

    ctx.fillStyle = shadow;
    ctx.fillRect(tunnel.x, tunnel.ceilingY, tunnel.width, tunnel.thickness);

    ctx.fillStyle = 'rgba(108, 96, 84, 0.28)';
    ctx.fillRect(tunnel.x, tunnel.ceilingY, tunnel.width, 3);

    for (let index = 12; index < tunnel.width - 8; index += 30) {
      ctx.strokeStyle = 'rgba(46, 36, 32, 0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tunnel.x + index, tunnel.ceilingY + 2);
      ctx.lineTo(tunnel.x + index - 4, tunnel.ceilingY + tunnel.thickness - 2);
      ctx.stroke();
    }
  }
}
