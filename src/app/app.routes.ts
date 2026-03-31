import { Routes } from '@angular/router';
import { CreditsComponent } from './pages/credits/credits.component';
import { GameComponent } from './pages/game/game.component';
import { GameOverComponent } from './pages/game-over/game-over.component';
import { HomeComponent } from './pages/home/home.component';
import { PhaseClearComponent } from './pages/phase-clear/phase-clear.component';
import { PhaseLoadingComponent } from './pages/phase-loading/phase-loading.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { TrueEndingComponent } from './pages/true-ending/true-ending.component';
import { VictoryComponent } from './pages/victory/victory.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'game', component: GameComponent },
  { path: 'phase-loading', component: PhaseLoadingComponent },
  { path: 'phase-clear', component: PhaseClearComponent },
  { path: 'true-ending', component: TrueEndingComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'credits', component: CreditsComponent },
  { path: 'game-over', component: GameOverComponent },
  { path: 'victory', component: VictoryComponent },
  { path: '**', redirectTo: '' },
];
