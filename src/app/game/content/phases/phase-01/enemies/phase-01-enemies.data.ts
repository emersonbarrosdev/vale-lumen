import { EnemyData } from '../../../../domain/enemies/enemy.model';

export function getPhase01Enemies(): EnemyData[] {
  return [
    /**
     * Bloco 1
     */
    { type: 'errante', x: 812, y: 576, patrolLeft: 752, patrolRight: 1018 },

    /**
     * Bloco 2
     */
    { type: 'errante', x: 1368, y: 568, patrolLeft: 1290, patrolRight: 1642 },
    { type: 'vigia', x: 1476, y: 299, patrolLeft: 1460, patrolRight: 1548 },

    /**
     * Bloco 3
     */
    { type: 'errante', x: 2038, y: 576, patrolLeft: 1958, patrolRight: 2238 },

    /**
     * Bloco 4 - túnel
     */
    { type: 'errante', x: 2608, y: 560, patrolLeft: 2528, patrolRight: 2880 },

    /**
     * Bloco 5
     */
    { type: 'errante', x: 3308, y: 576, patrolLeft: 3210, patrolRight: 3508 },
    { type: 'vigia', x: 3480, y: 366, patrolLeft: 3470, patrolRight: 3552 },

    /**
     * Bloco 6
     */
    { type: 'errante', x: 3918, y: 566, patrolLeft: 3822, patrolRight: 4148 },
    { type: 'vigia', x: 3968, y: 268, patrolLeft: 3950, patrolRight: 4032 },

    /**
     * Bloco 7 - travessia
     */
    { type: 'vigia', x: 5328, y: 340, patrolLeft: 5318, patrolRight: 5422 },

    /**
     * Bloco 8
     */
    { type: 'errante', x: 5738, y: 568, patrolLeft: 5640, patrolRight: 5978 },

    /**
     * Bloco 9
     */
    { type: 'errante', x: 6368, y: 576, patrolLeft: 6278, patrolRight: 6510 },

    /**
     * Bloco 10
     */
    { type: 'errante', x: 7002, y: 560, patrolLeft: 6888, patrolRight: 7268 },
    { type: 'vigia', x: 7042, y: 262, patrolLeft: 7024, patrolRight: 7108 },

    /**
     * Bloco 11
     */
    { type: 'vigia', x: 8344, y: 348, patrolLeft: 8332, patrolRight: 8436 },

    /**
     * Bloco 12
     */
    { type: 'errante', x: 8774, y: 568, patrolLeft: 8670, patrolRight: 9024 },

    /**
     * Bloco 13
     */
    { type: 'errante', x: 9346, y: 576, patrolLeft: 9258, patrolRight: 9492 },

    /**
     * Bloco 14
     */
    { type: 'errante', x: 9866, y: 560, patrolLeft: 9758, patrolRight: 10144 },
    { type: 'vigia', x: 10208, y: 302, patrolLeft: 10192, patrolRight: 10282 },

    /**
     * Bloco 15
     */
    { type: 'errante', x: 10602, y: 576, patrolLeft: 10510, patrolRight: 10754 },

    /**
     * Bloco 16
     */
    { type: 'errante', x: 11146, y: 568, patrolLeft: 11040, patrolRight: 11402 },
    { type: 'vigia', x: 11314, y: 404, patrolLeft: 11300, patrolRight: 11392 },

    /**
     * Pré-boss
     */
    { type: 'errante', x: 11724, y: 576, patrolLeft: 11682, patrolRight: 11852 },
  ];
}
