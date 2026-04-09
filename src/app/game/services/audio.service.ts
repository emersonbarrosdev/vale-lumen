import { Injectable } from '@angular/core';
import { Howl, Howler } from 'howler';
import { AUDIO_CONFIG } from '../../core/config/audio.config';
import { MUSIC_CATALOG } from '../content/audio/music.catalog';
import { SFX_CATALOG } from '../content/audio/sfx.catalog';
import { MusicTrack } from '../domain/audio/music-track.model';
import { SfxTrack } from '../domain/audio/sfx-track.model';
import { GameStateService } from './game-state.service';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private readonly musicMap = new Map<string, Howl>();
  private readonly sfxMap = new Map<string, Howl>();
  private readonly musicVolumeMap = new Map<string, number>();
  private readonly sfxVolumeMap = new Map<string, number>();
  private currentMusicId: string | null = null;

  constructor(private readonly gameState: GameStateService) {
    this.preloadMusic(MUSIC_CATALOG);
    this.preloadSfx(SFX_CATALOG);
    Howler.volume(1);
  }

  private preloadMusic(catalog: MusicTrack[]): void {
    for (const track of catalog) {
      this.musicVolumeMap.set(track.id, track.volume);

      this.musicMap.set(
        track.id,
        new Howl({
          src: [track.src],
          loop: track.loop,
          volume: track.volume * (this.gameState.musicVolume / 100),
          html5: true,
        }),
      );
    }
  }

  private preloadSfx(catalog: SfxTrack[]): void {
    for (const track of catalog) {
      this.sfxVolumeMap.set(track.id, track.volume);

      this.sfxMap.set(
        track.id,
        new Howl({
          src: [track.src],
          loop: false,
          volume: track.volume * (this.gameState.effectsVolume / 100),
          html5: false,
        }),
      );
    }
  }

  playMusic(trackId: string, fadeMs = AUDIO_CONFIG.fadeDurationMs): void {
    if (this.currentMusicId === trackId) {
      return;
    }

    const nextTrack = this.musicMap.get(trackId);

    if (!nextTrack) {
      return;
    }

    if (this.currentMusicId) {
      const currentTrack = this.musicMap.get(this.currentMusicId);

      if (currentTrack) {
        const from = currentTrack.volume();
        currentTrack.fade(from, 0, fadeMs);
        setTimeout(() => currentTrack.stop(), fadeMs);
      }
    }

    const baseVolume = this.musicVolumeMap.get(trackId) ?? 1;

    nextTrack.volume(0);
    nextTrack.play();
    nextTrack.fade(
      0,
      baseVolume * (this.gameState.musicVolume / 100),
      fadeMs,
    );

    this.currentMusicId = trackId;
  }

  stopMusic(fadeMs = AUDIO_CONFIG.fadeDurationMs): void {
    if (!this.currentMusicId) {
      return;
    }

    const currentTrack = this.musicMap.get(this.currentMusicId);

    if (!currentTrack) {
      this.currentMusicId = null;
      return;
    }

    const from = currentTrack.volume();
    currentTrack.fade(from, 0, fadeMs);

    setTimeout(() => {
      currentTrack.stop();
      this.currentMusicId = null;
    }, fadeMs);
  }

  playSfx(trackId: string): void {
    const sfx = this.sfxMap.get(trackId);

    if (!sfx) {
      return;
    }

    const baseVolume = this.sfxVolumeMap.get(trackId) ?? 1;
    sfx.volume(baseVolume * (this.gameState.effectsVolume / 100));
    sfx.play();
  }

  refreshVolumes(): void {
    for (const [trackId, music] of this.musicMap.entries()) {
      const baseVolume = this.musicVolumeMap.get(trackId) ?? 1;
      music.volume(baseVolume * (this.gameState.musicVolume / 100));
    }

    for (const [trackId, sfx] of this.sfxMap.entries()) {
      const baseVolume = this.sfxVolumeMap.get(trackId) ?? 1;
      sfx.volume(baseVolume * (this.gameState.effectsVolume / 100));
    }
  }
}
