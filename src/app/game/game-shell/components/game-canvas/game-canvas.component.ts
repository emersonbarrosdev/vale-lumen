import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { CANVAS_CONFIG } from '../../../../core/config/canvas.config';
import { EngineCallbacks } from '../../../../core/models/game/engine-callbacks.model';
import { buildPlayablePhaseData } from '../../../content/phases/registry/phase-playable.factory';
import { BossDialog } from '../../../domain/bosses/boss-dialog.model';
import { GameEngine } from '../../../engine/game-engine';
import {
  MobileControlsComponent,
  TouchActionStateChange,
} from '../mobile-controls/mobile-controls.component';
import { AudioService } from '../../../services/audio.service';
import { BossDialogService } from '../../../services/boss-dialog.service';
import { DeviceInputService } from '../../../services/device-input.service';
import { GameStateService } from '../../../services/game-state.service';
import { LoadingOverlayService } from '../../../services/loading-overlay.service';
import { MobileDetectionService } from '../../../services/mobile-detection.service';
import { PhaseFlowService } from '../../../services/phase-flow.service';

@Component({
  selector: 'app-game-canvas',
  standalone: true,
  imports: [CommonModule, MobileControlsComponent],
  templateUrl: './game-canvas.component.html',
  styleUrl: './game-canvas.component.scss',
})
export class GameCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas', { static: true })
  private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  private engine: GameEngine | null = null;
  private readonly isBrowser: boolean;
  private dialogSubscription?: Subscription;
  private waitingBossDialogClose = false;
  private uiStateSubscription?: Subscription;
  private unlockAudioHandler?: () => void;
  private explorationMusicId = '';

  showMobileControls = false;
  mobileControlsBlocked = false;
  private hasConnectedGamepad = false;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private readonly router: Router,
    private readonly gameState: GameStateService,
    private readonly phaseFlowService: PhaseFlowService,
    private readonly audioService: AudioService,
    private readonly bossDialogService: BossDialogService,
    private readonly loadingOverlayService: LoadingOverlayService,
    private readonly mobileDetectionService: MobileDetectionService,
    private readonly deviceInputService: DeviceInputService,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.bindUiState();

    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Não foi possível obter o contexto 2D do canvas.');
    }

    const phaseDefinition = this.phaseFlowService.getCurrentPhaseDefinition();
    const phaseData = buildPlayablePhaseData(phaseDefinition);
    this.explorationMusicId = phaseDefinition.audio.explorationMusicId;

    canvas.width = CANVAS_CONFIG.width;
    canvas.height = CANVAS_CONFIG.height;
    canvas.tabIndex = 0;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    this.loadingOverlayService.hide();
    this.deviceInputService.refresh();

    /**
     * Tenta tocar já na entrada da fase.
     * Se o browser bloquear autoplay, a primeira interação abaixo destrava.
     */
    this.audioService.playMusic(this.explorationMusicId);
    this.setupAudioUnlock(canvas);

    const callbacks: EngineCallbacks = {
      onGameOver: (score: number) => {
        this.audioService.stopMusic();
        this.phaseFlowService.registerDeath(score);
        this.router.navigateByUrl('/game-over');
      },
      onVictory: (score: number) => {
        this.audioService.stopMusic();

        const result = this.phaseFlowService.completeCurrentPhase(score);

        if (result.finishedGame) {
          this.router.navigateByUrl('/true-ending');
          return;
        }

        this.router.navigateByUrl('/phase-clear');
      },
      onBossIntro: (dialog: BossDialog) => {
        this.audioService.playSfx('boss-intro');
        this.audioService.playMusic(phaseDefinition.audio.bossMusicId);
        this.waitingBossDialogClose = true;
        this.bossDialogService.open(dialog);
      },
    };

    this.engine = new GameEngine(
      context,
      canvas,
      this.gameState,
      this.audioService,
      phaseData,
      callbacks,
    );

    this.dialogSubscription = this.bossDialogService.dialog$.subscribe((dialog) => {
      if (!dialog && this.waitingBossDialogClose) {
        this.waitingBossDialogClose = false;
        this.engine?.resumeBossBattle();
        this.deviceInputService.refresh();
        queueMicrotask(() => canvas.focus());
      }
    });

    queueMicrotask(() => canvas.focus());
    this.engine.start();
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) {
      return;
    }

    this.dialogSubscription?.unsubscribe();
    this.uiStateSubscription?.unsubscribe();
    this.removeAudioUnlock();
    this.engine?.clearVirtualInputs('touch');
    this.engine?.destroy();
    this.audioService.stopMusic(0);
  }

  handleTouchActionStateChange(event: TouchActionStateChange): void {
    if (this.mobileControlsBlocked || this.hasConnectedGamepad) {
      return;
    }

    this.audioService.playMusic(this.explorationMusicId);
    this.engine?.setVirtualActionState(event.action, event.pressed);
  }

  private bindUiState(): void {
    this.uiStateSubscription = combineLatest([
      this.mobileDetectionService.shouldShowTouchControls$,
      this.loadingOverlayService.isVisible$,
      this.bossDialogService.isOpen$,
      this.deviceInputService.hasConnectedGamepad$,
    ]).subscribe(([
      shouldShowTouchControls,
      isLoadingVisible,
      isBossDialogOpen,
      hasConnectedGamepad,
    ]) => {
      this.hasConnectedGamepad = hasConnectedGamepad;

      const allowTouchControls = this.gameState.settings.showTouchControls;

      const nextShowMobileControls =
        shouldShowTouchControls &&
        allowTouchControls &&
        !hasConnectedGamepad;

      const nextMobileControlsBlocked =
        isLoadingVisible ||
        isBossDialogOpen ||
        hasConnectedGamepad;

      if ((!nextShowMobileControls || nextMobileControlsBlocked) && this.engine) {
        this.engine.clearVirtualInputs('touch');
      }

      this.showMobileControls = nextShowMobileControls;
      this.mobileControlsBlocked = nextMobileControlsBlocked;
    });
  }

  private setupAudioUnlock(canvas: HTMLCanvasElement): void {
    const handler = (): void => {
      this.audioService.playMusic(this.explorationMusicId);
      canvas.focus();
      this.removeAudioUnlock();
    };

    this.unlockAudioHandler = handler;

    window.addEventListener('pointerdown', handler, { passive: true });
    window.addEventListener('keydown', handler, { passive: true });
    window.addEventListener('touchstart', handler, { passive: true });
  }

  private removeAudioUnlock(): void {
    if (!this.unlockAudioHandler) {
      return;
    }

    window.removeEventListener('pointerdown', this.unlockAudioHandler);
    window.removeEventListener('keydown', this.unlockAudioHandler);
    window.removeEventListener('touchstart', this.unlockAudioHandler);
    this.unlockAudioHandler = undefined;
  }
}
