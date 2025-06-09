import Phaser from '../../lib/phaser.js';
import { DIRECTION } from '../../common/direction.js';
import { getTargetPositionFromGameObjectPositionAndDirection } from '../../utils/grid-utils.js';
import { exhaustiveGuard } from '../../utils/guard.js';

/**
 * @typedef CharacterIdleFrameConfig
 * @type {object}
 * @property {number} LEFT
 * @property {number} RIGHT
 * @property {number} UP
 * @property {number} DOWN
 * @property {number} NONE
 */

/**
 * @typedef CharacterConfig
 * @type {object}
 * @property {Phaser.Scene} scene the Phaser 3 Scene the battle menu will be added to
 * @property {string} assetKey the name of the asset key that should be used for this character
 * @property {import('../../types/typedef.js').Coordinate} [origin={ x:0, y:0 }]
 * @property {import('../../types/typedef.js').Coordinate} position the starting position of the character
 * @property {import('../../common/direction.js').Direction} direction the direction the character is currently facing
 * @property {() => void} [spriteGridMovementFinishedCallback] an optional callback that will be called after each step of the grid movement is complete
 * @property {CharacterIdleFrameConfig} idleFrameConfig
 * @property {Phaser.Tilemaps.TilemapLayer} [collisionLayer]
 * @property {Character[]} [otherCharactersToCheckForCollisionsWith=[]]
 * @property {() => void} [spriteChagedDirectionalCallback]
 * @property {number} hp
 * @property {{position: import('../../types/typedef.js').Coordinate}[]} [objectsToCheckForCollisionsWith]
 */

export class Character {
  /** @type {Phaser.Scene} */
  _scene;
  /** @type {Phaser.GameObjects.Sprite} */
  _phaserGameObject;
  /** @protected @type {import('../../common/direction.js').Direction} */
  _direction;
  /** @protected @type {boolean} */
  _isMoving;
  /** @protected @type {import('../../types/typedef.js').Coordinate} */
  _targetPosition;
  /** @protected @type {import('../../types/typedef.js').Coordinate} */
  _previousTargetPosition;
  /** @protected @type {() => void | undefined} */
  _spriteGridMovementFinishedCallback;
  /** @protected @type {CharacterIdleFrameConfig} */
  _idleFrameConfig;
  /** @protected @type {import('../../types/typedef.js').Coordinate} */
  _origin;
  /** @protected @type {Phaser.Tilemaps.TilemapLayer | undefined} */
  _collisionLayer;
  /** @protected @type {Character[]} */
  _otherCharactersToCheckForCollisionsWith;
  /** @protected @type {() => void | undefined} */
  _spriteChagedDirectionalCallback
  /** @protected @type {number} */
  _hp;
  /** @protected @type {{position: import('../../types/typedef.js').Coordinate}[]} */
  _objectsToCheckForCollisionsWith;
  

  /**
   * @param {CharacterConfig} config
   */
  constructor(config) {
    if (this.constructor === Character) {
      throw new Error('Character is an abstract class and cannot be instantiated.');
    }

    this._scene = config.scene;
    this._direction = config.direction;
    this._isMoving = false;
    this._targetPosition = { ...config.position };
    this._previousTargetPosition = { ...config.position };
    this._idleFrameConfig = config.idleFrameConfig;
    this._origin = config.origin ? { ...config.origin } : { x: 0, y: 0 };
    this._collisionLayer = config.collisionLayer;
    this._hp = 100;
    this._otherCharactersToCheckForCollisionsWith = config.otherCharactersToCheckForCollisionsWith || [];
    this._phaserGameObject = this._scene.physics.add
      .sprite(config.position.x, config.position.y, config.assetKey, this._getIdleFrame())
      // .setSize(50, 128)
      .setScale(.5)
      .setOrigin(this._origin.x, this._origin.y);

      // .setOrigin(this._origin.x, this._origin.y);
    this._spriteGridMovementFinishedCallback = config.spriteGridMovementFinishedCallback;
    this._spriteChagedDirectionalCallback = config.spriteGridMovementFinishedCallback;
    this._objectsToCheckForCollisionsWith = config.objectsToCheckForCollisionsWith || [];
    
  }
  

  /** @type {Phaser.GameObjects.Sprite} */
  get sprite() {
    return this._phaserGameObject;
  }
  

  /** @type {boolean} */
  get isMoving() {
    return this._isMoving;
  }

  /** @type {import('../../common/direction.js').Direction} */
  get direction() {
    return this._direction;
  }

  /**
   * @param {import('../../common/direction.js').Direction} direction
   * @returns {void}
   */
  moveCharacter(direction) {
    if (this._isMoving) {
        
      return;
    }
    this._moveSprite(direction);
  }

  /**
   * @param {Character} character
   * @returns {void}
   */
  addCharacterToCheckForCollisionsWith(character) {
    this._otherCharactersToCheckForCollisionsWith.push(character);
  }

  /**
   * @param {DOMHighResTimeStamp} time
   * @returns {void}
   */
  update(time) {
    if (this._isMoving) {
      return;
    }

    // stop current animation and show idle frame
    const idleFrame = this._phaserGameObject.anims.currentAnim?.frames[1].frame.name;
    this._phaserGameObject.anims.stop();
    this._phaserGameObject.setFrame(this._getIdleFrame());
    if (!idleFrame) {
      return;
    }
    switch (this._direction) {
      case DIRECTION.DOWN:
      case DIRECTION.LEFT:
      case DIRECTION.RIGHT:
      case DIRECTION.UP:
        this._phaserGameObject.setFrame(idleFrame);
        break;
      case DIRECTION.NONE:
        break;
      default:
        // We should never reach this default case
        exhaustiveGuard(this._direction);
    
    }
    
  }

  /**
   * @protected
   * @returns {number}
   */
  _getIdleFrame() {
    return this._idleFrameConfig[this._direction];
    
  }

  /**
   * @protected
   * @param {import('../../common/direction.js').Direction} direction
   * @returns {void}
   */
  _moveSprite(direction) {
    const changedDirection = this._direction !== direction;
    this._direction = direction;

    if(changedDirection){
      if(this._spriteChagedDirectionalCallback !== undefined){
        this._spriteChagedDirectionalCallback();
      }
    }
    if (this._isBlockingTile()) {
      return;
    }
    this._isMoving = true;
    this.#handleSpriteMovement();
  }

  /**
   * @protected
   * @returns {boolean}
   */
  _isBlockingTile() {
    if (this._direction === DIRECTION.NONE) {
      return false;
    }

    const targetPosition = { ...this._targetPosition };
    const updatedPosition = getTargetPositionFromGameObjectPositionAndDirection(targetPosition, this._direction);

    return (
      this.#doesPositionCollideWithCollisionLayer(updatedPosition) ||
      this.#doesPositionCollideWithOtherCharacter(updatedPosition) ||
      this.#doesPositionColideWithObject(updatedPosition)
    );
  }

  /**
   * @returns {void}
   */
  #handleSpriteMovement() {
    // Si no hay dirección activa, detenemos cualquier animación en curso
    if (this._direction === DIRECTION.NONE) {
        if (this._scene.tweens.getTweensOf(this._phaserGameObject).length > 0) {
            this._scene.tweens.killTweensOf(this._phaserGameObject);
        }
        this._isMoving = false;
        this._phaserGameObject.anims.stop();
        return;
    }

    const updatedPosition = getTargetPositionFromGameObjectPositionAndDirection(this._targetPosition, this._direction);
    this._previousTargetPosition = { ...this._targetPosition };
    this._targetPosition.x = updatedPosition.x;
    this._targetPosition.y = updatedPosition.y;

    // Detenemos cualquier tween en curso antes de realizar uno nuevo
    if (this._scene.tweens.getTweensOf(this._phaserGameObject).length > 0) {
        this._scene.tweens.killTweensOf(this._phaserGameObject);
    }

    // Realizamos el tween para mover al personaje
    this._scene.add.tween({
        targets: this._phaserGameObject,
        x: this._targetPosition.x,
        y: this._targetPosition.y,
        duration: 300,
        onUpdate: () => {
            // Verificar constantemente si el input sigue activo
            if (this._direction === DIRECTION.NONE) {
                this._scene.tweens.killTweensOf(this._phaserGameObject);
                this._isMoving = false;
                this._phaserGameObject.anims.stop();
                this._direction = DIRECTION.NONE;
            }
        },
        onComplete: () => {
            this._isMoving = false;
            this._previousTargetPosition = { ...this._targetPosition };
            if (this._spriteGridMovementFinishedCallback) {
                this._spriteGridMovementFinishedCallback();
            }
        },
    });
}

  /**
   * @param {import('../../types/typedef.js').Coordinate} position
   * @returns {boolean}
   */
  #doesPositionCollideWithCollisionLayer(position) {
    if (!this._collisionLayer) {
      return false;
    }

    const { x, y } = position;
    const tile = this._collisionLayer.getTileAtWorldXY(x, y, true);

    // Dibujar un rectángulo en la posición de la colisión
    // const debugGraphics = this._scene.add.graphics();
    // debugGraphics.lineStyle(2, 0x00ff00, 1); // Verde para la colisión
    // if (tile.index !== -1) {
    //     debugGraphics.strokeRect(x, y, tile.width, tile.height);
    // }

    return tile.index !== -1;
}

  /**
   * @param {import('../../types/typedef.js').Coordinate} position
   * @returns {boolean}
   */
  #doesPositionCollideWithOtherCharacter(position) {
    const { x, y } = position;
    if (this._otherCharactersToCheckForCollisionsWith.length === 0) {
      return false;
    }

    // const debugGraphics = this._scene.add.graphics();
    // debugGraphics.lineStyle(2, 0x0000ff, 1); // Azul para la colisión con otros personajes

    // Verificar y dibujar la posición de cada personaje
    const collidesWithACharacter = this._otherCharactersToCheckForCollisionsWith.some((character) => {
      const collides = (
        (character._targetPosition.x === x && character._targetPosition.y === y) ||
        (character._previousTargetPosition.x === x && character._previousTargetPosition.y === y)
      );

      // if (collides) {
      //     const characterBounds = character.sprite.getBounds();
      //     debugGraphics.strokeRect(characterBounds.x, characterBounds.y, characterBounds.width, characterBounds.height);
      // }

      return collides;
    });

    return collidesWithACharacter;
}

/**
 * 
 * @param {import('../../types/typedef.js').Coordinate} position 
 * @returns {boolean}
 */
#doesPositionColideWithObject(position){
  const { x, y } = position;
  if(this._otherCharactersToCheckForCollisionsWith.length === 0){
    return false;
  }

  const collidesWithObject = this._objectsToCheckForCollisionsWith.some((object)=>{
    return object.position.x === x && object.position.y === y;
  });
  return collidesWithObject;
}
}