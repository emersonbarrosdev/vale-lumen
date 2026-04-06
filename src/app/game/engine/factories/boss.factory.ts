import { Boss } from '../../domain/bosses/boss.model';
import { BossArenaData } from '../../domain/world/boss-arena.model';
import { PhasePlayableData } from '../../domain/world/phase-playable-data.model';

export function createBoss(
  phaseData: PhasePlayableData,
  bossArena: BossArenaData,
): Boss {
  const boss: Boss = {
    x: bossArena.bossX,
    y: 0,
    width: 146,
    height: 186,
    hp: phaseData.definition.boss.maxHp,
    maxHp: phaseData.definition.boss.maxHp,
    active: false,
    jumpCooldown: 3.2,
    secondaryCooldown: 2.2,
    vy: 0,
    onGround: true,
    hitFlash: 0,
    introPulse: 0,
    castTimer: 0,
    armSwing: 0,
    squashTimer: 0,
    special50Used: false,
    special15Used: false,
  };

  boss.y = getBossGroundTop(boss, bossArena);

  return boss;
}

function getBossGroundTop(
  boss: Boss,
  bossArena: BossArenaData,
): number {
  return bossArena.groundY - boss.height;
}
