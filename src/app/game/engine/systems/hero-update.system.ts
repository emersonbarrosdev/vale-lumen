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
  fireBullet: (kind: 'forward' | 'upward' | 'chargedForward') => void;
  playJumpSfx: () => void;
  activateSpecial: () => void;
  activateMegaSpecial: () => void;
  simpleChargedShotUnlocked: boolean;
}

const COYOTE_TIME = 0.09;
const JUMP_BUFFER_TIME = 0.11;
const JUMP_CUT_MULTIPLIER = 1.45;
const PEAK_GRAVITY_FACTOR = 0.56;
const SIMPLE_CHARGE_HOLD_TIME = 0.32;

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
  playJumpSfx,
  activateSpecial,
  activateMegaSpecial,
  simpleChargedShotUnlocked,
}: HeroUpdateParams): void {
  const wasOnGround = hero.onGround;
  const isLockedInSpecialCast =
    hero.castTimer > 0 && (hero.specialCasting || hero.megaCasting);

  updateFallingAndMovingPlatforms(platforms, hero, deltaTime);

  hero.animationTime += deltaTime;
  hero.shootCooldown = Math.max(0, hero.shootCooldown - deltaTime);
  hero.dashCooldown = Math.max(0, hero.dashCooldown - deltaTime);
  hero.invulnerabilityTimer = Math.max(0, hero.invulnerabilityTimer - deltaTime);
  hero.castTimer = Math.max(0, hero.castTimer - deltaTime);
  hero.hurtTimer = Math.max(0, hero.hurtTimer - deltaTime);
  hero.landingTimer = Math.max(0, hero.landingTimer - deltaTime);
  hero.shieldGraceTimer = Math.max(0, hero.shieldGraceTimer - deltaTime);
  hero.megaVisualTimer = Math.max(0, hero.megaVisualTimer - deltaTime);
  hero.coyoteTimer = Math.max(0, hero.coyoteTimer - deltaTime);
  hero.jumpBufferTimer = Math.max(0, hero.jumpBufferTimer - deltaTime);
  hero.attackHoldTimer = Math.max(0, hero.attackHoldTimer);
  runtime.megaComboTimer = Math.max(0, runtime.megaComboTimer - deltaTime);

  if (hero.castTimer <= 0) {
    hero.castDuration = 0;
    hero.castAim = 'forward';
    hero.specialCasting = false;
    hero.megaCasting = false;
  }

  const wantsToCrouch =
    hero.onGround &&
    !isLockedInSpecialCast &&
    hero.hurtTimer <= 0 &&
    input.isActionPressed('moveDown');

  hero.crouching = wantsToCrouch;

  const lookingUp =
    !isLockedInSpecialCast &&
    !hero.crouching &&
    input.isActionPressed('upAttack');

  hero.aimingUp =
    lookingUp &&
    hero.hurtTimer <= 0 &&
    !hero.specialCasting &&
    !hero.megaCasting;

  const movementLocked =
    hero.hurtTimer > 0 || isLockedInSpecialCast || hero.crouching;

  const movingLeft =
    !hero.aimingUp &&
    !movementLocked &&
    input.isActionPressed('moveLeft');

  const movingRight =
    !hero.aimingUp &&
    !movementLocked &&
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

  if ((hero.crouching || (!movingLeft && !movingRight)) && Math.abs(hero.vx) < 4) {
    hero.vx = 0;
  }

  if (hero.crouching && Math.abs(hero.vx) < 12) {
    hero.vx = 0;
  }

  if (movingLeft && !movingRight) {
    hero.direction = -1;
  } else if (movingRight && !movingLeft) {
    hero.direction = 1;
  }

  if (input.isActionJustPressed('jump')) {
    hero.jumpBufferTimer = JUMP_BUFFER_TIME;
  }

  if (wasOnGround) {
    hero.coyoteTimer = COYOTE_TIME;
  }

  tryConsumeJump(hero, playJumpSfx);

  const attackJustPressed = input.isActionJustPressed('attack');
  const attackPressed = input.isActionPressed('attack');
  const specialJustPressed = input.isActionJustPressed('special');

  if (
    !isLockedInSpecialCast &&
    !hero.crouching &&
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
    hero.attackHoldTimer = 0;
    hero.chargedShotPending = false;
  } else {
    handleAttackInput({
      hero,
      attackJustPressed,
      attackPressed,
      simpleChargedShotUnlocked,
      deltaTime,
      fireBullet,
      runtime,
    });
  }

  if (
    !isLockedInSpecialCast &&
    !hero.crouching &&
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
    !hero.crouching &&
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

  const jumpHeld = input.isActionPressed('jump');

  let gravityThisFrame =
    hero.vy > 0 ? gravity + fallBoost : gravity;

  if (hero.vy < 0 && Math.abs(hero.vy) < 140 && jumpHeld) {
    gravityThisFrame *= PEAK_GRAVITY_FACTOR;
  }

  if (hero.vy < 0 && !jumpHeld) {
    gravityThisFrame *= JUMP_CUT_MULTIPLIER;
  }

  hero.vy += gravityThisFrame * deltaTime;

  moveHeroHorizontally(hero, deltaTime, platforms, hazards);
  moveHeroVertically(hero, deltaTime, platforms);
  resolveTunnelCeilingCollision(hero, tunnels);

  if (!wasOnGround && hero.onGround) {
    hero.landingTimer = 0.16;
  }

  if (hero.onGround) {
    hero.coyoteTimer = COYOTE_TIME;
    tryConsumeJump(hero, playJumpSfx);
  }

  if (hero.x < 0) {
    hero.x = 0;
  }

  if (hero.x + hero.width > worldWidth) {
    hero.x = worldWidth - hero.width;
  }

  updateHeroState(hero);
}

interface HandleAttackInputParams {
  hero: Hero;
  attackJustPressed: boolean;
  attackPressed: boolean;
  simpleChargedShotUnlocked: boolean;
  deltaTime: number;
  fireBullet: (kind: 'forward' | 'upward' | 'chargedForward') => void;
  runtime: EngineRuntime;
}

function handleAttackInput({
  hero,
  attackJustPressed,
  attackPressed,
  simpleChargedShotUnlocked,
  deltaTime,
  fireBullet,
  runtime,
}: HandleAttackInputParams): void {
  const canChargeThisShot =
    simpleChargedShotUnlocked &&
    !hero.aimingUp &&
    !hero.crouching;

  if (!canChargeThisShot) {
    if (attackJustPressed && hero.shootCooldown <= 0) {
      if (hero.aimingUp) {
        fireBullet('upward');
        hero.shootCooldown = 0.26;
        hero.castTimer = 0.16;
        hero.castDuration = 0.16;
        hero.castAim = 'up';
      } else {
        fireBullet('forward');
        hero.shootCooldown = hero.crouching ? 0.22 : 0.2;
        hero.castTimer = Math.max(hero.castTimer, hero.crouching ? 0.12 : 0.08);
        hero.castDuration = Math.max(hero.castDuration, hero.crouching ? 0.12 : 0.08);
        hero.castAim = 'forward';
        runtime.megaComboTimer = hero.crouching
          ? 0
          : runtime.ignitionReady
            ? 0.14
            : 0;
      }

      hero.specialCasting = false;
      hero.megaCasting = false;
      hero.attackHoldTimer = 0;
      hero.chargedShotPending = false;
    }

    return;
  }

  if (attackJustPressed && hero.shootCooldown <= 0) {
    hero.attackHoldTimer = 0;
    hero.chargedShotPending = true;
  }

  if (attackPressed && hero.chargedShotPending && hero.shootCooldown <= 0) {
    hero.attackHoldTimer += deltaTime;

    if (hero.attackHoldTimer >= SIMPLE_CHARGE_HOLD_TIME) {
      fireBullet('chargedForward');
      hero.shootCooldown = 0.34;
      hero.castTimer = 0.18;
      hero.castDuration = 0.18;
      hero.castAim = 'forward';
      hero.specialCasting = false;
      hero.megaCasting = false;
      hero.attackHoldTimer = 0;
      hero.chargedShotPending = false;
      runtime.megaComboTimer = 0;
      return;
    }
  }

  if (!attackPressed && hero.chargedShotPending && hero.shootCooldown <= 0) {
    fireBullet('forward');
    hero.shootCooldown = 0.2;
    hero.castTimer = Math.max(hero.castTimer, 0.08);
    hero.castDuration = Math.max(hero.castDuration, 0.08);
    hero.castAim = 'forward';
    hero.specialCasting = false;
    hero.megaCasting = false;
    hero.attackHoldTimer = 0;
    hero.chargedShotPending = false;
    runtime.megaComboTimer = runtime.ignitionReady ? 0.14 : 0;
  }

  if (!attackPressed && !hero.chargedShotPending) {
    hero.attackHoldTimer = 0;
  }
}

function updateFallingAndMovingPlatforms(
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

    if (platform.startX === undefined) {
      platform.startX = platform.x;
    }

    if (platform.kind === 'movingPlatform') {
      updateMovingPlatform(platform, hero, deltaTime);
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

    const deltaY = (platform.fallSpeed ?? 145) * deltaTime;
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

function updateMovingPlatform(
  platform: Platform,
  hero: Hero,
  deltaTime: number,
): void {
  const moveAxis = platform.moveAxis ?? 'x';
  const moveRange = platform.moveRange ?? 0;
  const moveSpeed = platform.moveSpeed ?? 0;

  if (moveRange <= 0 || moveSpeed <= 0) {
    return;
  }

  if (platform.moveDirection === undefined) {
    platform.moveDirection = 1;
  }

  if (moveAxis === 'x') {
    const previousX = platform.x;
    const minX = platform.startX ?? platform.x;
    const maxX = minX + moveRange;

    platform.x += platform.moveDirection * moveSpeed * deltaTime;

    if (platform.x <= minX) {
      platform.x = minX;
      platform.moveDirection = 1;
    } else if (platform.x >= maxX) {
      platform.x = maxX;
      platform.moveDirection = -1;
    }

    const deltaX = platform.x - previousX;

    if (deltaX !== 0 && isHeroStandingOnPlatform(hero, platform)) {
      hero.x += deltaX;
    }

    return;
  }

  const previousY = platform.y;
  const minY = platform.startY ?? platform.y;
  const maxY = minY + moveRange;

  platform.y += platform.moveDirection * moveSpeed * deltaTime;

  if (platform.y <= minY) {
    platform.y = minY;
    platform.moveDirection = 1;
  } else if (platform.y >= maxY) {
    platform.y = maxY;
    platform.moveDirection = -1;
  }

  const deltaY = platform.y - previousY;

  if (deltaY !== 0 && isHeroStandingOnPlatform(hero, platform)) {
    hero.y += deltaY;
  }
}

function tryConsumeJump(
  hero: Hero,
  playJumpSfx: () => void,
): void {
  if (hero.jumpBufferTimer <= 0) {
    return;
  }

  if (hero.onGround || hero.coyoteTimer > 0) {
    hero.vy = -hero.jumpForce;
    hero.jumpBufferTimer = 0;
    hero.coyoteTimer = 0;
    hero.onGround = false;
    hero.crouching = false;
    hero.jumpsRemaining = Math.max(0, hero.maxJumps - 1);
    playJumpSfx();
    return;
  }

  if (!hero.onGround && hero.jumpsRemaining > 0) {
    hero.vy = -hero.jumpForce;
    hero.jumpBufferTimer = 0;
    hero.coyoteTimer = 0;
    hero.crouching = false;
    hero.jumpsRemaining -= 1;
    hero.onGround = false;
    playJumpSfx();
  }
}

function updateHeroState(hero: Hero): void {
  if (hero.hurtTimer > 0) {
    hero.state = 'hurt';
    return;
  }

  if (hero.castTimer > 0) {
    if (hero.crouching && hero.castAim === 'forward') {
      hero.state = 'crouch';
      return;
    }

    hero.state = 'cast';
    return;
  }

  if (!hero.onGround) {
    hero.state = hero.vy < 0 ? 'jump' : 'fall';
    return;
  }

  if (hero.crouching) {
    hero.state = 'crouch';
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
  const previousX = hero.x;
  hero.x += hero.vx * deltaTime;

  for (const platform of platforms) {
    if (platform.active === false) {
      continue;
    }

    if (!rectsOverlap(hero, platform)) {
      continue;
    }

    if (!isPlatformBlockingFromSide(hero, platform)) {
      continue;
    }

    if (hero.vx > 0) {
      hero.x = platform.x - hero.width;
    } else if (hero.vx < 0) {
      hero.x = platform.x + platform.width;
    } else {
      hero.x = previousX;
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

    if (!isRectBlockingFromSide(hero, hitbox)) {
      continue;
    }

    if (hero.vx > 0) {
      hero.x = hitbox.x - hero.width;
    } else if (hero.vx < 0) {
      hero.x = hitbox.x + hitbox.width;
    } else {
      hero.x = previousX;
    }
  }
}

function moveHeroVertically(
  hero: Hero,
  deltaTime: number,
  platforms: Platform[],
): void {
  const previousBottom = hero.y + hero.height;
  const previousTop = hero.y;

  hero.onGround = false;
  hero.y += hero.vy * deltaTime;

  for (const platform of platforms) {
    if (platform.active === false) {
      continue;
    }

    if (!rectsOverlap(hero, platform)) {
      continue;
    }

    const platformTop = platform.y;
    const platformBottom = platform.y + platform.height;
    const heroBottom = hero.y + hero.height;
    const heroTop = hero.y;

    if (hero.vy > 0 && previousBottom <= platformTop + 4 && heroBottom >= platformTop) {
      hero.y = platformTop - hero.height;
      hero.vy = 0;
      hero.onGround = true;
      hero.jumpsRemaining = hero.maxJumps;

      if (platform.fallAway && !platform.triggered) {
        platform.triggered = true;
        platform.triggerTimer = platform.fallDelay ?? 0.35;
      }

      continue;
    }

    if (hero.vy < 0 && previousTop >= platformBottom - 4 && heroTop <= platformBottom) {
      hero.y = platformBottom;
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
      const leftEscape = Math.abs(heroRight - tunnel.x);
      const rightEscape = Math.abs(heroLeft - (tunnel.x + tunnel.width));

      if (leftEscape <= 8) {
        hero.x = tunnel.x - hero.width - 1;
      } else if (rightEscape <= 8) {
        hero.x = tunnel.x + tunnel.width + 1;
      } else {
        hero.y = roofBottom;
        hero.vy = 0;
      }
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

function isPlatformBlockingFromSide(hero: Hero, platform: Platform): boolean {
  return isRectBlockingFromSide(hero, {
    x: platform.x,
    y: platform.y,
    width: platform.width,
    height: platform.height,
  });
}

function isRectBlockingFromSide(
  hero: Hero,
  rect: { x: number; y: number; width: number; height: number },
): boolean {
  const heroTop = hero.y;
  const heroBottom = hero.y + hero.height;
  const rectTop = rect.y;
  const rectBottom = rect.y + rect.height;

  if (heroBottom <= rectTop + 8) {
    return false;
  }

  if (heroTop >= rectBottom - 8) {
    return false;
  }

  return true;
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
