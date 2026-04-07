import { BossProjectile } from '../../domain/bosses/boss-projectile.model';
import { Boss } from '../../domain/bosses/boss.model';
import { BurstParticle } from '../../domain/combat/burst-particle.model';
import { Bullet } from '../../domain/combat/bullet.model';
import { SpecialExplosion } from '../../domain/combat/special-explosion.model';
import { SpecialStrike } from '../../domain/combat/special-strike.model';
import { EnemyProjectile } from '../../domain/enemies/enemy-projectile.model';
import { Enemy } from '../../domain/enemies/enemy.model';
import { Hero } from '../../domain/hero/hero.model';
import { Chest } from '../../domain/world/chest.model';
import { Collectible } from '../../domain/world/collectible.model';
import { Hazard } from '../../domain/world/hazard.model';
import { PhasePlayableData } from '../../domain/world/phase-playable-data.model';
import { Platform } from '../../domain/world/platform.model';
import { Tunnel } from '../../domain/world/tunnel.model';
import { drawBoss, drawBossProjectiles } from '../render/boss-renderer';
import { drawEnemies, drawEnemyProjectiles } from '../render/enemy-renderer';
import { drawHero } from '../render/hero-renderer';
import { drawHud } from '../render/hud-renderer';
import {
  drawBackground,
  drawBurstParticles,
  drawChests,
  drawCollectibles,
  drawHazards,
  drawPlatforms,
  drawSpecialExplosions,
  drawSpecialStrikes,
  drawTunnels,
} from '../render/world-renderer';

export interface RenderFrameWithHudParams {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  hero: Hero;
  boss: Boss;
  phaseData: PhasePlayableData;

  cameraX: number;
  bullets: Bullet[];
  bossProjectiles: BossProjectile[];
  enemyProjectiles: EnemyProjectile[];
  specialStrikes: SpecialStrike[];
  specialExplosions: SpecialExplosion[];
  burstParticles: BurstParticle[];

  platforms: Platform[];
  enemies: Enemy[];
  collectibles: Collectible[];
  chests: Chest[];
  hazards: Hazard[];
  tunnels: Tunnel[];

  score: number;
  specialCharge: number;
  lives: number;
  coins: number;
  specialHudLabel: string;

  paused: boolean;
  bossIntroPending: boolean;
  respawningTimer: number;
  specialFlashTimer: number;
  ending: 'game-over' | 'victory' | null;

  formattedTime: string;
  isTimeWarning: boolean;
  isTimeExceeded: boolean;
}

export function renderFrameWithHud({
  ctx,
  canvas,
  hero,
  boss,
  phaseData,

  cameraX,
  bullets,
  bossProjectiles,
  enemyProjectiles,
  specialStrikes,
  specialExplosions,
  burstParticles,

  platforms,
  enemies,
  collectibles,
  chests,
  hazards,
  tunnels,

  score,
  specialCharge,
  lives,
  coins,
  specialHudLabel,

  paused,
  bossIntroPending,
  respawningTimer,
  ending,

  formattedTime,
  isTimeWarning,
}: RenderFrameWithHudParams): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground(ctx, canvas, cameraX);

  ctx.save();
  ctx.translate(-cameraX, 0);

  drawPlatforms(ctx, platforms);
  drawHazards(ctx, hazards);
  drawCollectibles(ctx, collectibles);
  drawChests(ctx, chests);
  drawTunnels(ctx, tunnels);

  drawHeroBullets(ctx, bullets);
  drawSpecialStrikes(ctx, specialStrikes);
  drawSpecialExplosions(ctx, specialExplosions);
  drawBurstParticles(ctx, burstParticles);

  drawEnemies(ctx, enemies);
  drawEnemyProjectiles(ctx, enemyProjectiles);

  drawBoss(ctx, boss);
  drawBossProjectiles(ctx, bossProjectiles);

  if (respawningTimer <= 0) {
    drawHero(ctx, hero);
  }

  ctx.restore();

  drawHud(
    ctx,
    canvas,
    hero,
    specialCharge,
    score,
    coins,
    boss,
    phaseData.definition.boss.bossName,
    lives,
    formattedTime,
    isTimeWarning,
    specialHudLabel,
  );

  if (paused && !bossIntroPending) {
    drawCenterOverlay(ctx, canvas, 'PAUSADO');
  }

  if (ending === 'game-over') {
    drawCenterOverlay(ctx, canvas, 'GAME OVER');
  }

  if (ending === 'victory') {
    drawCenterOverlay(ctx, canvas, 'FASE LIMPA');
  }
}

function drawHeroBullets(
  ctx: CanvasRenderingContext2D,
  bullets: Bullet[],
): void {
  for (const bullet of bullets) {
    if (!bullet.active) {
      continue;
    }

    if (bullet.kind === 'upward') {
      drawUpwardBullet(ctx, bullet);
      continue;
    }

    if (bullet.kind === 'special' || bullet.kind === 'megaSpecial') {
      drawSpecialBullet(ctx, bullet);
      continue;
    }

    drawForwardBullet(ctx, bullet);
  }
}

function drawForwardBullet(
  ctx: CanvasRenderingContext2D,
  bullet: Bullet,
): void {
  const centerX = bullet.x + bullet.width / 2;
  const centerY = bullet.y + bullet.height / 2;

  const glow = ctx.createRadialGradient(centerX, centerY, 1, centerX, centerY, 14);
  glow.addColorStop(0, 'rgba(255, 220, 160, 0.95)');
  glow.addColorStop(0.4, 'rgba(255, 154, 82, 0.75)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffb15c';
  roundRect(ctx, bullet.x, bullet.y, bullet.width, bullet.height, 5);
  ctx.fill();

  ctx.fillStyle = '#fff1cb';
  roundRect(ctx, bullet.x + 4, bullet.y + 2, Math.max(4, bullet.width - 8), Math.max(3, bullet.height - 4), 3);
  ctx.fill();
}

function drawUpwardBullet(
  ctx: CanvasRenderingContext2D,
  bullet: Bullet,
): void {
  const centerX = bullet.x + bullet.width / 2;
  const centerY = bullet.y + bullet.height / 2;

  const glow = ctx.createRadialGradient(centerX, centerY, 1, centerX, centerY, 16);
  glow.addColorStop(0, 'rgba(255, 228, 175, 0.95)');
  glow.addColorStop(0.45, 'rgba(255, 164, 88, 0.78)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffb15c';
  roundRect(ctx, bullet.x, bullet.y, bullet.width, bullet.height, 5);
  ctx.fill();

  ctx.fillStyle = '#fff4d8';
  roundRect(ctx, bullet.x + 2, bullet.y + 4, Math.max(4, bullet.width - 4), Math.max(8, bullet.height - 8), 3);
  ctx.fill();
}

function drawSpecialBullet(
  ctx: CanvasRenderingContext2D,
  bullet: Bullet,
): void {
  const centerX = bullet.x + bullet.width / 2;
  const centerY = bullet.y + bullet.height / 2;
  const isMega = bullet.kind === 'megaSpecial';

  const glow = ctx.createRadialGradient(
    centerX,
    centerY,
    2,
    centerX,
    centerY,
    isMega ? 34 : 22,
  );
  glow.addColorStop(0, isMega ? 'rgba(255, 242, 210, 0.95)' : 'rgba(214, 251, 255, 0.95)');
  glow.addColorStop(0.35, isMega ? 'rgba(255, 132, 64, 0.85)' : 'rgba(130, 232, 255, 0.8)');
  glow.addColorStop(0.7, isMega ? 'rgba(255, 184, 116, 0.4)' : 'rgba(255, 238, 176, 0.3)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(
    centerX,
    centerY,
    isMega ? bullet.width * 0.9 : bullet.width * 0.75,
    isMega ? bullet.height * 1.1 : bullet.height * 0.9,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  const core = ctx.createLinearGradient(bullet.x, bullet.y, bullet.x + bullet.width, bullet.y);
  if (isMega) {
    core.addColorStop(0, '#ff7232');
    core.addColorStop(0.5, '#ffb15c');
    core.addColorStop(1, '#ffe1a8');
  } else {
    core.addColorStop(0, '#82e8ff');
    core.addColorStop(0.5, '#d6fbff');
    core.addColorStop(1, '#fff1be');
  }

  ctx.fillStyle = core;
  roundRect(ctx, bullet.x, bullet.y, bullet.width, bullet.height, Math.min(10, bullet.height / 2));
  ctx.fill();

  ctx.fillStyle = isMega ? 'rgba(255, 244, 216, 0.95)' : 'rgba(255,255,255,0.9)';
  roundRect(
    ctx,
    bullet.x + 6,
    bullet.y + 3,
    Math.max(8, bullet.width - 12),
    Math.max(6, bullet.height - 6),
    Math.min(8, (bullet.height - 6) / 2),
  );
  ctx.fill();
}

function drawCenterOverlay(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  text: string,
): void {
  const width = 280;
  const height = 64;
  const x = canvas.width / 2 - width / 2;
  const y = canvas.height / 2 - height / 2;

  ctx.save();

  ctx.fillStyle = 'rgba(8, 10, 16, 0.78)';
  roundRect(ctx, x, y, width, height, 14);
  ctx.fill();

  ctx.strokeStyle = 'rgba(244, 231, 199, 0.16)';
  ctx.lineWidth = 1.2;
  roundRect(ctx, x, y, width, height, 14);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff4df';
  ctx.font = 'bold 18px "Press Start 2P", Arial';
  ctx.fillText(text, canvas.width / 2, y + 39);

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));

  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
}
