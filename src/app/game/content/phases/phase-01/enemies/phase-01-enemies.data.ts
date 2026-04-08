import { EnemyData } from '../../../../domain/enemies/enemy.model';

export function getPhase01Enemies(): EnemyData[] {
  return [
    /**
     * INÍCIO
     */
    { type: 'errante', x: 1000, y: 576, patrolLeft: 910, patrolRight: 1290 },

    /**
     * TRECHO 1
     */
    { type: 'errante', x: 1910, y: 576, patrolLeft: 1820, patrolRight: 2140 },

    /**
     * PLATAFORMA ALTA DO TRECHO 1
     */
    { type: 'vigia', x: 2410, y: 218, patrolLeft: 2350, patrolRight: 2508 },

    /**
     * TÚNEL
     */
    { type: 'errante', x: 3520, y: 576, patrolLeft: 3280, patrolRight: 3920 },

    /**
     * TRECHO LINEAR
     */
    { type: 'errante', x: 4540, y: 576, patrolLeft: 4400, patrolRight: 4920 },

    /**
     * ANTES DO TRECHO DAS PLATAFORMAS QUE CAEM
     */
    { type: 'errante', x: 5980, y: 576, patrolLeft: 5890, patrolRight: 6760 },

    /**
     * TRECHO LINEAR GRANDE
     */
    { type: 'errante', x: 7500, y: 576, patrolLeft: 7290, patrolRight: 8060 },

    /**
     * PLATAFORMA ALTA DE RECOMPENSA
     */
    { type: 'vigia', x: 8240, y: 188, patrolLeft: 8160, patrolRight: 8370 },

    /**
     * SEGUNDO TRECHO APÓS BURACO
     */
    { type: 'errante', x: 9830, y: 576, patrolLeft: 9450, patrolRight: 10350 },

    /**
     * TRECHO FINAL
     */
    { type: 'errante', x: 11070, y: 576, patrolLeft: 10910, patrolRight: 11620 },

    /**
     * PLATAFORMA ALTA FINAL
     */
    { type: 'vigia', x: 11300, y: 152, patrolLeft: 11170, patrolRight: 11430 },

    /**
     * PRÉ-BOSS
     * antes ficava perto demais da entrada da arena e podia
     * atrapalhar checkpoint/continue/intro.
     * agora foi recuado para o fim do trecho final, ainda como pressão,
     * mas sem poluir a entrada do boss.
     */
    { type: 'errante', x: 11730, y: 576, patrolLeft: 11620, patrolRight: 11890 },
  ];
}
