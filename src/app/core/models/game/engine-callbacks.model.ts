import { BossDialog } from '../../../game/domain/bosses/boss-dialog.model';

export interface EngineCallbacks {
  onGameOver: (score: number) => void;
  onVictory: (score: number) => void;
  onBossIntro?: (dialog: BossDialog) => void;
}
