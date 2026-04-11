import { CollectibleData } from '../../../../domain/world/collectible.model';

export function getPhase01Collectibles(): CollectibleData[] {
  return [
    /**
     * 1 CORAÇÃO ESCONDIDO OPCIONAL
     * fora da visão inicial, incentivando curiosidade
     */
    { type: 'heart', x: 0, y: 572 },

    /**
     * PLATAFORMA INICIAL
     * moedas comuns para ensinar coleta logo no começo
     */
    { type: 'coin', x: 330, y: 416 },
    { type: 'coin', x: 374, y: 404 },
    { type: 'coin', x: 418, y: 416 },

    /**
     * PRIMEIRO TRECHO
     */
    { type: 'coin', x: 2012, y: 386 },
    { type: 'coin', x: 2058, y: 374 },
    { type: 'coin', x: 2104, y: 386 },

    /**
     * PLATAFORMA ALTA DE RECOMPENSA
     * moedas + primeira centelha visível em ponto alto
     */
    { type: 'coin', x: 2354, y: 264 },
    { type: 'coin', x: 2398, y: 252 },
    { type: 'coin', x: 2442, y: 240 },
    { type: 'coin', x: 2486, y: 252 },
    { type: 'specialSpark', x: 2532, y: 232 },

    /**
     * TÚNEL
     * um fragmento de vida em rota menos óbvia
     */
    { type: 'coin', x: 3492, y: 396 },
    { type: 'coin', x: 3538, y: 384 },
    { type: 'lifeFragment', x: 3590, y: 372 },

    /**
     * TRECHO LINEAR
     */
    { type: 'coin', x: 4522, y: 586 },
    { type: 'coin', x: 4568, y: 574 },
    { type: 'coin', x: 4614, y: 586 },

    /**
     * BURACO COM PLATAFORMAS QUE CAEM
     * recompensa de risco com centelha de especial
     */
    { type: 'coin', x: 5162, y: 388 },
    { type: 'coin', x: 5322, y: 388 },
    { type: 'coin', x: 5482, y: 388 },
    { type: 'specialSpark', x: 5642, y: 384 },

    /**
     * RESPIRO
     * fragmento de vida no lugar de vida inteira comum
     */
    { type: 'lifeFragment', x: 7342, y: 580 },

    /**
     * PLATAFORMA MÉDIA
     */
    { type: 'coin', x: 7674, y: 394 },
    { type: 'coin', x: 7720, y: 382 },

    /**
     * PLATAFORMA ALTA TIPO MARIO
     */
    { type: 'coin', x: 11154, y: 220 },
    { type: 'coin', x: 11198, y: 220 },
    { type: 'coin', x: 11242, y: 220 },
    { type: 'coin', x: 11286, y: 220 },
    { type: 'coin', x: 11330, y: 220 },
    { type: 'coin', x: 11374, y: 220 },
    { type: 'specialSpark', x: 11420, y: 212 },

    /**
     * TRECHO FINAL ANTES DO BOSS
     * mais moedas no último percurso para não ficar vazio
     */
    { type: 'coin', x: 11610, y: 586 },
    { type: 'coin', x: 11654, y: 574 },
    { type: 'coin', x: 11698, y: 586 },

    { type: 'coin', x: 11790, y: 586 },
    { type: 'coin', x: 11834, y: 574 },
    { type: 'coin', x: 11878, y: 586 },

    { type: 'coin', x: 11986, y: 586 },
    { type: 'coin', x: 12030, y: 574 },
    { type: 'coin', x: 12074, y: 586 },

    /**
     * PRÉ-BOSS
     * último fragmento opcional antes da arena
     */
    { type: 'lifeFragment', x: 12120, y: 578 },
  ];
}
