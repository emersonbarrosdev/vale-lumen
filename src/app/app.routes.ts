import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { GameComponent } from './pages/game/game.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { CreditsComponent } from './pages/credits/credits.component';
import { GameOverComponent } from './pages/game-over/game-over.component';
import { VictoryComponent } from './pages/victory/victory.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'game', component: GameComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'credits', component: CreditsComponent },
  { path: 'game-over', component: GameOverComponent },
  { path: 'victory', component: VictoryComponent },
  { path: '**', redirectTo: '' },
];
