import Phaser from 'phaser';
import TweakPane from '../lib/tweakpane.js';
import { Background } from '../battle/background.js';
import { Attack_KEYS } from '../battle/attacks/attack-keys.js';
import { SCENE_KEYS } from './scene-keys.js';
import { Lafire } from '../battle/attacks/lafire.js';
import { Purple_Slash } from '../battle/attacks/slash-purple.js';
import { BATTLE_CHARACTHER_ASSET_KEYS } from '../assets/asset-keys.js';
import { makeDraggable } from '../utils/dragabble.js';

export class TestScene extends Phaser.Scene {
  /** @type {import('../battle/attacks/attack-keys.js').AttackKeys} */
  #selectedAttack;
  /** @type {Lafire} */
  #LafireAttack;
  /** @type {Purple_Slash} */
  #slashPurpleAttack;
  /** @type {Phaser.GameObjects.Image} */
  #playerIngredient;
  /** @type {Phaser.GameObjects.Image} */
  #enemyIngredient;

  constructor() {
    super({ key: SCENE_KEYS.TEST_SCENE });
  }

  /**
   * @returns {void}
   */
  init() {
    this.#selectedAttack = Attack_KEYS.SLASH_PURPLE;
  }

  /**
   * @returns {void}
   */
  create() {
    const background = new Background(this);
    background.showForest();

    this.#playerIngredient = this.add.image(256, 316, BATTLE_CHARACTHER_ASSET_KEYS.LYANEL, 0).setFlipX(false).setScale(2);
    this.#enemyIngredient = this.add.image(768, 144, BATTLE_CHARACTHER_ASSET_KEYS.IANTHE, 0).setFlipX(true);
    makeDraggable(this.#enemyIngredient);

    this.#LafireAttack = new Lafire(this, { x: 256, y: 344 });
    this.#slashPurpleAttack = new Purple_Slash(this, { x: 745, y: 140 });

    this.#addDataGui();
  }

  /**
   * @returns {void}
   */
  #addDataGui() {
    const pane = new TweakPane.Pane();

    const f1 = pane.addFolder({
      title: 'Monsters',
      expanded: true,
    });
    const playerIngredientFolder = f1.addFolder({
      title: 'Player',
      expanded: true,
    });
    playerIngredientFolder.addBinding(this.#playerIngredient, 'x', {
      min: 0,
      max: 1024,
      step: 1,
    });
    playerIngredientFolder.addBinding(this.#playerIngredient, 'y', {
      min: 0,
      max: 576,
      step: 1,
    });

    const enemyIngredientFolder = f1.addFolder({
      title: 'Enemy',
      expanded: true,
    });
    enemyIngredientFolder.addBinding(this.#enemyIngredient, 'x', { readonly: true });
    enemyIngredientFolder.addBinding(this.#enemyIngredient, 'y', { readonly: true });

    const f2Params = {
      attack: this.#selectedAttack,
      x: 745,
      y: 120,
    };
    const f2 = pane.addFolder({
      title: 'Attacks',
      expanded: true,
    });
    f2.addBinding(f2Params, 'attack', {
      options: {
        [Attack_KEYS.SLASH_PURPLE]: Attack_KEYS.SLASH_PURPLE,
        [Attack_KEYS.LAFIRE]: Attack_KEYS.LAFIRE,
      },
    }).on('change', (ev) => {
      if (ev.value === Attack_KEYS.LAFIRE) {
        this.#selectedAttack = Attack_KEYS.LAFIRE;
        f2Params.x = this.#LafireAttack.gameObject.x;
        f2Params.y = this.#LafireAttack.gameObject.y;
        f2.refresh();
        return;
      }
      if (ev.value === Attack_KEYS.SLASH_PURPLE) {
        this.#selectedAttack = Attack_KEYS.SLASH_PURPLE;
        f2Params.x = this.#slashPurpleAttack.gameObject.x;
        f2Params.y = this.#slashPurpleAttack.gameObject.y;
        f2.refresh();
        return;
      }
    });

    const playAttackButton = f2.addButton({
      title: 'Play',
    });
    playAttackButton.on('click', () => {
      if (this.#selectedAttack === Attack_KEYS.LAFIRE) {
        this.#LafireAttack.playAnimation();
        return;
      }

      if (this.#selectedAttack === Attack_KEYS.SLASH_PURPLE) {
        this.#slashPurpleAttack.playAnimation();
        return;
      }
    });

    f2.addBinding(f2Params, 'x', {
      min: 0,
      max: 1024,
      step: 1,
    }).on('change', (ev) => {
      this.#updateAttackGameObjectPosition('x', ev.value);
    });
    f2.addBinding(f2Params, 'y', {
      min: 0,
      max: 576,
      step: 1,
    }).on('change', (ev) => {
      this.#updateAttackGameObjectPosition('y', ev.value);
    });
  }

  /**
   * @param {'x' | 'y'} param
   * @param {number} value
   * @returns {void}
   */
  #updateAttackGameObjectPosition(param, value) {
    if (param === 'x') {
      if (this.#selectedAttack === Attack_KEYS.SLASH_PURPLE) {
        this.#slashPurpleAttack.gameObject.setX(value);
        return;
      }
      if (this.#selectedAttack === Attack_KEYS.LAFIRE) {
        this.#LafireAttack.gameObject.setX(value);
        return;
      }
    }
    if (this.#selectedAttack === Attack_KEYS.SLASH_PURPLE) {
      this.#slashPurpleAttack.gameObject.setY(value);
      return;
    }
    if (this.#selectedAttack === Attack_KEYS.LAFIRE) {
      this.#LafireAttack.gameObject.setY(value);
      return;
    }
  }
}