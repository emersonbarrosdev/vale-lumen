import { EnemyData } from '../../../../domain/enemies/enemy.model';

export function getPhase01Enemies(): EnemyData[] {
  return [
    { type: 'errante', x: 650, y: 576, patrolLeft: 590, patrolRight: 840 },
    { type: 'errante', x: 1150, y: 556, patrolLeft: 1090, patrolRight: 1390 },
    { type: 'vigia', x: 1240, y: 291, patrolLeft: 1220, patrolRight: 1310 },

    { type: 'errante', x: 1720, y: 576, patrolLeft: 1650, patrolRight: 1890 },
    { type: 'errante', x: 2260, y: 576, patrolLeft: 2190, patrolRight: 2460 },
    { type: 'vigia', x: 2360, y: 261, patrolLeft: 2350, patrolRight: 2440 },

    { type: 'errante', x: 2820, y: 544, patrolLeft: 2750, patrolRight: 3030 },
    { type: 'vigia', x: 2910, y: 231, patrolLeft: 2900, patrolRight: 3000 },

    { type: 'errante', x: 3390, y: 576, patrolLeft: 3320, patrolRight: 3570 },
    { type: 'errante', x: 3930, y: 554, patrolLeft: 3860, patrolRight: 4150 },
    { type: 'vigia', x: 4040, y: 255, patrolLeft: 4030, patrolRight: 4120 },

    { type: 'errante', x: 4490, y: 576, patrolLeft: 4420, patrolRight: 4670 },
  ];
}
