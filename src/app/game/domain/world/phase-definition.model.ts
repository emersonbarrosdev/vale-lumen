import { BossDialog } from './../bosses/boss-dialog.model';
import { PhaseSegment, PhaseLength } from './../world/phase-segment.model';

export interface PhaseBossDefinition {
  bossId: string;
  bossName: string;
  maxHp: number;
  movementMode: 'static-corner' | 'patrol' | 'jump-heavy';
  dialog: BossDialog;
  bossMusicId: string;
}

export interface PhaseAudioDefinition {
  explorationMusicId: string;
  bossMusicId: string;
  clearMusicId: string;
}

export interface PhaseDefinition {
  id: string;
  order: number;
  title: string;
  biome: string;
  narrativeGoal: string;
  mainEnemyName: string;
  visualSummary: string;
  mainMechanic: string;
  length: PhaseLength;
  difficulty: number;
  worldWidth: number;
  segments: PhaseSegment[];
  boss: PhaseBossDefinition;
  audio: PhaseAudioDefinition;
  isFinalPhase?: boolean;
}
