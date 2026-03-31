export type PhaseLength = 'short' | 'medium' | 'long';

export interface PhaseSegment {
  id: 'start' | 'middle' | 'pre-boss' | 'boss';
  label: string;
  difficultyWeight: number;
}
