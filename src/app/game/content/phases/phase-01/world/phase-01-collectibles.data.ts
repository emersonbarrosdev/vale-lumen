import { CollectibleData } from '../../../../domain/world/collectible.model';

export function getPhase01Collectibles(): CollectibleData[] {
  return [
    /**
     * VIDA ESCONDIDA ATRÁS DO HERÓI, FORA DA TELA INICIAL.
     * O jogador precisa voltar um pouco para enxergar.
     */
    { type: 'heart', x: 0, y: 572 },

    /**
     * Proteção inicial
     */
    { type: 'shieldOrb', x: 388, y: 580 },

    /**
     * Plataforma inicial
     */
    { type: 'coin', x: 330, y: 416 },
    { type: 'coin', x: 374, y: 404 },
    { type: 'coin', x: 418, y: 416 },

    /**
     * Primeiro trecho
     */
    { type: 'coin', x: 2012, y: 386 },
    { type: 'coin', x: 2058, y: 374 },
    { type: 'coin', x: 2104, y: 386 },

    /**
     * Plataforma alta de recompensa
     */
    { type: 'coin', x: 2354, y: 264 },
    { type: 'coin', x: 2398, y: 252 },
    { type: 'coin', x: 2442, y: 240 },
    { type: 'coin', x: 2486, y: 252 },
    { type: 'specialCoin', x: 2532, y: 232 },

    /**
     * Túnel
     */
    { type: 'coin', x: 3492, y: 396 },
    { type: 'coin', x: 3538, y: 384 },

    /**
     * Trecho linear
     */
    { type: 'coin', x: 4522, y: 586 },
    { type: 'coin', x: 4568, y: 574 },
    { type: 'coin', x: 4614, y: 586 },

    /**
     * Buraco com plataformas que caem
     */
    { type: 'coin', x: 5162, y: 388 },
    { type: 'coin', x: 5322, y: 388 },
    { type: 'coin', x: 5482, y: 388 },
    { type: 'specialCoin', x: 5642, y: 384 },

    /**
     * Respiro
     */
    { type: 'heart', x: 7342, y: 580 },

    /**
     * Plataforma média
     */
    { type: 'coin', x: 7674, y: 394 },
    { type: 'coin', x: 7720, y: 382 },

    /**
     * Plataforma alta tipo Mario
     */
    { type: 'coin', x: 11154, y: 220 },
    { type: 'coin', x: 11198, y: 220 },
    { type: 'coin', x: 11242, y: 220 },
    { type: 'coin', x: 11286, y: 220 },
    { type: 'coin', x: 11330, y: 220 },
    { type: 'coin', x: 11374, y: 220 },
    { type: 'specialCoin', x: 11420, y: 212 },

    /**
     * Pré-boss
     */
    { type: 'flameVial', x: 12120, y: 578 },
  ];
}
