import { EnemyData } from '../../../../domain/enemies/enemy.model';

export function getPhase01Enemies(): EnemyData[] {
  return [
    /**
     * INÍCIO
     * primeira gosma simples para ensinar contato/perigo básico
     */
    {
      type: 'gosmaPequena',
      x: 980,
      y: 584,
      patrolLeft: 930,
      patrolRight: 1110,
    },

    /**
     * TRECHO 1
     */
    {
      type: 'errante',
      x: 1910,
      y: 576,
      patrolLeft: 1820,
      patrolRight: 2140,
    },

    /**
     * APOIO AÉREO NO TRECHO 1
     * primeiro corvo em rota curta para pressionar salto/tiro
     */
    {
      type: 'corvoCorrompido',
      x: 2140,
      y: 338,
      patrolLeft: 1980,
      patrolRight: 2320,
    },

    /**
     * PLATAFORMA ALTA DO TRECHO 1
     */
    {
      type: 'vigia',
      x: 2410,
      y: 218,
      patrolLeft: 2350,
      patrolRight: 2508,
    },

    /**
     * TÚNEL
     * gosma em área baixa combina melhor com o trecho fechado
     */
    {
      type: 'gosmaPequena',
      x: 3520,
      y: 584,
      patrolLeft: 3340,
      patrolRight: 3820,
    },

    /**
     * SAÍDA DO TÚNEL
     * corvo para punir corrida automática depois do trecho fechado
     */
    {
      type: 'corvoCorrompido',
      x: 3970,
      y: 320,
      patrolLeft: 3840,
      patrolRight: 4170,
    },

    /**
     * TRECHO LINEAR
     */
    {
      type: 'errante',
      x: 4540,
      y: 576,
      patrolLeft: 4400,
      patrolRight: 4920,
    },

    /**
     * ANTES DO TRECHO DAS PLATAFORMAS QUE CAEM
     * gosma simples antes da área de risco
     */
    {
      type: 'gosmaPequena',
      x: 5980,
      y: 584,
      patrolLeft: 5890,
      patrolRight: 6260,
    },

    /**
     * TRECHO LINEAR GRANDE
     */
    {
      type: 'errante',
      x: 7500,
      y: 576,
      patrolLeft: 7290,
      patrolRight: 8060,
    },

    /**
     * PRESSÃO AÉREA NA SEGUNDA METADE
     */
    {
      type: 'corvoCorrompido',
      x: 7860,
      y: 296,
      patrolLeft: 7600,
      patrolRight: 8080,
    },

    /**
     * PLATAFORMA ALTA DE RECOMPENSA
     */
    {
      type: 'vigia',
      x: 8240,
      y: 188,
      patrolLeft: 8160,
      patrolRight: 8370,
    },

    /**
     * SEGUNDO TRECHO APÓS BURACO
     */
    {
      type: 'gosmaPequena',
      x: 9830,
      y: 584,
      patrolLeft: 9530,
      patrolRight: 10140,
    },

    /**
     * TRECHO FINAL
     */
    {
      type: 'errante',
      x: 11070,
      y: 576,
      patrolLeft: 10910,
      patrolRight: 11620,
    },

    /**
     * PLATAFORMA ALTA FINAL
     */
    {
      type: 'vigia',
      x: 11300,
      y: 152,
      patrolLeft: 11170,
      patrolRight: 11430,
    },

    /**
     * PRÉ-BOSS
     * mantemos pressão, mas sem poluir a entrada da arena
     */
    {
      type: 'gosmaPequena',
      x: 11730,
      y: 584,
      patrolLeft: 11630,
      patrolRight: 11870,
    },
  ];
}
