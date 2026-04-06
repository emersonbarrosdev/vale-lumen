import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import { LoadingState } from '../../core/models/game/loading-state.model';

@Injectable({
  providedIn: 'root',
})
export class LoadingOverlayService {
  private readonly stateSubject = new BehaviorSubject<LoadingState>({
    visible: false,
    title: '',
    subtitle: '',
    progressText: '',
  });

  readonly state$ = this.stateSubject.asObservable();
  readonly isVisible$ = this.state$.pipe(
    map((state) => state.visible),
    distinctUntilChanged(),
  );

  show(title: string, subtitle: string, progressText = 'Carregando...'): void {
    this.stateSubject.next({
      visible: true,
      title,
      subtitle,
      progressText,
    });
  }

  hide(): void {
    this.stateSubject.next({
      visible: false,
      title: '',
      subtitle: '',
      progressText: '',
    });
  }
}
