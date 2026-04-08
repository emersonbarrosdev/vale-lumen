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
  /**
   * Antes estava muito pesado/escuro e passava sensação
   * de plataforma escondida ou atrás de camada.
   * Agora o teto continua existindo, mas bem mais discreto.
   */
  const shadow = ctx.createLinearGradient(
    tunnel.x,
    tunnel.ceilingY,
    tunnel.x,
    tunnel.ceilingY + tunnel.thickness,
  );
  shadow.addColorStop(0, 'rgba(26, 24, 28, 0.72)');
  shadow.addColorStop(0.4, 'rgba(18, 16, 20, 0.76)');
  shadow.addColorStop(1, 'rgba(10, 10, 14, 0.8)');

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

  ctx.fillStyle = 'rgba(210, 178, 128, 0.12)';
  ctx.fillRect(tunnel.x, tunnel.ceilingY, tunnel.width, 2);

  ctx.strokeStyle = 'rgba(22, 18, 16, 0.34)';
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

  ctx.fillStyle = 'rgba(42, 34, 30, 0.52)';

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
  /**
   * sombra bem mais curta para não “apagar” plataforma
   */
  const shade = ctx.createLinearGradient(
    tunnel.x,
    tunnel.ceilingY + tunnel.thickness,
    tunnel.x,
    tunnel.ceilingY + tunnel.thickness + 24,
  );
  shade.addColorStop(0, 'rgba(0, 0, 0, 0.18)');
  shade.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = shade;
  ctx.fillRect(
    tunnel.x,
    tunnel.ceilingY + tunnel.thickness,
    tunnel.width,
    24,
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
