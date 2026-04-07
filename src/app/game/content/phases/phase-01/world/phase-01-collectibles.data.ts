import { CollectibleData } from '../../../../domain/world/collectible.model';

export function getPhase01Collectibles(): CollectibleData[] {
  return [
    /**
     * Vida escondida no começo da fase:
     * o jogador precisa voltar um pouco para enxergar/pegar
     */
    { type: 'heart', x: 72, y: 548 },

    /**
     * Proteção inicial um pouco à frente
     */
    { type: 'shieldOrb', x: 188, y: 560 },

    /**
     * Bloco 1
     */
    { type: 'coin', x: 842, y: 458 },
    { type: 'coin', x: 878, y: 446 },
    { type: 'coin', x: 914, y: 458 },
    { type: 'coin', x: 1006, y: 394 },
    { type: 'coin', x: 1042, y: 382 },
    { type: 'coin', x: 1078, y: 394 },

    /**
     * Bloco 2
     */
    { type: 'coin', x: 1382, y: 464 },
    { type: 'coin', x: 1418, y: 452 },
    { type: 'coin', x: 1454, y: 464 },
    { type: 'coin', x: 1564, y: 408 },
    { type: 'coin', x: 1600, y: 396 },
    { type: 'coin', x: 1636, y: 408 },
    { type: 'coin', x: 1478, y: 300 },
    { type: 'specialCoin', x: 1512, y: 280 },
    { type: 'coin', x: 1546, y: 300 },

    /**
     * Bloco 3
     */
    { type: 'coin', x: 2062, y: 464 },
    { type: 'coin', x: 2098, y: 452 },
    { type: 'coin', x: 2134, y: 464 },

    /**
     * Bloco 4 - trecho do túnel
     */
    { type: 'coin', x: 2620, y: 484 },
    { type: 'coin', x: 2656, y: 472 },
    { type: 'coin', x: 2692, y: 484 },
    { type: 'coin', x: 2786, y: 432 },
    { type: 'coin', x: 2822, y: 420 },
    { type: 'coin', x: 2858, y: 432 },

    /**
     * Bloco 5
     */
    { type: 'coin', x: 3312, y: 466 },
    { type: 'coin', x: 3348, y: 454 },
    { type: 'coin', x: 3384, y: 466 },
    { type: 'coin', x: 3480, y: 394 },
    { type: 'coin', x: 3516, y: 382 },
    { type: 'coin', x: 3552, y: 394 },

    /**
     * Bloco 6
     */
    { type: 'coin', x: 3918, y: 458 },
    { type: 'coin', x: 3954, y: 446 },
    { type: 'coin', x: 3990, y: 458 },
    { type: 'coin', x: 4080, y: 398 },
    { type: 'coin', x: 4116, y: 386 },
    { type: 'coin', x: 4152, y: 398 },
    { type: 'coin', x: 3966, y: 296 },
    { type: 'ray', x: 3992, y: 292 },
    { type: 'coin', x: 4018, y: 296 },

    /**
     * Bloco 7 - travessia
     */
    { type: 'coin', x: 4938, y: 498 },
    { type: 'coin', x: 4974, y: 486 },
    { type: 'coin', x: 5118, y: 434 },
    { type: 'coin', x: 5154, y: 422 },
    { type: 'coin', x: 5320, y: 370 },
    { type: 'specialCoin', x: 5370, y: 348 },

    /**
     * Bloco 8
     */
    { type: 'coin', x: 5742, y: 464 },
    { type: 'coin', x: 5778, y: 452 },
    { type: 'coin', x: 5814, y: 464 },
    { type: 'coin', x: 5912, y: 404 },
    { type: 'coin', x: 5948, y: 392 },
    { type: 'coin', x: 5984, y: 404 },
    { type: 'heart', x: 5988, y: 574 },

    /**
     * Bloco 9
     */
    { type: 'coin', x: 6384, y: 478 },
    { type: 'coin', x: 6420, y: 466 },
    { type: 'coin', x: 6456, y: 478 },

    /**
     * Bloco 10
     */
    { type: 'coin', x: 6994, y: 462 },
    { type: 'coin', x: 7030, y: 450 },
    { type: 'coin', x: 7066, y: 462 },
    { type: 'coin', x: 7162, y: 402 },
    { type: 'coin', x: 7198, y: 390 },
    { type: 'coin', x: 7234, y: 402 },
    { type: 'coin', x: 7044, y: 290 },
    { type: 'ray', x: 7070, y: 286 },
    { type: 'coin', x: 7096, y: 290 },

    /**
     * Bloco 11
     */
    { type: 'coin', x: 7954, y: 500 },
    { type: 'coin', x: 8138, y: 436 },
    { type: 'coin', x: 8338, y: 378 },
    { type: 'specialCoin', x: 8390, y: 356 },

    /**
     * Bloco 12
     */
    { type: 'coin', x: 8768, y: 462 },
    { type: 'coin', x: 8804, y: 450 },
    { type: 'coin', x: 8840, y: 462 },
    { type: 'coin', x: 8936, y: 402 },
    { type: 'coin', x: 8972, y: 390 },
    { type: 'coin', x: 9008, y: 402 },
    { type: 'flameVial', x: 8960, y: 574 },

    /**
     * Bloco 13
     */
    { type: 'coin', x: 9348, y: 478 },
    { type: 'coin', x: 9384, y: 466 },
    { type: 'coin', x: 9420, y: 478 },

    /**
     * Bloco 14
     */
    { type: 'coin', x: 9864, y: 472 },
    { type: 'coin', x: 9900, y: 460 },
    { type: 'coin', x: 9936, y: 472 },
    { type: 'coin', x: 10034, y: 408 },
    { type: 'coin', x: 10070, y: 396 },
    { type: 'coin', x: 10106, y: 408 },
    { type: 'coin', x: 10204, y: 336 },
    { type: 'ray', x: 10234, y: 332 },
    { type: 'coin', x: 10264, y: 336 },

    /**
     * Bloco 15
     */
    { type: 'coin', x: 10598, y: 478 },
    { type: 'coin', x: 10634, y: 466 },
    { type: 'coin', x: 10670, y: 478 },

    /**
     * Bloco 16
     */
    { type: 'coin', x: 11142, y: 462 },
    { type: 'coin', x: 11178, y: 450 },
    { type: 'coin', x: 11214, y: 462 },
    { type: 'coin', x: 11312, y: 402 },
    { type: 'coin', x: 11348, y: 390 },
    { type: 'coin', x: 11384, y: 402 },
    { type: 'specialCoin', x: 11350, y: 368 },

    /**
     * Pré-boss
     */
    { type: 'coin', x: 11730, y: 584 },
    { type: 'coin', x: 11770, y: 572 },
    { type: 'coin', x: 11810, y: 584 },
    { type: 'coin', x: 12120, y: 584 },
    { type: 'coin', x: 12160, y: 572 },
    { type: 'coin', x: 12200, y: 584 },
  ];
}
