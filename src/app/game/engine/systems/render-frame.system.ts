import { Boss } from '../../domain/bosses/boss.model';
import { BossProjectile } from '../../domain/bosses/boss-projectile.model';
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
import {
  drawEnemies,
  drawEnemyProjectiles,
} from '../render/enemy-renderer';
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

export interface RenderFrameParams {
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

  paused: boolean;
  bossIntroPending: boolean;
  respawningTimer: number;
  specialFlashTimer: number;
  ending: 'game-over' | 'victory' | null;
}

export function renderFrame({
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
  paused,
  bossIntroPending,
  respawningTimer,
  specialFlashTimer,
  ending,
}: RenderFrameParams): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground(ctx, canvas, cameraX);

  ctx.save();
  ctx.translate(-cameraX, 0);

  drawTunnels(ctx, tunnels);
  drawPlatforms(ctx, platforms);
  drawHazards(ctx, hazards);
  drawCollectibles(ctx, collectibles);
  drawChests(ctx, chests);
  drawSpecialStrikes(ctx, specialStrikes);
  drawEnemies(ctx, enemies);
  drawEnemyProjectiles(ctx, enemyProjectiles);
  drawBullets(ctx, bullets);
  drawBoss(ctx, boss);
  drawBossProjectiles(ctx, bossProjectiles);
  drawSpecialExplosions(ctx, specialExplosions);
  drawBurstParticles(ctx, burstParticles);

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
    '',
    false,
  );

  void paused;
  void bossIntroPending;
  void specialFlashTimer;
  void ending;
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
  paused,
  bossIntroPending,
  respawningTimer,
  specialFlashTimer,
  ending,
  formattedTime,
  isTimeWarning,
  isTimeExceeded,
}: RenderFrameParams & {
  formattedTime: string;
  isTimeWarning: boolean;
  isTimeExceeded: boolean;
}): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground(ctx, canvas, cameraX);

  ctx.save();
  ctx.translate(-cameraX, 0);

  drawTunnels(ctx, tunnels);
  drawPlatforms(ctx, platforms);
  drawHazards(ctx, hazards);
  drawCollectibles(ctx, collectibles);
  drawChests(ctx, chests);
  drawSpecialStrikes(ctx, specialStrikes);
  drawEnemies(ctx, enemies);
  drawEnemyProjectiles(ctx, enemyProjectiles);
  drawBullets(ctx, bullets);
  drawBoss(ctx, boss);
  drawBossProjectiles(ctx, bossProjectiles);
  drawSpecialExplosions(ctx, specialExplosions);
  drawBurstParticles(ctx, burstParticles);

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
  );

  if (specialFlashTimer > 0) {
    const pulse = 0.5 + Math.sin(performance.now() * 0.03) * 0.5;
    const alpha = Math.min(specialFlashTimer * 0.5, 0.34) * (0.72 + pulse * 0.28);
    ctx.fillStyle = `rgba(255, 166, 80, ${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (respawningTimer > 0) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.34)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (paused || bossIntroPending) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (paused) {
    ctx.fillStyle = '#f4e7c7';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      'PAUSADO',
      canvas.width / 2,
      canvas.height / 2 - 20,
    );

    ctx.font = '20px Arial';
    ctx.fillStyle = '#d5d8de';
    ctx.fillText(
      'Pressione ESC para continuar',
      canvas.width / 2,
      canvas.height / 2 + 20,
    );
  }

  if (isTimeExceeded && !ending) {
    ctx.fillStyle = 'rgba(30, 0, 0, 0.42)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function drawBullets(
  ctx: CanvasRenderingContext2D,
  bullets: Bullet[],
): void {
  for (const bullet of bullets) {
    const centerX = bullet.x + bullet.width / 2;
    const centerY = bullet.y + bullet.height / 2;

    if (bullet.kind === 'special') {
      const glow = ctx.createRadialGradient(
        centerX,
        centerY,
        2,
        centerX,
        centerY,
        34,
      );
      glow.addColorStop(0, 'rgba(255, 244, 188, 0.96)');
      glow.addColorStop(0.2, 'rgba(255, 181, 92, 0.92)');
      glow.addColorStop(0.55, 'rgba(130, 232, 255, 0.54)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffe3a8';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 15, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff9b61';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 11, 5.4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(130, 232, 255, 0.9)';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(
        centerX - Math.sign(bullet.vx || 1) * 24,
        centerY,
      );
      ctx.lineTo(
        centerX - Math.sign(bullet.vx || 1) * 10,
        centerY,
      );
      ctx.stroke();

      continue;
    }

    if (bullet.kind === 'upward') {
      const glow = ctx.createRadialGradient(
        centerX,
        centerY,
        1,
        centerX,
        centerY,
        16,
      );
      glow.addColorStop(0, 'rgba(255, 228, 180, 0.92)');
      glow.addColorStop(0.35, 'rgba(255, 136, 57, 0.5)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffd7a6';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX, bullet.y + bullet.height);
      ctx.lineTo(centerX, bullet.y + 4);
      ctx.stroke();

      ctx.fillStyle = '#ff9b61';
      ctx.beginPath();
      ctx.moveTo(centerX, bullet.y);
      ctx.lineTo(centerX - 5, bullet.y + 8);
      ctx.lineTo(centerX + 5, bullet.y + 8);
      ctx.closePath();
      ctx.fill();

      continue;
    }

    const glow = ctx.createRadialGradient(
      centerX,
      centerY,
      1,
      centerX,
      centerY,
      12,
    );
    glow.addColorStop(0, 'rgba(255, 192, 120, 0.85)');
    glow.addColorStop(0.45, 'rgba(255, 124, 72, 0.45)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff9b61';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(48, 14, 20, 0.65)';
    ctx.beginPath();
    ctx.ellipse(
      centerX - Math.sign(bullet.vx || 1) * 5,
      centerY,
      4,
      2,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}
