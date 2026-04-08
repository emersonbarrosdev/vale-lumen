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
  activateMegaSpecial: () => void;
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
  activateMegaSpecial,
}: HeroUpdateParams): void {
  const wasOnGround = hero.onGround;
  const isLockedInSpecialCast =
    hero.castTimer > 0 && (hero.specialCasting || hero.megaCasting);

  updateFallingPlatforms(platforms, hero, deltaTime);

  hero.animationTime += deltaTime;
  hero.shootCooldown = Math.max(0, hero.shootCooldown - deltaTime);
  hero.dashCooldown = Math.max(0, hero.dashCooldown - deltaTime);
  hero.invulnerabilityTimer = Math.max(0, hero.invulnerabilityTimer - deltaTime);
  hero.castTimer = Math.max(0, hero.castTimer - deltaTime);
  hero.hurtTimer = Math.max(0, hero.hurtTimer - deltaTime);
  hero.landingTimer = Math.max(0, hero.landingTimer - deltaTime);
  hero.shieldGraceTimer = Math.max(0, hero.shieldGraceTimer - deltaTime);
  hero.megaVisualTimer = Math.max(0, hero.megaVisualTimer - deltaTime);
  runtime.megaComboTimer = Math.max(0, runtime.megaComboTimer - deltaTime);

  if (hero.castTimer <= 0) {
    hero.castDuration = 0;
    hero.castAim = 'forward';
    hero.specialCasting = false;
    hero.megaCasting = false;
  }

  const lookingUp =
    !isLockedInSpecialCast &&
    input.isActionPressed('upAttack');

  hero.aimingUp =
    lookingUp &&
    hero.hurtTimer <= 0 &&
    !hero.specialCasting &&
    !hero.megaCasting;

  const movingLeft =
    !hero.aimingUp &&
    !isLockedInSpecialCast &&
    input.isActionPressed('moveLeft');

  const movingRight =
    !hero.aimingUp &&
    !isLockedInSpecialCast &&
    input.isActionPressed('moveRight');

  const targetVx =
    movingLeft && !movingRight
      ? -hero.speed
      : movingRight && !movingLeft
        ? hero.speed
        : 0;

  const acceleration = hero.onGround ? 18 : 12;
  const runBlend = Math.min(1, deltaTime * acceleration);

  hero.vx += (targetVx - hero.vx) * runBlend;

  if (!movingLeft && !movingRight && Math.abs(hero.vx) < 4) {
    hero.vx = 0;
  }

  if (movingLeft && !movingRight) {
    hero.direction = -1;
  } else if (movingRight && !movingLeft) {
    hero.direction = 1;
  }

  if (
    !isLockedInSpecialCast &&
    input.isActionJustPressed('jump') &&
    hero.jumpsRemaining > 0
  ) {
    hero.vy = -hero.jumpForce;
    hero.jumpsRemaining -= 1;
    hero.onGround = false;
  }

  const attackJustPressed = input.isActionJustPressed('attack');
  const specialJustPressed = input.isActionJustPressed('special');

  if (
    !isLockedInSpecialCast &&
    attackJustPressed &&
    specialJustPressed &&
    runtime.ignitionReady
  ) {
    activateMegaSpecial();
    hero.castTimer = 0.54;
    hero.castDuration = 0.54;
    hero.castAim = 'forward';
    hero.shootCooldown = Math.max(hero.shootCooldown, 0.55);
    hero.specialCasting = false;
    hero.megaCasting = true;
    hero.aimingUp = false;
  } else if (
    !isLockedInSpecialCast &&
    attackJustPressed &&
    hero.shootCooldown <= 0
  ) {
    if (hero.aimingUp) {
      fireBullet('upward');
      hero.shootCooldown = 0.26;
      hero.castTimer = 0.26;
      hero.castDuration = 0.26;
      hero.castAim = 'up';
    } else {
      fireBullet('forward');
      hero.shootCooldown = 0.2;
      hero.castTimer = 0.14;
      hero.castDuration = 0.14;
      hero.castAim = 'forward';
      runtime.megaComboTimer = runtime.ignitionReady ? 0.14 : 0;
    }

    hero.specialCasting = false;
    hero.megaCasting = false;
  }

  if (
    !isLockedInSpecialCast &&
    specialJustPressed &&
    runtime.ignitionReady &&
    runtime.megaComboTimer > 0
  ) {
    activateMegaSpecial();
    hero.castTimer = 0.54;
    hero.castDuration = 0.54;
    hero.castAim = 'forward';
    hero.shootCooldown = Math.max(hero.shootCooldown, 0.55);
    hero.specialCasting = false;
    hero.megaCasting = true;
    hero.aimingUp = false;
  } else if (
    !isLockedInSpecialCast &&
    specialJustPressed &&
    runtime.specialSegmentsReady >= 1
  ) {
    activateSpecial();
    hero.castTimer = 0.34;
    hero.castDuration = 0.34;
    hero.castAim = 'forward';
    hero.shootCooldown = Math.max(hero.shootCooldown, 0.35);
    hero.specialCasting = true;
    hero.megaCasting = false;
    hero.aimingUp = false;
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

function updateFallingPlatforms(
  platforms: Platform[],
  hero: Hero,
  deltaTime: number,
): void {
  for (const platform of platforms) {
    if (platform.active === false) {
      continue;
    }

    if (platform.startY === undefined) {
      platform.startY = platform.y;
    }

    if (!platform.fallAway) {
      continue;
    }

    if (!platform.triggered) {
      platform.triggerTimer = platform.fallDelay ?? 0.35;
      platform.falling = false;
      platform.active = true;
      continue;
    }

    if (!platform.falling) {
      platform.triggerTimer = Math.max(0, (platform.triggerTimer ?? 0) - deltaTime);

      if ((platform.triggerTimer ?? 0) <= 0) {
        platform.falling = true;
      }

      continue;
    }

    const deltaY = (platform.fallSpeed ?? 360) * deltaTime;
    platform.y += deltaY;

    if (isHeroStandingOnPlatform(hero, platform)) {
      hero.y += deltaY;
      hero.onGround = true;
      hero.vy = 0;
    }

    if (platform.y > 900) {
      platform.active = false;
    }
  }
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
    if (platform.active === false || !rectsOverlap(hero, platform)) {
      continue;
    }

    if (hero.vx > 0) {
      hero.x = platform.x - hero.width;
    } else if (hero.vx < 0) {
      hero.x = platform.x + platform.width;
    }
  }

  for (const hazard of hazards) {
    if (!hazard.active) {
      continue;
    }

    if (hazard.type === 'goo' || hazard.type === 'geyser') {
      continue;
    }

    const hitbox = getSolidHazardHorizontalHitbox(hazard);

    if (!hitbox || !rectsOverlap(hero, hitbox)) {
      continue;
    }

    if (hero.vx > 0) {
      hero.x = hitbox.x - hero.width;
    } else if (hero.vx < 0) {
      hero.x = hitbox.x + hitbox.width;
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
    if (platform.active === false || !rectsOverlap(hero, platform)) {
      continue;
    }

    if (hero.vy > 0) {
      hero.y = platform.y - hero.height;
      hero.vy = 0;
      hero.onGround = true;
      hero.jumpsRemaining = hero.maxJumps;

      if (platform.fallAway && !platform.triggered) {
        platform.triggered = true;
        platform.triggerTimer = platform.fallDelay ?? 0.35;
      }
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

function isHeroStandingOnPlatform(hero: Hero, platform: Platform): boolean {
  const heroBottom = hero.y + hero.height;
  const platformTop = platform.y;
  const heroRight = hero.x + hero.width;
  const platformRight = platform.x + platform.width;

  const overlapsX = heroRight > platform.x + 8 && hero.x < platformRight - 8;
  const nearTop = Math.abs(heroBottom - platformTop) <= 10;

  return overlapsX && nearTop;
}

function getSolidHazardHorizontalHitbox(
  hazard: Hazard,
): { x: number; y: number; width: number; height: number } | null {
  switch (hazard.type) {
    case 'spike':
      return {
        x: hazard.x + 4,
        y: hazard.y + 2,
        width: Math.max(0, hazard.width - 8),
        height: Math.max(0, hazard.height - 2),
      };

    case 'crystal':
      return {
        x: hazard.x + hazard.width * 0.14,
        y: hazard.y + 4,
        width: hazard.width * 0.72,
        height: hazard.height - 6,
      };

    default:
      return null;
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
