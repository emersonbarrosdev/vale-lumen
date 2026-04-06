export interface PhaseResult {
  phaseId: string;
  phaseTitle: string;
  score: number;
  coins: number;
  sparks: number;
  timeMs: number;
  formattedTime: string;
  bonusHp: number;
  totalScore: number;
  clearedAt: number;
}
