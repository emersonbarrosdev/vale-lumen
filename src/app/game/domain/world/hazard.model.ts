import { HazardData } from './phase-playable-data.model';

export interface Hazard extends HazardData {
  active: boolean;

  /**
   * Offset de animação usado por goo/crystal/geyser.
   */
  pulseOffset: number;
}
