import { HazardData, HazardType } from './phase-playable-data.model';

export interface Hazard extends HazardData {
  active: boolean;
  pulseOffset: number;
}
