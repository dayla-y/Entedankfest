import { CHARACTER_ASSET_KEY } from "../../assets/asset-keys.js";
import { DIRECTION } from "../../common/direction.js";
import { exhaustiveGuard } from "../../utils/guard.js";
import { Character } from "./characters.js";

/**
 * @typedef {keyof typeof NPC_MOVEMENT_PATTERN} NpcMovementPattern
 */

/** @enum {NpcMovementPattern} */
export const NPC_MOVEMENT_PATTERN = Object.freeze ({
    IDLE: 'IDLE',
    CLOCKWISE: 'CLOCKWISE'
});

/**
 * @typedef NPCPath
 * @type {Object.<number, import("../../types/typedef.js").Coordinate>}
 */

/**
 * @typedef NPCConfigProps
 * @type {object}
 * @property {number} frame
 * @property {string[]} assetKeys
 * @property {NPCPath} npcPath
 * @property {NpcMovementPattern} movementPattern
 * @property {import("../../types/typedef.js").NpcEvent[]} events
 */

/**
 * @typedef {Omit<import('./characters').CharacterConfig, 'assetKey' | 'idleFrameConfig'> & NPCConfigProps} NPCConfig
 */


export class NPC extends Character {
    /** @type {boolean} */
    #talkingToPlayer;
    /** @type {NPCPath} */
    #npcPath;
    /** @type {number} */
    #currentPathIndex;
    /** @type {NpcMovementPattern} */
    #movementPattern;
    /** @type {number} */
    #lastMovementTime;
    /** @type {import("../../types/typedef.js").NpcEvent[]} */
    #events;

  
    /**
     * @param {NPCConfig} config
     */
    constructor(config) {
      super({
        ...config,
        assetKey: config.assetKeys[0], // Inicializa con la primera clave
        origin: { x: 0, y: .2 },
        idleFrameConfig: {
          DOWN: 1,
          UP: 10,
          NONE: config.frame,
          LEFT: 4,
          RIGHT: 7,
        },
      });
  
      this.#talkingToPlayer = false;
      this.#npcPath = config.npcPath;
      this.#currentPathIndex = 0;
      this.#movementPattern = config.movementPattern;
      this.#lastMovementTime = Phaser.Math.Between(3500, 5000);
      this.#events = config.events;

      
      /** @type {string[]} */
      this.assetKeys = config.assetKeys; // Guarda todos los assetKeys
    }
  
    /** @type {import("../../types/typedef.js").NpcEvent[]} */
    get events() {
      return [...this.#events];
    }
  
    /** @type {boolean} */
    get isTalkingToPlayer() {
      return this.#talkingToPlayer;
    }
  
    /**
     * @param {boolean} val
     */
    set isTalkingToPlayer(val) {
      this.#talkingToPlayer = val;
    }
  
    /**
     * @param {import('../../common/direction.js').Direction} playerDirection
     * @returns {void}
     */
    facePlayer(playerDirection) {
      switch (playerDirection) {
        case DIRECTION.DOWN:
          this._phaserGameObject.setFrame(this._idleFrameConfig.UP);
          break;
        case DIRECTION.LEFT:
          this._phaserGameObject.setFrame(this._idleFrameConfig.RIGHT);
          break;
        case DIRECTION.RIGHT:
          this._phaserGameObject.setFrame(this._idleFrameConfig.LEFT);
          break;
        case DIRECTION.UP:
          this._phaserGameObject.setFrame(this._idleFrameConfig.DOWN);
          break;
        case DIRECTION.NONE:
          break;
        default:
          exhaustiveGuard(playerDirection);
      }
    }
  
    /**
     * @param {DOMHighResTimeStamp} time
     * @returns {void}
     */
    update(time) {
      if (this._isMoving) {
        return;
      }
      if (this.#talkingToPlayer) {
        return;
      }
      super.update(time);
  
      if (this.#movementPattern === NPC_MOVEMENT_PATTERN.IDLE) {
        return;
      }
  
      if (this.#lastMovementTime < time) {
        /** @type {import('../../common/direction.js').Direction} */
        let characterDirection = DIRECTION.NONE;
        let nextPosition = this.#npcPath[this.#currentPathIndex + 1];
  
        const prevPosition = this.#npcPath[this.#currentPathIndex];
        if (prevPosition.x !== this._phaserGameObject.x || prevPosition.y !== this._phaserGameObject.y) {
          nextPosition = this.#npcPath[this.#currentPathIndex];
        } else {
          if (nextPosition === undefined) {
            nextPosition = this.#npcPath[0];
            this.#currentPathIndex = 0;
          } else {
            this.#currentPathIndex = this.#currentPathIndex + 1;
          }
        }
  
        if (nextPosition.x > this._phaserGameObject.x) {
          characterDirection = DIRECTION.RIGHT;
        } else if (nextPosition.x < this._phaserGameObject.x) {
          characterDirection = DIRECTION.LEFT;
        } else if (nextPosition.y < this._phaserGameObject.y) {
          characterDirection = DIRECTION.UP;
        } else if (nextPosition.y > this._phaserGameObject.y) {
          characterDirection = DIRECTION.DOWN;
        }
  
        this.moveCharacter(characterDirection);
        this.#lastMovementTime = time + Phaser.Math.Between(2000, 5000);
        this._phaserGameObject.setDepth(this._phaserGameObject.y);
      }
    }
  
    /**
     * @param {import('../../common/direction.js').Direction} direction
     * @returns {void}
     */
    moveCharacter(direction) {
      super.moveCharacter(direction);
  
      switch (this._direction) {
        case DIRECTION.DOWN:
        case DIRECTION.RIGHT:
        case DIRECTION.UP:
        case DIRECTION.LEFT:

          if (
            !this._phaserGameObject.anims.isPlaying ||
            this._phaserGameObject.anims.currentAnim?.key !== `${this.assetKeys}_${this._direction}`
          ) {
            this._phaserGameObject.play(`${this.assetKeys}_${this._direction}`);
          }
          break;
        case DIRECTION.NONE:
          break;
        default:
          // We should never reach this default case
          exhaustiveGuard(this._direction);
          this._phaserGameObject.setDepth(this._phaserGameObject.y);
      }
    }
    
  }
  