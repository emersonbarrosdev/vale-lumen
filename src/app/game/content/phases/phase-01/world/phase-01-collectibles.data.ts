import { CollectibleData } from '../../../../domain/world/collectible.model';

export function getPhase01Collectibles(): CollectibleData[] {
  return [
    /**
     * Vida escondida no início, no estilo Sonic:
     * a câmera começa um pouco à frente, mas se o jogador voltar,
     * encontra a recompensa atrás.
     */
    { type: 'heart', x: 86, y: 572 },

    /**
     * Proteção inicial visível, mas não imediata
     */
    { type: 'shieldOrb', x: 320, y: 580 },

    /**
     * Pequena linha de moedas para sugerir a plataforma inicial
     */
    { type: 'coin', x: 286, y: 462 },
    { type: 'coin', x: 324, y: 450 },
    { type: 'coin', x: 362, y: 462 },

    /**
     * Primeiro trecho com salto moderado
     */
    { type: 'coin', x: 1850, y: 462 },
    { type: 'coin', x: 1890, y: 450 },
    { type: 'coin', x: 1930, y: 462 },

    { type: 'specialCoin', x: 2178, y: 398 },

    /**
     * Túnel: poucas moedas, só para indicar a rota
     */
    { type: 'coin', x: 3284, y: 470 },
    { type: 'coin', x: 3330, y: 458 },

    /**
     * Trecho linear com recompensa simples
     */
    { type: 'coin', x: 4300, y: 584 },
    { type: 'coin', x: 4342, y: 572 },
    { type: 'coin', x: 4384, y: 584 },

    /**
     * Sequência do buraco grande com plataformas que caem
     * moedas guiando a subida
     */
    { type: 'coin', x: 4748, y: 450 },
    { type: 'coin', x: 4924, y: 394 },
    { type: 'coin', x: 5098, y: 336 },
    { type: 'specialCoin', x: 5128, y: 312 },

    /**
     * Respiro depois do desafio
     */
    { type: 'heart', x: 6668, y: 580 },

    /**
     * Trecho linear longo: poucas moedas no chão
     */
    { type: 'coin', x: 6982, y: 464 },
    { type: 'coin', x: 7024, y: 452 },
    { type: 'coin', x: 7066, y: 464 },

    { type: 'coin', x: 7344, y: 402 },
    { type: 'ray', x: 7380, y: 396 },

    /**
     * Segundo buraco menor
     */
    { type: 'coin', x: 8500, y: 476 },
    { type: 'coin', x: 8544, y: 464 },
    { type: 'coin', x: 8588, y: 476 },

    /**
     * Trecho mais longo final
     */
    { type: 'coin', x: 9886, y: 468 },
    { type: 'coin', x: 9928, y: 456 },
    { type: 'coin', x: 9970, y: 468 },

    { type: 'specialCoin', x: 10278, y: 392 },

    /**
     * Último trecho antes do boss
     */
    { type: 'coin', x: 11434, y: 468 },
    { type: 'flameVial', x: 11500, y: 472 },

    /**
     * Pré-boss
     */
    { type: 'coin', x: 12112, y: 586 },
    { type: 'coin', x: 12156, y: 574 },
    { type: 'coin', x: 12200, y: 586 },
  ];
}
