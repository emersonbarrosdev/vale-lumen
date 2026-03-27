import { InputManager } from './input-manager';
import {
  BossArenaData,
  CollectibleData,
  EnemyData,
  PhaseOneScene,
  PlatformData,
} from '../scenes/phase-one.scene';
import { GameStateService } from '../services/game-state.service';

interface EngineCallbacks {
  onGameOver: (score: number) => void;
  onVictory: (score: number) => void;
}

interface Platform extends PlatformData {}

interface Hero {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  speed: number;
  jumpForce: number;
  direction: 1 | -1;
  onGround: boolean;
  hp: number;
  maxHp: number;
  shootCooldown: number;
  dashCooldown: number;
  invulnerabilityTimer: number;
}

interface Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  active: boolean;
}

interface Enemy {
  type: 'errante' | 'vigia';
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: 1 | -1;
  patrolLeft: number;
  patrolRight: number;
  hp: number;
  active: boolean;
  hitFlash: number;
}

interface Collectible extends CollectibleData {
  width: number;
  height: number;
  collected: boolean;
}

interface Boss {
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  active: boolean;
  attackCooldown: number;
  secondaryCooldown: number;
  hitFlash: number;
}

interface Marker {
  x: number;
  y: number;
  radius: number;
  timeLeft: number;
}

interface FallingProjectile {
  x: number;
  y: number;
  vy: number;
  radius: number;
  active: boolean;
}

export class GameEngine {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly canvas: HTMLCanvasElement;
  private readonly input = new InputManager();
  private readonly callbacks: EngineCallbacks;
  private readonly gameState: GameStateService;

  private animationFrameId = 0;
  private lastTime = 0;
  private readonly gravity = 1800;
  private readonly worldWidth: number;
  private readonly platforms: Platform[];
  private readonly enemies: Enemy[];
  private readonly collectibles: Collectible[];
  private readonly bossArena: BossArenaData;

  private readonly hero: Hero = {
    x: 120,
    y: 500,
    width: 44,
    height: 64,
    vx: 0,
    vy: 0,
    speed: 260,
    jumpForce: 720,
    direction: 1,
    onGround: false,
    hp: 3,
    maxHp: 3,
    shootCooldown: 0,
    dashCooldown: 0,
    invulnerabilityTimer: 0,
  };

  private readonly boss: Boss = {
    x: 0,
    y: 470,
    width: 110,
    height: 150,
    hp: 30,
    maxHp: 30,
    active: false,
    attackCooldown: 2.6,
    secondaryCooldown: 4.2,
    hitFlash: 0,
  };

  private cameraX = 0;
  private bullets: Bullet[] = [];
  private markers: Marker[] = [];
  private fallingProjectiles: FallingProjectile[] = [];

  private score = 0;
  private sparks = 0;
  private specialThreshold = 5;
  private paused = false;
  private specialFlashTimer = 0;
  private ending: 'game-over' | 'victory' | null = null;
  private endingTimer = 0;
  private bossMusicStarted = false;

  constructor(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    gameState: GameStateService,
    callbacks: EngineCallbacks,
  ) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.gameState = gameState;
    this.callbacks = callbacks;

    const phase = PhaseOneScene.build();
    this.worldWidth = phase.worldWidth;
    this.platforms = phase.platforms;
    this.bossArena = phase.bossArena;
    this.boss.x = this.bossArena.bossX;

    this.enemies = phase.enemies.map((enemy) => ({
      type: enemy.type,
      x: enemy.x,
      y: enemy.y,
      width: enemy.type === 'vigia' ? 50 : 38,
      height: enemy.type === 'vigia' ? 62 : 44,
      speed: enemy.type === 'vigia' ? 58 : 85,
      direction: -1,
      patrolLeft: enemy.patrolLeft,
      patrolRight: enemy.patrolRight,
      hp: enemy.type === 'vigia' ? 4 : 2,
      active: true,
      hitFlash: 0,
    }));

    this.collectibles = phase.collectibles.map((item) => ({
      ...item,
      width: item.type === 'coin' ? 18 : 20,
      height: item.type === 'coin' ? 18 : 20,
      collected: false,
    }));
  }

  start(): void {
    this.input.attach();
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  destroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    this.input.detach();
  }

  private readonly loop = (time: number): void => {
    const deltaTime = Math.min((time - this.lastTime) / 1000, 0.032);
    this.lastTime = time;

    this.update(deltaTime);
    this.render();

    this.input.endFrame();
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(deltaTime: number): void {
    if (this.ending) {
      this.endingTimer -= deltaTime;

      if (this.endingTimer <= 0) {
        if (this.ending === 'game-over') {
          this.callbacks.onGameOver(this.score);
        } else {
          this.callbacks.onVictory(this.score);
        }
      }

      return;
    }

    if (this.input.isJustPressed('escape')) {
      this.paused = !this.paused;
    }

    if (this.paused) {
      return;
    }

    this.gameState.setCurrentScore(this.score);

    this.updateHero(deltaTime);
    this.updateBullets(deltaTime);
    this.updateEnemies(deltaTime);
    this.updateCollectibles(deltaTime);
    this.updateBoss(deltaTime);
    this.updateMarkers(deltaTime);
    this.updateFallingProjectiles(deltaTime);
    this.updateCamera();

    if (this.specialFlashTimer > 0) {
      this.specialFlashTimer -= deltaTime;
    }

    if (this.hero.hp <= 0) {
      this.startEnding('game-over');
    }

    if (this.boss.active && this.boss.hp <= 0) {
      this.score += 1000;
      this.startEnding('victory');
    }
  }

  private updateHero(deltaTime: number): void {
    this.hero.shootCooldown = Math.max(0, this.hero.shootCooldown - deltaTime);
    this.hero.dashCooldown = Math.max(0, this.hero.dashCooldown - deltaTime);
    this.hero.invulnerabilityTimer = Math.max(
      0,
      this.hero.invulnerabilityTimer - deltaTime,
    );

    const movingLeft =
      this.input.isPressed('a') || this.input.isPressed('arrowleft');
    const movingRight =
      this.input.isPressed('d') || this.input.isPressed('arrowright');

    if (movingLeft && !movingRight) {
      this.hero.vx = -this.hero.speed;
      this.hero.direction = -1;
    } else if (movingRight && !movingLeft) {
      this.hero.vx = this.hero.speed;
      this.hero.direction = 1;
    } else {
      this.hero.vx = 0;
    }

    if (
      (this.input.isJustPressed(' ') || this.input.isJustPressed('w')) &&
      this.hero.onGround
    ) {
      this.hero.vy = -this.hero.jumpForce;
      this.hero.onGround = false;
    }

    if (this.input.isJustPressed('k') && this.hero.dashCooldown <= 0) {
      this.hero.vx = this.hero.direction * 560;
      this.hero.dashCooldown = 0.75;
    }

    if (this.input.isJustPressed('j') && this.hero.shootCooldown <= 0) {
      this.fireBullet();
      this.hero.shootCooldown = 0.22;
    }

    if (this.input.isJustPressed('l') && this.sparks >= this.specialThreshold) {
      this.activateSpecial();
    }

    this.hero.vy += this.gravity * deltaTime;

    this.moveHeroHorizontally(deltaTime);
    this.moveHeroVertically(deltaTime);

    if (this.hero.x < 0) {
      this.hero.x = 0;
    }

    if (this.hero.x + this.hero.width > this.worldWidth) {
      this.hero.x = this.worldWidth - this.hero.width;
    }
  }

  private moveHeroHorizontally(deltaTime: number): void {
    this.hero.x += this.hero.vx * deltaTime;

    for (const platform of this.platforms) {
      if (!this.rectsOverlap(this.hero, platform)) {
        continue;
      }

      if (this.hero.vx > 0) {
        this.hero.x = platform.x - this.hero.width;
      } else if (this.hero.vx < 0) {
        this.hero.x = platform.x + platform.width;
      }
    }
  }

  private moveHeroVertically(deltaTime: number): void {
    this.hero.onGround = false;
    this.hero.y += this.hero.vy * deltaTime;

    for (const platform of this.platforms) {
      if (!this.rectsOverlap(this.hero, platform)) {
        continue;
      }

      if (this.hero.vy > 0) {
        this.hero.y = platform.y - this.hero.height;
        this.hero.vy = 0;
        this.hero.onGround = true;
      } else if (this.hero.vy < 0) {
        this.hero.y = platform.y + platform.height;
        this.hero.vy = 0;
      }
    }
  }

  private fireBullet(): void {
    this.bullets.push({
      x:
        this.hero.direction === 1
          ? this.hero.x + this.hero.width - 2
          : this.hero.x - 14,
      y: this.hero.y + 24,
      width: 14,
      height: 10,
      vx: this.hero.direction * 560,
      active: true,
    });
  }

  private activateSpecial(): void {
    this.sparks = 0;
    this.specialFlashTimer = 0.2;

    for (const enemy of this.enemies) {
      if (enemy.active) {
        enemy.hp = 0;
        enemy.active = false;
        this.score += enemy.type === 'vigia' ? 100 : 50;
      }
    }

    if (this.boss.active && this.boss.hp > 0) {
      this.boss.hp = Math.max(0, this.boss.hp - 10);
      this.boss.hitFlash = 0.2;
    }

    this.fallingProjectiles = [];
    this.markers = [];
  }

  private updateBullets(deltaTime: number): void {
    for (const bullet of this.bullets) {
      if (!bullet.active) {
        continue;
      }

      bullet.x += bullet.vx * deltaTime;

      if (bullet.x < -100 || bullet.x > this.worldWidth + 100) {
        bullet.active = false;
        continue;
      }

      for (const enemy of this.enemies) {
        if (!enemy.active) {
          continue;
        }

        if (this.rectsOverlap(bullet, enemy)) {
          bullet.active = false;
          enemy.hp -= 1;
          enemy.hitFlash = 0.08;

          if (enemy.hp <= 0) {
            enemy.active = false;
            this.score += enemy.type === 'vigia' ? 100 : 50;
          }

          break;
        }
      }

      if (
        bullet.active &&
        this.boss.active &&
        this.boss.hp > 0 &&
        this.rectsOverlap(bullet, this.boss)
      ) {
        bullet.active = false;
        this.boss.hp -= 1;
        this.boss.hitFlash = 0.1;
      }
    }

    this.bullets = this.bullets.filter((bullet) => bullet.active);
  }

  private updateEnemies(deltaTime: number): void {
    for (const enemy of this.enemies) {
      if (!enemy.active) {
        continue;
      }

      enemy.hitFlash = Math.max(0, enemy.hitFlash - deltaTime);
      enemy.x += enemy.direction * enemy.speed * deltaTime;

      if (enemy.x <= enemy.patrolLeft) {
        enemy.x = enemy.patrolLeft;
        enemy.direction = 1;
      }

      if (enemy.x + enemy.width >= enemy.patrolRight) {
        enemy.x = enemy.patrolRight - enemy.width;
        enemy.direction = -1;
      }

      if (
        this.hero.invulnerabilityTimer <= 0 &&
        this.rectsOverlap(this.hero, enemy)
      ) {
        this.applyHeroDamage(1);
      }
    }
  }

  private updateCollectibles(deltaTime: number): void {
    void deltaTime;

    for (const item of this.collectibles) {
      if (item.collected) {
        continue;
      }

      if (this.rectsOverlap(this.hero, item)) {
        item.collected = true;

        switch (item.type) {
          case 'coin':
            this.score += 10;
            break;
          case 'heart':
            this.hero.hp = Math.min(this.hero.maxHp, this.hero.hp + 1);
            break;
          case 'spark':
            this.sparks = Math.min(this.specialThreshold, this.sparks + 1);
            this.score += 25;
            break;
        }
      }
    }
  }

  private updateBoss(deltaTime: number): void {
    if (!this.boss.active && this.hero.x >= this.bossArena.startX - 240) {
      this.boss.active = true;
    }

    if (!this.boss.active || this.boss.hp <= 0) {
      return;
    }

    this.boss.hitFlash = Math.max(0, this.boss.hitFlash - deltaTime);
    this.boss.attackCooldown -= deltaTime;
    this.boss.secondaryCooldown -= deltaTime;

    if (this.hero.x > this.bossArena.endX - 80) {
      this.hero.x = this.bossArena.endX - 80;
    }

    if (this.hero.x < this.bossArena.startX - 120) {
      this.hero.x = this.bossArena.startX - 120;
    }

    if (this.boss.attackCooldown <= 0) {
      this.launchBossPattern();
      this.boss.attackCooldown = this.boss.hp <= 12 ? 1.8 : 2.5;
    }

    if (this.boss.secondaryCooldown <= 0) {
      this.fireBossHorizontalShot();
      this.boss.secondaryCooldown = this.boss.hp <= 12 ? 2.3 : 3.8;
    }
  }

  private launchBossPattern(): void {
    const points = [...this.bossArena.markerXs];
    this.shuffle(points);

    const count = this.boss.hp <= 12 ? 3 : 2;

    for (let index = 0; index < count; index += 1) {
      this.markers.push({
        x: points[index],
        y: this.bossArena.groundY - 8,
        radius: 28,
        timeLeft: 0.9 + index * 0.18,
      });
    }
  }

  private fireBossHorizontalShot(): void {
    const startX = this.boss.x - 24;
    this.fallingProjectiles.push({
      x: startX,
      y: this.boss.y + 50,
      vy: 0,
      radius: 14,
      active: true,
    });
  }

  private updateMarkers(deltaTime: number): void {
    for (const marker of this.markers) {
      marker.timeLeft -= deltaTime;

      if (marker.timeLeft <= 0) {
        this.fallingProjectiles.push({
          x: marker.x,
          y: -20,
          vy: 620,
          radius: 16,
          active: true,
        });
      }
    }

    this.markers = this.markers.filter((marker) => marker.timeLeft > 0);
  }

  private updateFallingProjectiles(deltaTime: number): void {
    for (const projectile of this.fallingProjectiles) {
      if (!projectile.active) {
        continue;
      }

      if (projectile.vy === 0) {
        projectile.x -= 260 * deltaTime;
      } else {
        projectile.y += projectile.vy * deltaTime;
      }

      const horizontalMode = projectile.vy === 0;
      const hitGround =
        !horizontalMode &&
        projectile.y + projectile.radius >= this.bossArena.groundY;

      const leftArena = horizontalMode && projectile.x + projectile.radius < this.bossArena.startX - 40;

      if (hitGround || leftArena) {
        if (!horizontalMode) {
          const heroCenterX = this.hero.x + this.hero.width / 2;
          const impactDistance = Math.abs(heroCenterX - projectile.x);

          if (
            this.hero.invulnerabilityTimer <= 0 &&
            impactDistance <= 42 &&
            this.hero.y + this.hero.height >= this.bossArena.groundY - 90
          ) {
            this.applyHeroDamage(1);
          }
        }

        projectile.active = false;
        continue;
      }

      if (
        horizontalMode &&
        this.hero.invulnerabilityTimer <= 0 &&
        this.circleRectOverlap(projectile.x, projectile.y, projectile.radius, this.hero)
      ) {
        projectile.active = false;
        this.applyHeroDamage(1);
      }
    }

    this.fallingProjectiles = this.fallingProjectiles.filter(
      (projectile) => projectile.active,
    );
  }

  private applyHeroDamage(amount: number): void {
    if (this.hero.invulnerabilityTimer > 0) {
      return;
    }

    this.hero.hp = Math.max(0, this.hero.hp - amount);
    this.hero.invulnerabilityTimer = 1;
    this.hero.vx = -this.hero.direction * 180;
    this.hero.vy = -220;
  }

  private updateCamera(): void {
    const target = this.hero.x - this.canvas.width / 2 + this.hero.width / 2;
    this.cameraX = Math.max(
      0,
      Math.min(target, this.worldWidth - this.canvas.width),
    );
  }

  private startEnding(type: 'game-over' | 'victory'): void {
    if (this.ending) {
      return;
    }

    this.ending = type;
    this.endingTimer = 1;
  }

  private rectsOverlap(
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

  private circleRectOverlap(
    cx: number,
    cy: number,
    radius: number,
    rect: { x: number; y: number; width: number; height: number },
  ): boolean {
    const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));

    const dx = cx - closestX;
    const dy = cy - closestY;

    return dx * dx + dy * dy <= radius * radius;
  }

  private shuffle(values: number[]): void {
    for (let index = values.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [values[index], values[randomIndex]] = [values[randomIndex], values[index]];
    }
  }

  private render(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBackground();

    ctx.save();
    ctx.translate(-this.cameraX, 0);

    this.drawPlatforms();
    this.drawCollectibles();
    this.drawEnemies();
    this.drawBullets();
    this.drawBoss();
    this.drawBossMarkers();
    this.drawFallingProjectiles();
    this.drawHero();

    ctx.restore();

    this.drawHud();

    if (this.specialFlashTimer > 0) {
      ctx.fillStyle = `rgba(255, 236, 179, ${Math.min(
        this.specialFlashTimer * 2.5,
        0.35,
      )})`;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    if (this.paused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.fillStyle = '#f4e7c7';
      ctx.font = 'bold 42px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSADO', this.canvas.width / 2, this.canvas.height / 2 - 20);

      ctx.font = '20px Arial';
      ctx.fillStyle = '#d5d8de';
      ctx.fillText('Pressione ESC para continuar', this.canvas.width / 2, this.canvas.height / 2 + 20);
    }
  }

  private drawBackground(): void {
    const ctx = this.ctx;

    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1a1c27');
    gradient.addColorStop(0.55, '#10131b');
    gradient.addColorStop(1, '#0b0d12');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = 'rgba(255, 183, 77, 0.06)';
    ctx.beginPath();
    ctx.arc(190, 130, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(45, 49, 64, 0.9)';
    ctx.beginPath();
    ctx.moveTo(0, 400);
    ctx.lineTo(160, 290);
    ctx.lineTo(300, 360);
    ctx.lineTo(470, 250);
    ctx.lineTo(680, 390);
    ctx.lineTo(860, 260);
    ctx.lineTo(1080, 380);
    ctx.lineTo(1280, 270);
    ctx.lineTo(1280, 720);
    ctx.lineTo(0, 720);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(80, 86, 110, 0.18)';
    for (let index = 0; index < 12; index += 1) {
      const x = (index * 140 - (this.cameraX * 0.15)) % 1400;
      ctx.fillRect(x, 500, 70, 120);
      ctx.fillRect(x + 18, 460, 16, 40);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(0, 560, this.canvas.width, 160);
  }

  private drawPlatforms(): void {
    const ctx = this.ctx;

    for (const platform of this.platforms) {
      ctx.fillStyle = '#343846';
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

      ctx.fillStyle = '#4b5161';
      ctx.fillRect(platform.x, platform.y, platform.width, 8);

      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(platform.x, platform.y + platform.height - 8, platform.width, 8);
    }
  }

  private drawHero(): void {
    const ctx = this.ctx;
    const hero = this.hero;

    const flicker =
      hero.invulnerabilityTimer > 0 &&
      Math.floor(hero.invulnerabilityTimer * 18) % 2 === 0;

    if (flicker) {
      return;
    }

    ctx.save();
    ctx.translate(hero.x, hero.y);

    ctx.fillStyle = '#7d2230';
    ctx.fillRect(hero.direction === 1 ? 8 : 28, 16, 10, 34);

    ctx.fillStyle = '#30475a';
    ctx.fillRect(12, 16, 20, 28);

    ctx.fillStyle = '#2b3546';
    ctx.fillRect(10, 36, 24, 24);

    ctx.fillStyle = '#d8c2a1';
    ctx.fillRect(14, 2, 16, 16);

    ctx.fillStyle = '#2a2326';
    ctx.fillRect(12, 0, 20, 7);

    ctx.fillStyle = '#f5c16c';
    const handX = hero.direction === 1 ? 34 : 4;
    ctx.beginPath();
    ctx.arc(handX, 26, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawBullets(): void {
    const ctx = this.ctx;

    for (const bullet of this.bullets) {
      ctx.fillStyle = '#ffd083';
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

      ctx.fillStyle = 'rgba(255, 208, 131, 0.4)';
      ctx.fillRect(
        bullet.vx > 0 ? bullet.x - 8 : bullet.x + bullet.width,
        bullet.y + 2,
        8,
        6,
      );
    }
  }

  private drawEnemies(): void {
    const ctx = this.ctx;

    for (const enemy of this.enemies) {
      if (!enemy.active) {
        continue;
      }

      ctx.save();
      ctx.translate(enemy.x, enemy.y);

      ctx.fillStyle = enemy.hitFlash > 0 ? '#e8d7c1' : '#272b37';
      ctx.fillRect(0, 8, enemy.width, enemy.height - 8);

      ctx.fillStyle = '#191c24';
      ctx.fillRect(6, 0, enemy.width - 12, 12);

      ctx.fillStyle = '#7be0ff';
      ctx.fillRect(enemy.width / 2 - 5, 22, 10, 10);

      if (enemy.type === 'vigia') {
        ctx.fillStyle = '#3d4253';
        ctx.fillRect(-6, 18, 8, 24);
        ctx.fillRect(enemy.width - 2, 18, 8, 24);
      }

      ctx.restore();
    }
  }

  private drawCollectibles(): void {
    const ctx = this.ctx;
    const bob = Math.sin(performance.now() / 220) * 4;

    for (const item of this.collectibles) {
      if (item.collected) {
        continue;
      }

      const y = item.y + bob;

      if (item.type === 'coin') {
        ctx.fillStyle = '#f0c35b';
        ctx.beginPath();
        ctx.arc(item.x, y, 9, 0, Math.PI * 2);
        ctx.fill();
      }

      if (item.type === 'heart') {
        ctx.fillStyle = '#f08a6b';
        ctx.beginPath();
        ctx.arc(item.x - 5, y - 2, 6, 0, Math.PI * 2);
        ctx.arc(item.x + 5, y - 2, 6, 0, Math.PI * 2);
        ctx.lineTo(item.x, y + 10);
        ctx.closePath();
        ctx.fill();
      }

      if (item.type === 'spark') {
        ctx.fillStyle = '#7de8ff';
        ctx.beginPath();
        ctx.moveTo(item.x, y - 10);
        ctx.lineTo(item.x + 6, y);
        ctx.lineTo(item.x + 2, y);
        ctx.lineTo(item.x + 8, y + 10);
        ctx.lineTo(item.x - 4, y + 2);
        ctx.lineTo(item.x, y + 2);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  private drawBoss(): void {
    if (!this.boss.active || this.boss.hp <= 0) {
      return;
    }

    const ctx = this.ctx;
    const boss = this.boss;

    ctx.save();
    ctx.translate(boss.x, boss.y);

    ctx.fillStyle = boss.hitFlash > 0 ? '#f7eddc' : '#2b2f3b';
    ctx.fillRect(10, 20, 90, 130);

    ctx.fillStyle = '#1b1f28';
    ctx.fillRect(24, 0, 62, 36);

    ctx.fillStyle = '#6de2ff';
    ctx.fillRect(48, 56, 16, 16);

    ctx.fillStyle = '#404758';
    ctx.fillRect(-6, 32, 18, 72);
    ctx.fillRect(98, 32, 18, 72);

    ctx.restore();
  }

  private drawBossMarkers(): void {
    const ctx = this.ctx;

    for (const marker of this.markers) {
      ctx.strokeStyle = 'rgba(255, 130, 130, 0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(marker.x, marker.y, marker.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 130, 130, 0.18)';
      ctx.beginPath();
      ctx.arc(marker.x, marker.y, marker.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawFallingProjectiles(): void {
    const ctx = this.ctx;

    for (const projectile of this.fallingProjectiles) {
      if (!projectile.active) {
        continue;
      }

      ctx.fillStyle = projectile.vy === 0 ? '#bc8cff' : '#ff9e7d';
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawHud(): void {
    const ctx = this.ctx;

    ctx.save();
    ctx.fillStyle = 'rgba(10, 12, 18, 0.55)';
    ctx.fillRect(20, 18, 250, 92);
    ctx.fillRect(this.canvas.width - 240, 18, 220, 92);

    for (let index = 0; index < this.hero.maxHp; index += 1) {
      const x = 40 + index * 34;
      const y = 40;
      const active = index < this.hero.hp;

      ctx.fillStyle = active ? '#f08a6b' : '#42323a';
      ctx.beginPath();
      ctx.arc(x - 6, y, 8, 0, Math.PI * 2);
      ctx.arc(x + 6, y, 8, 0, Math.PI * 2);
      ctx.lineTo(x, y + 14);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = '#d9deea';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Centelhas: ${this.sparks}/${this.specialThreshold}`, 36, 88);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#f4e7c7';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Fase 1 - Ruínas do Vale', this.canvas.width / 2, 42);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#d9deea';
    ctx.font = '18px Arial';
    ctx.fillText(`Pontos: ${this.score}`, this.canvas.width - 40, 50);
    ctx.fillText('ESC pausa', this.canvas.width - 40, 84);

    if (this.boss.active && this.boss.hp > 0) {
      const barWidth = 420;
      const barHeight = 18;
      const x = this.canvas.width / 2 - barWidth / 2;
      const y = 70;

      ctx.fillStyle = 'rgba(10, 12, 18, 0.72)';
      ctx.fillRect(x - 12, y - 30, barWidth + 24, 54);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#f3d6c0';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('Arauto das Cinzas', this.canvas.width / 2, y - 10);

      ctx.fillStyle = '#242835';
      ctx.fillRect(x, y, barWidth, barHeight);

      ctx.fillStyle = '#dd7558';
      ctx.fillRect(x, y, (this.boss.hp / this.boss.maxHp) * barWidth, barHeight);

      ctx.strokeStyle = 'rgba(244, 231, 199, 0.2)';
      ctx.strokeRect(x, y, barWidth, barHeight);
    }

    if (this.sparks >= this.specialThreshold) {
      ctx.fillStyle = 'rgba(255, 225, 150, 0.18)';
      ctx.fillRect(20, 118, 220, 36);
      ctx.fillStyle = '#ffe08a';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Especial pronto (L)', 34, 142);
    }

    ctx.restore();
  }
}
