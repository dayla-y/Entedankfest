import { UI_ASSET_KEYS } from "../../../assets/asset-keys.js";
import { BATTLE_UI_TEXT_STYLE } from "./battle-menu-config.js";
import { BATTLE_MENU_CURSOR_POS } from "./battle-menu-constants.js";

export class MainBattleMenu {
    #scene;
    #mainBattleMenuContainer;
    #battleCursor;
  
    constructor(scene) {
      this.#scene = scene;
      this.#createMainBattleMenu();
    }
  
    #createMainBattleMenu() {
      this.#battleCursor = this.#scene.add.image(
        BATTLE_MENU_CURSOR_POS.x,
        BATTLE_MENU_CURSOR_POS.y,
        UI_ASSET_KEYS.CURSOR,
        0
      ).setOrigin(0.5).setScale(2);
  
      this.#mainBattleMenuContainer = this.#scene.add.container(520, 448, [
        this.#createMainInfoSubPanel(),
        this.#scene.add.text(55, 22, "Fight", BATTLE_UI_TEXT_STYLE),
        this.#scene.add.text(240, 22, "Switch", BATTLE_UI_TEXT_STYLE),
        this.#scene.add.text(55, 70, "Item", BATTLE_UI_TEXT_STYLE),
        this.#scene.add.text(240, 70, "Flee", BATTLE_UI_TEXT_STYLE),
        this.#battleCursor,
      ]);
  
      this.hide(); // Ocultarlo al inicializar.
    }
  
    #createMainInfoSubPanel() {
      return this.#scene.add
        .rectangle(0, 0, 500, 124, 0xe5e1ee, 1)
        .setOrigin(0)
        .setStrokeStyle(8, 0x5969b8, 1);
    }
  
    show() {
      this.#mainBattleMenuContainer.setAlpha(1);
    }
  
    hide() {
      this.#mainBattleMenuContainer.setAlpha(0);
    }
  }
  