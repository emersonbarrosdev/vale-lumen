import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '../../services/game-state.service';
import { GameEngine } from '../../engine/game-engine';

@Component({
  selector: 'app-game-canvas',
  standalone: true,
  templateUrl: './game-canvas.component.html',
  styleUrl: './game-canvas.component.scss',
})
export class GameCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas', { static: true })
  private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  private engine: GameEngine | null = null;

  constructor(
    private readonly router: Router,
    private readonly gameState: GameStateService,
  ) {}

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Não foi possível obter o contexto 2D do canvas.');
    }

    canvas.width = 1280;
    canvas.height = 720;

    this.engine = new GameEngine(context, canvas, this.gameState, {
      onGameOver: (score) => {
        this.gameState.finishRun(score);
        this.router.navigateByUrl('/game-over');
      },
      onVictory: (score) => {
        this.gameState.finishRun(score);
        this.router.navigateByUrl('/victory');
      },
    });

    this.engine.start();
  }

  ngOnDestroy(): void {
    this.engine?.destroy();
  }
}
