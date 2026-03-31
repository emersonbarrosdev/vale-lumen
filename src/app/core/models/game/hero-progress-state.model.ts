export interface HeroProgressState {
  level: number;
  maxHp: number;
  currentHp: number;
  manaMax: number;
  manaCurrent: number;
  manaRegenPerSecond: number;
  specialGaugeMax: number;
  specialGaugeCurrent: number;
  baseAttack: number;
  magicPower: number;
  doubleJumpUnlocked: boolean;
  dashUnlocked: boolean;
  dashCharges: number;
  shieldUnlocked: boolean;
  relicSlots: number;
  cosmeticsUnlocked: string[];
  relicsUnlocked: string[];
}
