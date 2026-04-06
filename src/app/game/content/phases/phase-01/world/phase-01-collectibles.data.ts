import { CollectibleData } from '../../../../domain/world/collectible.model';

export function getPhase01Collectibles(): CollectibleData[] {
  return [
    { type: 'coin', x: 225, y: 492 },
    { type: 'coin', x: 705, y: 492 },
    { type: 'coin', x: 1210, y: 464 },
    { type: 'coin', x: 1770, y: 492 },
    { type: 'coin', x: 2310, y: 474 },
    { type: 'coin', x: 2875, y: 448 },
    { type: 'coin', x: 3445, y: 492 },
    { type: 'coin', x: 3985, y: 464 },
    { type: 'coin', x: 4530, y: 478 },

    { type: 'coin', x: 1266, y: 324 },
    { type: 'coin', x: 2402, y: 294 },
    { type: 'coin', x: 2952, y: 264 },
    { type: 'coin', x: 4073, y: 288 },

    { type: 'coin', x: 1312, y: 192 },
    { type: 'coin', x: 2994, y: 160 },
    { type: 'coin', x: 4114, y: 176 },

    { type: 'ray', x: 1268, y: 324 },
    { type: 'ray', x: 1312, y: 192 },
    { type: 'ray', x: 2408, y: 294 },
    { type: 'ray', x: 2958, y: 264 },
    { type: 'ray', x: 4114, y: 176 },

    { type: 'heart', x: 2410, y: 580 },
    { type: 'flameVial', x: 4120, y: 578 },
  ];
}
