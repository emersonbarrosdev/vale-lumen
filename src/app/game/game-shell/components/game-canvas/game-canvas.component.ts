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
import { buildPlayablePhaseData } from '../../../content/phases/registry/phase-playable.factory';
import { InputAction, InputSourceType } from '../../../domain/input/input-action.model';
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

    canvas.width = CANVAS_CONFIG.width;
    canvas.height = CANVAS_CONFIG.height;
    canvas.tabIndex = 0;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    this.loadingOverlayService.hide();
    this.audioService.playMusic(phaseDefinition.audio.explorationMusicId);
    this.deviceInputService.refresh();

    this.engine = new GameEngine(context, canvas, this.gameState, phaseData, {
      onGameOver: (score) => {
        this.audioService.stopMusic();
        this.phaseFlowService.registerDeath(score);
        this.router.navigateByUrl('/game-over');
      },
      onVictory: (score) => {
        this.audioService.stopMusic();

        const result = this.phaseFlowService.completeCurrentPhase(score);

        if (result.finishedGame) {
          this.router.navigateByUrl('/true-ending');
          return;
        }

        this.router.navigateByUrl('/phase-clear');
      },
      onBossIntro: (dialog) => {
        this.audioService.playSfx('boss-intro');
        this.audioService.playMusic(phaseDefinition.audio.bossMusicId);
        this.waitingBossDialogClose = true;
        this.bossDialogService.open(dialog);
      },
    });

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
    this.engine?.clearVirtualInputs('touch');
    this.engine?.destroy();
  }

  handleTouchActionStateChange(event: TouchActionStateChange): void {
    if (this.mobileControlsBlocked || this.hasConnectedGamepad) {
      return;
    }

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
}
