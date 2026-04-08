import { Injectable } from '@angular/core';
import {
  SECRET_CODES,
  SECRET_CODE_INPUT_BUFFER_LIMIT,
  SECRET_CODE_INPUT_TIMEOUT_MS,
  SecretCodeDefinition,
} from '../../core/config/secret-codes.config';

export type SecretCodeDirection = 'up' | 'down' | 'left' | 'right';

export interface SecretCodeMatch {
  codeId: string;
  action: SecretCodeDefinition['action'];
  bossPhase?: number;
}

@Injectable({
  providedIn: 'root',
})
export class SecretCodeService {
  private inputBuffer: SecretCodeDirection[] = [];
  private lastInputAt = 0;

  pushInput(direction: SecretCodeDirection): SecretCodeMatch | null {
    const now = performance.now();

    if (now - this.lastInputAt > SECRET_CODE_INPUT_TIMEOUT_MS) {
      this.clearBuffer();
    }

    this.lastInputAt = now;
    this.inputBuffer.push(direction);

    if (this.inputBuffer.length > SECRET_CODE_INPUT_BUFFER_LIMIT) {
      this.inputBuffer.shift();
    }

    return this.findMatch();
  }

  clearBuffer(): void {
    this.inputBuffer = [];
    this.lastInputAt = 0;
  }

  private findMatch(): SecretCodeMatch | null {
    for (const code of SECRET_CODES) {
      if (!code.enabled) {
        continue;
      }

      if (!this.endsWithSequence(this.inputBuffer, code.sequence)) {
        continue;
      }

      this.clearBuffer();

      return {
        codeId: code.id,
        action: code.action,
        bossPhase: code.bossPhase,
      };
    }

    return null;
  }

  private endsWithSequence(
    buffer: string[],
    sequence: string[],
  ): boolean {
    if (sequence.length > buffer.length) {
      return false;
    }

    const startIndex = buffer.length - sequence.length;

    for (let index = 0; index < sequence.length; index += 1) {
      if (buffer[startIndex + index] !== sequence[index]) {
        return false;
      }
    }

    return true;
  }
}
