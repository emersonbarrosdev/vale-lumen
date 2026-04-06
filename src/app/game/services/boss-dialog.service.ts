import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import { BossDialog } from '../domain/bosses/boss-dialog.model';

@Injectable({
  providedIn: 'root',
})
export class BossDialogService {
  private readonly dialogSubject = new BehaviorSubject<BossDialog | null>(null);
  readonly dialog$ = this.dialogSubject.asObservable();
  readonly isOpen$ = this.dialog$.pipe(
    map((dialog) => !!dialog),
    distinctUntilChanged(),
  );

  open(dialog: BossDialog): void {
    this.dialogSubject.next(dialog);
  }

  close(): void {
    this.dialogSubject.next(null);
  }

  get isOpen(): boolean {
    return this.dialogSubject.value !== null;
  }
}
