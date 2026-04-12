import { CollectibleData } from '../../../../domain/world/collectible.model';

export function getPhase01Collectibles(): CollectibleData[] {
  return [
    /**
     * INÍCIO
     */
    { type: 'coin', x: 316, y: 400 },
    { type: 'coin', x: 372, y: 360 },
    { type: 'coin', x: 448, y: 400 },

    /**
     * TRECHO 1
     */
    { type: 'coin', x: 1988, y: 366 },
    { type: 'coin', x: 2058, y: 326 },
    { type: 'coin', x: 2140, y: 366 },

    { type: 'coin', x: 2344, y: 228 },
    { type: 'coin', x: 2416, y: 188 },
    { type: 'coin', x: 2490, y: 228 },
    { type: 'specialSpark', x: 2556, y: 176 },

    /**
     * TRECHO CENTRAL
     */
    { type: 'coin', x: 3458, y: 382 },
    { type: 'coin', x: 3520, y: 350 },
    { type: 'lifeFragment', x: 3582, y: 338 },

    { type: 'coin', x: 4492, y: 560 },
    { type: 'coin', x: 4562, y: 530 },
    { type: 'coin', x: 4632, y: 560 },

    /**
     * BURACO GRANDE
     * não mexido nas plataformas sobre buraco
     */
    { type: 'coin', x: 5192, y: 504 },
    { type: 'coin', x: 5250, y: 472 },
    { type: 'coin', x: 5308, y: 504 },

    { type: 'coin', x: 5532, y: 402 },
    { type: 'coin', x: 5590, y: 370 },
    { type: 'coin', x: 5648, y: 402 },

    /**
     * RESPIRO
     */
    { type: 'lifeFragment', x: 7342, y: 576 },

    /**
     * BLOCO MÉDIO
     */
    { type: 'coin', x: 7638, y: 372 },
    { type: 'coin', x: 7720, y: 332 },
    { type: 'coin', x: 7802, y: 372 },

    { type: 'coin', x: 7868, y: 400 },
    { type: 'coin', x: 7940, y: 360 },

    /**
     * RECOMPENSA ALTA
     */
    { type: 'coin', x: 8138, y: 216 },
    { type: 'coin', x: 8218, y: 176 },
    { type: 'coin', x: 8310, y: 216 },
    { type: 'specialSpark', x: 8390, y: 164 },

    /**
     * SEGUNDO BURACO
     */
    { type: 'coin', x: 9088, y: 420 },
    { type: 'coin', x: 9132, y: 388 },

    { type: 'coin', x: 9748, y: 380 },
    { type: 'coin', x: 9830, y: 340 },

    /**
     * TRECHO FINAL
     */
    { type: 'coin', x: 10934, y: 386 },
    { type: 'coin', x: 11010, y: 348 },

    { type: 'coin', x: 11130, y: 188 },
    { type: 'coin', x: 11210, y: 148 },
    { type: 'coin', x: 11300, y: 148 },
    { type: 'coin', x: 11382, y: 188 },
    { type: 'specialSpark', x: 11434, y: 132 },

    /**
     * PRÉ-BOSS
     */
    { type: 'coin', x: 11600, y: 578 },
    { type: 'coin', x: 11680, y: 548 },
    { type: 'coin', x: 11760, y: 578 },

    { type: 'coin', x: 11860, y: 548 },
    { type: 'coin', x: 11940, y: 578 },
    { type: 'coin', x: 12020, y: 548 },

    { type: 'coin', x: 12100, y: 578 },
    { type: 'coin', x: 12180, y: 548 },
  ];
}
