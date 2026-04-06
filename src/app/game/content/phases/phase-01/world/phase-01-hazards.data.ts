import { HazardData } from '../../../../domain/world/phase-playable-data.model';

export function getPhase01Hazards(): HazardData[] {
  return [
    { type: 'goo', x: 395, y: 642, width: 130, height: 26, damage: 20 },
    { type: 'goo', x: 895, y: 642, width: 140, height: 28, damage: 20 },
    { type: 'goo', x: 1435, y: 642, width: 155, height: 28, damage: 24 },
    { type: 'goo', x: 1945, y: 642, width: 190, height: 28, damage: 24 },
    { type: 'goo', x: 2515, y: 642, width: 190, height: 28, damage: 24 },
    { type: 'goo', x: 3115, y: 642, width: 155, height: 28, damage: 24 },
    { type: 'goo', x: 3635, y: 642, width: 175, height: 28, damage: 24 },
    { type: 'goo', x: 4205, y: 642, width: 155, height: 28, damage: 26 },
    { type: 'goo', x: 4740, y: 642, width: 150, height: 28, damage: 26 },

    { type: 'crystal', x: 1988, y: 544, width: 62, height: 76, damage: 22 },
    { type: 'crystal', x: 3070, y: 516, width: 66, height: 104, damage: 22 },
    { type: 'crystal', x: 4275, y: 532, width: 70, height: 88, damage: 24 },
  ];
}
