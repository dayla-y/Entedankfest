import { CHARACTER_ASSET_KEY } from "../../assets/asset-keys";
import { DIRECTION } from "../../common/direction.js";
import { TILE_SIZE } from "../../config";
import { getTargetPositionFromGameObjectPositionAndDirection } from "../../utils/grid-utils";
import { exhaustiveGuard } from "../../utils/guard";
import { Character } from "./characters";

/**
 * @typedef PlayerConfigProps
 * @type {object}
 * @property {Phaser.Tilemaps.TilemapLayer} collisionLayer
 * @property {Phaser.Tilemaps.ObjectLayer} [entranceLayer]
 * @property {(entranceName: string, entranceId: string, isBuildingEntrance: boolean)=> void} enterEntranceCallback
 */

/**
 * @typedef {Omit<import("./characters").CharacterConfig, 'assetKey' | 'idleFrameConfig'> & PlayerConfigProps} PlayerConfig
 */
export class Player extends Character {
  /** @type {Phaser.Tilemaps.ObjectLayer | undefined} */
  #entranceLayer;
  /** @type {(entranceName: string, entranceId: string, isBuildingEntrance: boolean)=> void} */
  #enterEntraceCallback;

  /**
   * @param {PlayerConfig} config
   */
  constructor(config) {
    super({
      ...config,
      assetKey: CHARACTER_ASSET_KEY.FOCALORS,
      origin: { x: 0, y: .2},
      idleFrameConfig: {
          DOWN: 1,
          UP: 10,
          NONE: 2,
          LEFT: 4,
          RIGHT: 7,
      },
    });

    this.#entranceLayer = config.entranceLayer;
    this.#enterEntraceCallback = config.enterEntranceCallback;
  }

  /**
   * @param {import('../../common/direction.js').Direction} direction
   * @returns {void}
   */
  moveCharacter(direction) {
  super.moveCharacter(direction);

  switch (this._direction) {
    case DIRECTION.DOWN:
    case DIRECTION.LEFT:
    case DIRECTION.RIGHT:
    case DIRECTION.UP:
      if (
        !this._phaserGameObject.anims.isPlaying ||
        this._phaserGameObject.anims.currentAnim?.key !== `FOCALORS_${this._direction}`
      ) {
        this._phaserGameObject.play(`FOCALORS_${this._direction}`);
      }
      break;
    case DIRECTION.NONE:
      break;
    default:
      exhaustiveGuard(this._direction);
  }

  if(this._isMoving && this.#entranceLayer !== undefined){
    const targetPosition = getTargetPositionFromGameObjectPositionAndDirection(
      {x: this._phaserGameObject.x, y: this._phaserGameObject.y},
      this._direction
    );
    const nearbyEntrance = this.#entranceLayer.objects.find((object) =>{
      if(!object.x || !object.y){
        return false;
      }
      return object.x === targetPosition.x && object.y - TILE_SIZE === targetPosition.y
    });
    if(!nearbyEntrance){
      return;
    }

    // Entrance is nearby and the player is trying to enter that location
    const entranceName = nearbyEntrance.properties.find((property) => property.name === 'connects_to').value;
    const entranceId = nearbyEntrance.properties.find((property) => property.name === 'entrance_id').value;
    const isBuildingEntrance = nearbyEntrance.properties.find((property) => property.name === 'is_building').value;
    this.#enterEntraceCallback(entranceName, entranceId, isBuildingEntrance);
  }

  this._phaserGameObject.setDepth(this._phaserGameObject.y);
}
  update(time) {
    super.update(time);

    // Ajustar la profundidad también al actualizar
    this._phaserGameObject.setDepth(this._phaserGameObject.y);    
}
}
