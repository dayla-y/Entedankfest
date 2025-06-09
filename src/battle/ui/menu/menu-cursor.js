import { BATTLE_MENU_CURSOR_POS } from "./battle-menu-constants";

export class MenuCursor {
  /** @type {Phaser.GameObjects.Image} */
  #cursorImage;

  constructor(scene, x, y, assetKey, scale = 1) {
    this.#cursorImage = scene.add
      .image(x, y, assetKey)
      .setOrigin(0.5)
      .setScale(scale);
  }

  setPosition(x, y) {
    this.#cursorImage.setPosition(x, y);
  }

  resetToDefaultPosition() {
    this.setPosition(BATTLE_MENU_CURSOR_POS.x, BATTLE_MENU_CURSOR_POS.y);
  }
}
