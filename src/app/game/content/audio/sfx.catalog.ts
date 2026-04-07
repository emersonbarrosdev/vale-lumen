import { SfxTrack } from '../../domain/audio/sfx-track.model';

export const SFX_CATALOG: SfxTrack[] = [
  { id: 'ui-click', src: 'assets/audio/sfx/ui-click.mp3', volume: 0.85 },
  { id: 'ui-confirm', src: 'assets/audio/sfx/ui-confirm.mp3', volume: 0.85 },
  { id: 'hero-jump', src: 'assets/audio/sfx/hero-jump.mp3', volume: 0.9 },
  { id: 'hero-land', src: 'assets/audio/sfx/hero-land.mp3', volume: 0.8 },
  { id: 'hero-dash', src: 'assets/audio/sfx/hero-dash.mp3', volume: 0.85 },

  { id: 'hero-shot', src: 'assets/audio/sfx/hero-shot.mp3', volume: 0.82 },
  { id: 'hero-special-shot', src: 'assets/audio/sfx/hero-special.mp3', volume: 0.95 },
  { id: 'hero-special-explosion', src: 'assets/audio/sfx/hero-special.mp3', volume: 1 },

  { id: 'coin-pickup', src: 'assets/audio/sfx/coin-pickup.mp3', volume: 0.78 },
  { id: 'spark-pickup', src: 'assets/audio/sfx/spark-pickup.mp3', volume: 0.8 },
  { id: 'heart-pickup', src: 'assets/audio/sfx/heart-pickup.mp3', volume: 0.8 },
  { id: 'chest-open-common', src: 'assets/audio/sfx/chest-open-common.mp3', volume: 0.88 },
  { id: 'chest-open-rare', src: 'assets/audio/sfx/chest-open-rare.mp3', volume: 0.9 },
  { id: 'enemy-hit', src: 'assets/audio/sfx/enemy-hit.mp3', volume: 0.85 },
  { id: 'enemy-death', src: 'assets/audio/sfx/enemy-death.mp3', volume: 0.85 },
  { id: 'boss-intro', src: 'assets/audio/sfx/boss-intro.mp3', volume: 0.95 },
  { id: 'boss-hit', src: 'assets/audio/sfx/boss-hit.mp3', volume: 0.92 },
  { id: 'boss-special', src: 'assets/audio/sfx/boss-special.mp3', volume: 0.95 },
  { id: 'phase-clear', src: 'assets/audio/sfx/phase-clear.mp3', volume: 0.92 },
  { id: 'loading-transition', src: 'assets/audio/sfx/loading-transition.mp3', volume: 0.78 },
  { id: 'game-over', src: 'assets/audio/sfx/game-over.mp3', volume: 0.9 },
];
