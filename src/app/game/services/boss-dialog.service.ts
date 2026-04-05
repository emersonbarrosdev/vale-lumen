import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BossDialog } from '../domain/bosses/boss-dialog.model';

@Injectable({
  providedIn: 'root',
})
export class BossDialogService {
  private readonly dialogSubject = new BehaviorSubject<BossDialog | null>(null);
  readonly dialog$ = this.dialogSubject.asObservable();

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
