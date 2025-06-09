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
 * @property {{position: import('../../types/typedef.js').Coordinate}[]} [objectsToCheckForCollisionsWith]
 */

export default class Character extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    

    // Configuración inicial
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.texture = texture;
    this.velocidadPlayer = 800;
    this._otherCharactersToCheckForCollisionsWith = []; // Lista para comprobar colisiones
    

    // Agregar física y existencia
    this.scene.physics.add.existing(this);
    this.scene.add.existing(this);

    // Configuración de cuerpo
    this.body.setSize(60, 60, true);
    this.body.setOffset(51, 68);

    // Crear animaciones
    this.creaAnimaciones("parado", 11, 16, 10, -1);
    this.creaAnimaciones("ataque", 0, 6, 10, -1);
    this.creaAnimaciones("caminar", 33, 39, 10, -1);
    this.creaAnimaciones("saltar", 22, 32, 10, -1);

    // Reproducir animación de caminar por defecto
    this.anims.play("caminar");

    // Teclas
    this.scene.cursors = this.scene.input.keyboard.createCursorKeys();
  }

  // Método para crear animaciones
  creaAnimaciones(nombreAnimacion, frameInicial, frameFinal, velocidadRep, repetir) {
    this.scene.anims.create({
      key: nombreAnimacion,
      frames: this.scene.anims.generateFrameNumbers(this.texture, {
        start: frameInicial,
        end: frameFinal,
      }),
      frameRate: velocidadRep, // velocidad de animación
      repeat: repetir, // -1 loop, 0 solo una vez
    });
  }

  // Método de actualización (actualiza el movimiento y la animación)
  update() {
    // Movimiento horizontal
    if (this.scene.cursors.right.isDown) {
      this.setVelocityX(this.velocidadPlayer);
      this.flipX = false;
    } else if (this.scene.cursors.left.isDown) {
      this.setVelocityX(-this.velocidadPlayer);
      this.flipX = true;
    } else {
      this.setVelocityX(0);
    }

    // Movimiento vertical
    if (this.scene.cursors.up.isDown) {
      this.setVelocityY(-this.velocidadPlayer);
    } else if (this.scene.cursors.down.isDown) {
      this.setVelocityY(this.velocidadPlayer);
    } else {
      this.setVelocityY(0);
    }

    // Salto
    if (this.scene.cursors.space.isDown) {
      this.setVelocityY(-900); // Ajusta la fuerza del salto
    }
  }

  // Método para añadir otros personajes a la lista de colisiones
  addCharacterToCheckForCollisionsWith(character) {
    this._otherCharactersToCheckForCollisionsWith.push(character);
  }

  // Método para verificar si la posición colisiona con otro personaje
  doesPositionCollideWithOtherCharacter(position) {
    const { x, y } = position;
    for (const character of this._otherCharactersToCheckForCollisionsWith) {
      if (character.sprite.getBounds().contains(x, y)) {
        return true;
      }
    }
    return false;
  }
}
