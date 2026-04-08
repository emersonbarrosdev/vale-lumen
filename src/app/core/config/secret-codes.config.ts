export type SecretCodeAction =
  | 'unlockFlameHair'
  | 'jumpToBossPhase';

export interface SecretCodeDefinition {
  id: string;
  sequence: string[];
  action: SecretCodeAction;
  bossPhase?: number;
  enabled: boolean;
}

const buildBossPhaseSequence = (phase: number): string[] => {
  const sequence: string[] = [];

  for (let index = 0; index < phase; index += 1) {
    sequence.push('up');
  }

  for (let index = 0; index < phase; index += 1) {
    sequence.push('down');
  }

  for (let index = 0; index < phase; index += 1) {
    sequence.push('left');
  }

  for (let index = 0; index < phase; index += 1) {
    sequence.push('right');
  }

  return sequence;
};

export const SECRET_CODE_INPUT_BUFFER_LIMIT = 64;
export const SECRET_CODE_INPUT_TIMEOUT_MS = 5000;

export const SECRET_CODES: SecretCodeDefinition[] = [
  {
    id: 'flame-hair',
    sequence: ['up', 'up', 'up', 'up', 'up'],
    action: 'unlockFlameHair',
    enabled: true,
  },
  {
    id: 'boss-phase-01',
    sequence: buildBossPhaseSequence(1),
    action: 'jumpToBossPhase',
    bossPhase: 1,
    enabled: true,
  },
  {
    id: 'boss-phase-02',
    sequence: buildBossPhaseSequence(2),
    action: 'jumpToBossPhase',
    bossPhase: 2,
    enabled: false,
  },
  {
    id: 'boss-phase-03',
    sequence: buildBossPhaseSequence(3),
    action: 'jumpToBossPhase',
    bossPhase: 3,
    enabled: false,
  },
  {
    id: 'boss-phase-04',
    sequence: buildBossPhaseSequence(4),
    action: 'jumpToBossPhase',
    bossPhase: 4,
    enabled: false,
  },
  {
    id: 'boss-phase-05',
    sequence: buildBossPhaseSequence(5),
    action: 'jumpToBossPhase',
    bossPhase: 5,
    enabled: false,
  },
  {
    id: 'boss-phase-06',
    sequence: buildBossPhaseSequence(6),
    action: 'jumpToBossPhase',
    bossPhase: 6,
    enabled: false,
  },
  {
    id: 'boss-phase-07',
    sequence: buildBossPhaseSequence(7),
    action: 'jumpToBossPhase',
    bossPhase: 7,
    enabled: false,
  },
  {
    id: 'boss-phase-08',
    sequence: buildBossPhaseSequence(8),
    action: 'jumpToBossPhase',
    bossPhase: 8,
    enabled: false,
  },
  {
    id: 'boss-phase-09',
    sequence: buildBossPhaseSequence(9),
    action: 'jumpToBossPhase',
    bossPhase: 9,
    enabled: false,
  },
  {
    id: 'boss-phase-10',
    sequence: buildBossPhaseSequence(10),
    action: 'jumpToBossPhase',
    bossPhase: 10,
    enabled: false,
  },
  {
    id: 'boss-phase-11',
    sequence: buildBossPhaseSequence(11),
    action: 'jumpToBossPhase',
    bossPhase: 11,
    enabled: false,
  },
  {
    id: 'boss-phase-12',
    sequence: buildBossPhaseSequence(12),
    action: 'jumpToBossPhase',
    bossPhase: 12,
    enabled: false,
  },
];
