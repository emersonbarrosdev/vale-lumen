import { SfxTrack } from '../../domain/audio/sfx-track.model';

export const SFX_CATALOG: SfxTrack[] = [
  { id: 'hero-jump', src: 'assets/audio/sfx/hero-jump.mp3', volume: 0.45 },

  { id: 'hero-shot', src: 'assets/audio/sfx/hero-shot.mp3', volume: 0.45 },
  { id: 'hero-special-shot', src: 'assets/audio/sfx/hero-special.mp3', volume: 0.45 },
  { id: 'hero-special-explosion', src: 'assets/audio/sfx/hero-special.mp3', volume: 0.45 },

  { id: 'coin-pickup', src: 'assets/audio/sfx/coin-pickup.mp3', volume: 0.45 },
  { id: 'spark-pickup', src: 'assets/audio/sfx/spark-pickup.mp3', volume: 0.45 },
  { id: 'heart-pickup', src: 'assets/audio/sfx/heart-pickup.mp3', volume: 0.45 },

  { id: 'chest-open-common', src: 'assets/audio/sfx/chest-open-common.mp3', volume: 0.45 },
  { id: 'chest-open-rare', src: 'assets/audio/sfx/chest-open-rare.mp3', volume: 0.45 },

  { id: 'enemy-hit', src: 'assets/audio/sfx/enemy-hit.mp3', volume: 0.45 },
  { id: 'enemy-death', src: 'assets/audio/sfx/enemy-death.mp3', volume: 0.45 },

  { id: 'boss-intro', src: 'assets/audio/sfx/boss-intro.mp3', volume: 0.45 },
  { id: 'boss-hit', src: 'assets/audio/sfx/boss-hit.mp3', volume: 0.45 },
  { id: 'boss-special', src: 'assets/audio/sfx/boss-special.mp3', volume: 0.45 },

  { id: 'game-over', src: 'assets/audio/sfx/game-over.mp3', volume: 0.45 },
];
