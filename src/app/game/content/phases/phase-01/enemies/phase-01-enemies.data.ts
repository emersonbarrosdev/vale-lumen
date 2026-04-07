import { EnemyData } from '../../../../domain/enemies/enemy.model';

export function getPhase01Enemies(): EnemyData[] {
  return [
    /**
     * Trecho inicial:
     * sem poluir demais logo no começo
     */
    { type: 'errante', x: 880, y: 576, patrolLeft: 760, patrolRight: 1180 },

    /**
     * Primeiro trecho com salto
     * inimigo em chão firme e vigia em plataforma válida
     */
    { type: 'errante', x: 1715, y: 576, patrolLeft: 1635, patrolRight: 1970 },
    { type: 'vigia', x: 2158, y: 380, patrolLeft: 2148, patrolRight: 2236 },

    /**
     * Túnel
     */
    { type: 'errante', x: 3400, y: 576, patrolLeft: 3040, patrolRight: 3730 },

    /**
     * Trecho linear
     */
    { type: 'errante', x: 4300, y: 576, patrolLeft: 4110, patrolRight: 4620 },

    /**
     * Plataformas que caem:
     * só um inimigo antes do desafio, não em cima delas
     */
    { type: 'errante', x: 5350, y: 576, patrolLeft: 5240, patrolRight: 6120 },

    /**
     * Grande trecho linear de respiro
     */
    { type: 'errante', x: 6840, y: 576, patrolLeft: 6600, patrolRight: 7200 },
    { type: 'vigia', x: 7344, y: 402, patrolLeft: 7334, patrolRight: 7420 },

    /**
     * Segundo buraco
     */
    { type: 'errante', x: 8600, y: 576, patrolLeft: 8325, patrolRight: 9100 },

    /**
     * Parte final longa
     */
    { type: 'errante', x: 9800, y: 576, patrolLeft: 9500, patrolRight: 10360 },
    { type: 'vigia', x: 11434, y: 470, patrolLeft: 11418, patrolRight: 11516 },

    /**
     * Pré-boss
     */
    { type: 'errante', x: 12180, y: 576, patrolLeft: 12090, patrolRight: 12560 },
  ];
}
