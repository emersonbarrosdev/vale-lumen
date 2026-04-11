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
  private musicPaused = false;

  constructor(private readonly gameState: GameStateService) {
    this.preloadMusic(MUSIC_CATALOG);
    this.preloadSfx(SFX_CATALOG);
    Howler.volume(1);
    Howler.autoUnlock = true;
  }

  private resolveMusicVolume(trackId: string): number {
    return this.musicVolumeMap.get(trackId) ?? 0.3;
  }

  private resolveSfxVolume(trackId: string): number {
    const baseVolume = this.sfxVolumeMap.get(trackId) ?? 1;
    const effectsVolume = this.gameState.effectsVolume / 100;

    return baseVolume * effectsVolume;
  }

  private preloadMusic(catalog: MusicTrack[]): void {
    for (const track of catalog) {
      this.musicVolumeMap.set(track.id, track.volume);

      this.musicMap.set(
        track.id,
        new Howl({
          src: [track.src],
          loop: track.loop,
          volume: track.volume,
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
          volume: this.resolveSfxVolume(track.id),
          html5: false,
        }),
      );
    }
  }

  playMusic(trackId: string, fadeMs: number = AUDIO_CONFIG.fadeDurationMs): void {
    const nextTrack = this.musicMap.get(trackId);

    if (!nextTrack) {
      return;
    }

    const resolvedVolume = this.resolveMusicVolume(trackId);
    const isSameTrack = this.currentMusicId === trackId;

    if (isSameTrack) {
      nextTrack.volume(resolvedVolume);

      if (this.musicPaused) {
        nextTrack.play();
        this.musicPaused = false;
      }

      return;
    }

    if (this.currentMusicId) {
      const currentTrack = this.musicMap.get(this.currentMusicId);

      if (currentTrack) {
        currentTrack.stop();
      }
    }

    nextTrack.stop();
    nextTrack.volume(resolvedVolume);

    nextTrack.once('playerror', () => {
      nextTrack.once('unlock', () => {
        nextTrack.volume(resolvedVolume);
        nextTrack.play();
      });
    });

    nextTrack.play();

    this.currentMusicId = trackId;
    this.musicPaused = false;
  }

  pauseCurrentMusic(): void {
    if (!this.currentMusicId) {
      return;
    }

    const currentTrack = this.musicMap.get(this.currentMusicId);

    if (!currentTrack) {
      return;
    }

    if (currentTrack.playing()) {
      currentTrack.pause();
      this.musicPaused = true;
    }
  }

  resumeCurrentMusic(): void {
    if (!this.currentMusicId) {
      return;
    }

    const currentTrack = this.musicMap.get(this.currentMusicId);

    if (!currentTrack) {
      return;
    }

    if (this.musicPaused) {
      currentTrack.volume(this.resolveMusicVolume(this.currentMusicId));
      currentTrack.play();
      this.musicPaused = false;
    }
  }

  stopMusic(fadeMs: number = AUDIO_CONFIG.fadeDurationMs): void {
    if (!this.currentMusicId) {
      return;
    }

    const currentTrack = this.musicMap.get(this.currentMusicId);

    if (!currentTrack) {
      this.currentMusicId = null;
      this.musicPaused = false;
      return;
    }

    if (fadeMs <= 0) {
      currentTrack.stop();
      this.currentMusicId = null;
      this.musicPaused = false;
      return;
    }

    const from = currentTrack.volume();
    currentTrack.fade(from, 0, fadeMs);

    setTimeout(() => {
      currentTrack.stop();
      this.currentMusicId = null;
      this.musicPaused = false;
    }, fadeMs);
  }

  playSfx(trackId: string): void {
    const sfx = this.sfxMap.get(trackId);

    if (!sfx) {
      return;
    }

    sfx.volume(this.resolveSfxVolume(trackId));
    sfx.play();
  }

  refreshVolumes(): void {
    for (const [trackId, music] of this.musicMap.entries()) {
      music.volume(this.resolveMusicVolume(trackId));
    }

    for (const [trackId, sfx] of this.sfxMap.entries()) {
      sfx.volume(this.resolveSfxVolume(trackId));
    }
  }
}
