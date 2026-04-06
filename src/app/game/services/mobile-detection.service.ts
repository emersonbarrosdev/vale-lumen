import { Inject, Injectable, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MobileDetectionService implements OnDestroy {
  private readonly isBrowser: boolean;
  private readonly shouldShowTouchControlsSubject = new BehaviorSubject<boolean>(false);

  readonly shouldShowTouchControls$ =
    this.shouldShowTouchControlsSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (!this.isBrowser) {
      return;
    }

    this.evaluateTouchMode();
    window.addEventListener('resize', this.handleViewportChange);
    window.addEventListener('orientationchange', this.handleViewportChange);
  }

  get shouldShowTouchControls(): boolean {
    return this.shouldShowTouchControlsSubject.value;
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) {
      return;
    }

    window.removeEventListener('resize', this.handleViewportChange);
    window.removeEventListener('orientationchange', this.handleViewportChange);
  }

  private readonly handleViewportChange = (): void => {
    this.evaluateTouchMode();
  };

  private evaluateTouchMode(): void {
    if (!this.isBrowser) {
      this.shouldShowTouchControlsSubject.next(false);
      return;
    }

    const hasTouchSupport =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;

    const coarsePointer =
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(any-pointer: coarse)').matches;

    const hoverNone = window.matchMedia('(hover: none)').matches;
    const smallViewport = window.innerWidth <= 1024;

    this.shouldShowTouchControlsSubject.next(
      hasTouchSupport && (coarsePointer || hoverNone || smallViewport),
    );
  }
}
