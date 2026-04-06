import { Hero } from '../../domain/hero/hero.model';
import { InputManager } from '../input-manager';
import { Platform } from '../../domain/world/platform.model';
import { Hazard } from '../../domain/world/hazard.model';
import { Tunnel } from '../../domain/world/tunnel.model';
import { EngineRuntime } from '../runtime/engine-runtime.model';

export interface HeroUpdateParams {
  hero: Hero;
  input: InputManager;
  runtime: EngineRuntime;
  worldWidth: number;
  gravity: number;
  fallBoost: number;
  deltaTime: number;
  platforms: Platform[];
  hazards: Hazard[];
  tunnels: Tunnel[];
  fireBullet: (kind: 'forward' | 'upward') => void;
  activateSpecial: () => void;
}

export function updateHeroSystem({
  hero,
  input,
  runtime,
  worldWidth,
  gravity,
  fallBoost,
  deltaTime,
  platforms,
  hazards,
  tunnels,
  fireBullet,
  activateSpecial,
}: HeroUpdateParams): void {
  const wasOnGround = hero.onGround;
  const isLockedInUpCast = hero.castTimer > 0 && hero.castAim === 'up';

  hero.animationTime += deltaTime;
  hero.shootCooldown = Math.max(0, hero.shootCooldown - deltaTime);
  hero.dashCooldown = Math.max(0, hero.dashCooldown - deltaTime);
  hero.invulnerabilityTimer = Math.max(0, hero.invulnerabilityTimer - deltaTime);
  hero.castTimer = Math.max(0, hero.castTimer - deltaTime);
  hero.hurtTimer = Math.max(0, hero.hurtTimer - deltaTime);
  hero.landingTimer = Math.max(0, hero.landingTimer - deltaTime);

  if (hero.castTimer <= 0) {
    hero.castDuration = 0;
    hero.castAim = 'forward';
  }

  const movingLeft =
    !isLockedInUpCast &&
    input.isActionPressed('moveLeft');

  const movingRight =
    !isLockedInUpCast &&
    input.isActionPressed('moveRight');

  const runBlend = Math.min(1, deltaTime * 11);
  const targetVx = movingLeft && !movingRight
    ? -hero.speed
    : movingRight && !movingLeft
      ? hero.speed
      : 0;

  hero.vx += (targetVx - hero.vx) * runBlend;

  if (Math.abs(hero.vx) < 4) {
    hero.vx = 0;
  }

  if (movingLeft && !movingRight) {
    hero.direction = -1;
  } else if (movingRight && !movingLeft) {
    hero.direction = 1;
  }

  if (
    !isLockedInUpCast &&
    input.isActionJustPressed('jump') &&
    hero.jumpsRemaining > 0
  ) {
    hero.vy = -hero.jumpForce;
    hero.jumpsRemaining -= 1;
    hero.onGround = false;
  }

  if (
    !isLockedInUpCast &&
    input.isActionJustPressed('dash') &&
    hero.dashCooldown <= 0
  ) {
    hero.vx = hero.direction * 610;
    hero.dashCooldown = 0.7;
  }

  if (
    !isLockedInUpCast &&
    input.isActionJustPressed('attack') &&
    hero.shootCooldown <= 0
  ) {
    fireBullet('forward');
    hero.shootCooldown = 0.22;
    hero.castTimer = 0.16;
    hero.castDuration = 0.16;
    hero.castAim = 'forward';
  }

  if (
    !isLockedInUpCast &&
    input.isActionJustPressed('upAttack') &&
    hero.shootCooldown <= 0
  ) {
    fireBullet('upward');
    hero.shootCooldown = 0.28;
    hero.castTimer = 0.32;
    hero.castDuration = 0.32;
    hero.castAim = 'up';
    hero.vx = 0;
  }

  if (
    !isLockedInUpCast &&
    input.isActionJustPressed('special') &&
    runtime.specialCharge >= 100 &&
    !runtime.specialSequenceActive
  ) {
    activateSpecial();
    hero.castTimer = 2.1;
    hero.castDuration = 2.1;
    hero.castAim = 'forward';
  }

  const gravityThisFrame =
    hero.vy > 0 ? gravity + fallBoost : gravity;

  hero.vy += gravityThisFrame * deltaTime;

  moveHeroHorizontally(hero, deltaTime, platforms, hazards);
  moveHeroVertically(hero, deltaTime, platforms);
  resolveTunnelCeilingCollision(hero, tunnels);

  if (!wasOnGround && hero.onGround) {
    hero.landingTimer = 0.16;
  }

  if (hero.x < 0) {
    hero.x = 0;
  }

  if (hero.x + hero.width > worldWidth) {
    hero.x = worldWidth - hero.width;
  }

  updateHeroState(hero);
}

function updateHeroState(hero: Hero): void {
  if (hero.hurtTimer > 0) {
    hero.state = 'hurt';
    return;
  }

  if (hero.castTimer > 0) {
    hero.state = 'cast';
    return;
  }

  if (!hero.onGround) {
    hero.state = hero.vy < 0 ? 'jump' : 'fall';
    return;
  }

  if (Math.abs(hero.vx) > 8) {
    hero.state = 'run';
    return;
  }

  hero.state = 'idle';
}

function moveHeroHorizontally(
  hero: Hero,
  deltaTime: number,
  platforms: Platform[],
  hazards: Hazard[],
): void {
  hero.x += hero.vx * deltaTime;

  for (const platform of platforms) {
    if (!rectsOverlap(hero, platform)) {
      continue;
    }

    if (hero.vx > 0) {
      hero.x = platform.x - hero.width;
    } else if (hero.vx < 0) {
      hero.x = platform.x + platform.width;
    }
  }

  for (const hazard of hazards) {
    if (!hazard.active || !rectsOverlap(hero, hazard)) {
      continue;
    }

    if (hero.vx > 0) {
      hero.x = hazard.x - hero.width;
    } else if (hero.vx < 0) {
      hero.x = hazard.x + hazard.width;
    }
  }
}

function moveHeroVertically(
  hero: Hero,
  deltaTime: number,
  platforms: Platform[],
): void {
  hero.onGround = false;
  hero.y += hero.vy * deltaTime;

  for (const platform of platforms) {
    if (!rectsOverlap(hero, platform)) {
      continue;
    }

    if (hero.vy > 0) {
      hero.y = platform.y - hero.height;
      hero.vy = 0;
      hero.onGround = true;
      hero.jumpsRemaining = hero.maxJumps;
    } else if (hero.vy < 0) {
      hero.y = platform.y + platform.height;
      hero.vy = 0;
    }
  }
}

function resolveTunnelCeilingCollision(
  hero: Hero,
  tunnels: Tunnel[],
): void {
  if (hero.vy >= 0) {
    return;
  }

  for (const tunnel of tunnels) {
    const heroRight = hero.x + hero.width;
    const heroLeft = hero.x;
    const overlapsX = heroRight > tunnel.x && heroLeft < tunnel.x + tunnel.width;

    if (!overlapsX) {
      continue;
    }

    const heroTop = hero.y;
    const roofBottom = tunnel.ceilingY + tunnel.thickness;

    if (heroTop <= roofBottom && heroTop >= tunnel.ceilingY - 18) {
      hero.y = roofBottom;
      hero.vy = 0;
    }
  }
}

function rectsOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
