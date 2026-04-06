import { BurstParticle } from '../../domain/combat/burst-particle.model';
import { SpecialStrike } from '../../domain/combat/special-strike.model';
import { Chest } from '../../domain/world/chest.model';
import { Collectible } from '../../domain/world/collectible.model';
import { Hazard } from '../../domain/world/hazard.model';
import { Platform } from '../../domain/world/platform.model';
import { Tunnel } from '../../domain/world/tunnel.model';
import { drawBackground as drawBackgroundLayer } from './background-renderer';
import { drawChests as drawWorldChests } from './world/chest-renderer';
import { drawCollectibles as drawWorldCollectibles } from './world/collectible-renderer';
import {
  drawBurstParticles as drawWorldBurstParticles,
  drawSpecialStrikes as drawWorldSpecialStrikes,
} from './world/effects-renderer';
import { drawHazards as drawWorldHazards } from './world/hazard-renderer';
import { drawPlatforms as drawWorldPlatforms } from './world/platform-renderer';
import { drawTunnels as drawWorldTunnels } from './world/tunnel-renderer';

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  cameraX: number,
): void {
  drawBackgroundLayer(ctx, canvas, cameraX);
}

export function drawPlatforms(
  ctx: CanvasRenderingContext2D,
  platforms: Platform[],
): void {
  drawWorldPlatforms(ctx, platforms);
}

export function drawHazards(
  ctx: CanvasRenderingContext2D,
  hazards: Hazard[],
): void {
  drawWorldHazards(ctx, hazards);
}

export function drawCollectibles(
  ctx: CanvasRenderingContext2D,
  collectibles: Collectible[],
): void {
  drawWorldCollectibles(ctx, collectibles);
}

export function drawChests(
  ctx: CanvasRenderingContext2D,
  chests: Chest[],
): void {
  drawWorldChests(ctx, chests);
}

export function drawSpecialStrikes(
  ctx: CanvasRenderingContext2D,
  specialStrikes: SpecialStrike[],
): void {
  drawWorldSpecialStrikes(ctx, specialStrikes);
}

export function drawBurstParticles(
  ctx: CanvasRenderingContext2D,
  burstParticles: BurstParticle[],
): void {
  drawWorldBurstParticles(ctx, burstParticles);
}

export function drawTunnels(
  ctx: CanvasRenderingContext2D,
  tunnels: Tunnel[],
): void {
  drawWorldTunnels(ctx, tunnels);
}
