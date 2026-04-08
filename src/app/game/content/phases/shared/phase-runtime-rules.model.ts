export interface PhaseRuntimeRules {
  /**
   * Largura total do mundo da fase.
   */
  worldWidth: number;

  /**
   * Xs usados para checkpoints de progresso.
   */
  checkpointXs: number[];

  /**
   * Distância usada para score por avanço.
   */
  scoreStepDistance: number;

  /**
   * Pontos recebidos por step avançado.
   */
  scorePerStep: number;

  /**
   * Offset adicional abaixo da tela para considerar morte por queda.
   */
  heroFallDeathOffset: number;
}

export interface PhaseBossRuntimeRules {
  /**
   * Distância antes da arena em que o boss pode ser ativado.
   */
  arenaTriggerOffset: number;

  /**
   * Quanto o herói pode recuar no lado esquerdo da arena.
   */
  heroArenaLeftOffset: number;

  /**
   * Margem do lado direito da arena para o herói.
   */
  heroArenaRightOffset: number;
}
