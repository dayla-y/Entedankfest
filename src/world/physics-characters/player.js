import { CHARACTER_ASSET_KEY } from "../../assets/asset-keys";
import { DIRECTION } from "../../common/direction.js";
import { exhaustiveGuard } from "../../utils/guard";
import { Character } from "../characters/characters";

/**
 * @typedef {Omit<import("../characters/characters").CharacterConfig, 'assetKey' | 'idleFrameConfig'>} PlayerConfig
 */
export class Player extends Character {
    constructor(config) {
        super({
          ...config,
          assetKey: CHARACTER_ASSET_KEY.LYAN,
          origin: { x: 0, y: 0.2 },
          idleFrameConfig: {
            DOWN: 0,
            UP: 57,
            NONE: 1,
            LEFT: 19,
            RIGHT: 19,
          },
        });
    
        // Inicializa variables específicas del jugador si es necesario
        this._depthAdjustment = 0.5; // Ajuste adicional para el orden de renderización
      }
    
    //   /**
    //    * Mueve al personaje en la dirección especificada y gestiona animaciones específicas del jugador.
    //    * @param {import('../../common/direction.js').Direction} direction
    //    * @returns {void}
    //    */
    //   moveCharacter(direction) {
    //     super.moveCharacter(direction);
    
    //     // Reproducir animaciones específicas del jugador según la dirección
    //     if (this._direction !== DIRECTION.NONE) {
    //       const animationKey = `LYAN_${this._direction}`;
    //       if (!this.anims.isPlaying || this.anims.currentAnim?.key !== animationKey) {
    //         this.play(animationKey);
    //       }
    //     }
    
    //     // Ajustar la profundidad dinámica del sprite para garantizar un orden de renderización correcto
    //     this.setDepth(this.y + this._depthAdjustment);
    //   }
    
    //   /**
    //    * Actualiza el estado del jugador en cada frame, como profundidad y animaciones inactivas.
    //    * @param {number} time
    //    */
    //   update(time) {
    //     super.update(time);
    
    //     // Ajustar la profundidad en caso de movimiento
    //     this.setDepth(this.y + this._depthAdjustment);
    //   }
    }