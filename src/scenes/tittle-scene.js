import Phaser from "phaser";
import { SCENE_KEYS } from './scene-keys.js';
import { AUDIO_ASSET_KEY, TITLE_ASSET_KEY, UI_ASSET_KEYS } from "../assets/asset-keys.js";
import { CARETODANCE } from "../assets/font-keys.js";
import { Controls } from "../utils/controls.js";
import { DIRECTION } from "../common/direction.js";
import { exhaustiveGuard } from "../utils/guard.js";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "../utils/data-manager.js";
import { BaseScene } from "./base-scene.js";
import { playBackgroundMusic } from "../types/audio-utils.js";

/** @type {Phaser.Types.GameObjects.Text.TextStyle} */
export const MENU_UI_TEXT_STYLE = Object.freeze({
    fontFamily: CARETODANCE,
    color: '#4D4A49',
    fontSize: '20px',
});
const PLAYER_INPUT_CURSOR_POSITION = Object.freeze({
    x: 150,
    y: 40,
});

/**
 * @typedef {keyof typeof MAIN_MENU_OPTIONS} MainMenuOptions
 */

/** @enum {MainMenuOptions} */
const MAIN_MENU_OPTIONS = Object.freeze({
    NEW_GAME: 'NEW_GAME',
    CONTINUE: 'CONTINUE',
    OPTIONS: 'OPTIONS',
});
export class TitleScene extends BaseScene {
    /** @type {Phaser.GameObjects.Image} */
    #mainMenuCursorPhaserImageObject1;
    /** @type {Phaser.GameObjects.Image} */
    #mainMenuCursorPhaserImageObject2;
    /** @type {MainMenuOptions} */
    #selectedMenuOption;
    /** @type {boolean} */
    #isContinueButtonEnabled;

  constructor() {
    super({
      key: SCENE_KEYS.TITLE_SCENE,
    });
  }
  create() {
    super.create();

    this.#selectedMenuOption = MAIN_MENU_OPTIONS.NEW_GAME;
    this.#isContinueButtonEnabled = dataManager.store.get(DATA_MANAGER_STORE_KEYS.GAME_STARTED) || false;

    //create title scene background
    this.add.image(0, 0, TITLE_ASSET_KEY.BACKGROUND).setOrigin(0).setScale(1.3339, 1.03);
    this.add.image(this.scale.width/2, 130, TITLE_ASSET_KEY.PANEL)
    .setScale(2)
    this.add.image(this.scale.width/2, 130, TITLE_ASSET_KEY.TITLE)
    .setScale(.55)
    .setAlpha(0.5);

    //create menu
    const menuBgWidht = 500;
    const menuBg = this.add.image(60, -70, UI_ASSET_KEYS.MENU_BACKGROUND).setOrigin(0).setScale(.9, .70);
    const newGameText = this.add.text(menuBgWidht/2, 40, 'New Game', MENU_UI_TEXT_STYLE).setOrigin(.5);
    const continueText = this.add.text(menuBgWidht/2, 90, 'Continue', MENU_UI_TEXT_STYLE).setOrigin(.5);
    if(!this.#isContinueButtonEnabled){
        continueText.setAlpha(.5);
    }
    const OptionText = this.add.text(menuBgWidht/2, 140, 'Options', MENU_UI_TEXT_STYLE).setOrigin(.5);


    const menuContainer = this.add.container(0, 0, [menuBg, newGameText, continueText, OptionText]);
    menuContainer.setPosition(this.scale.width/2 -menuBgWidht /2, 300);
    
    this.tweens.add({
        delay: 500,
        duration:500,
        repeat: 0,
        y: {
            from: -200,
            start: 700,
            to: 300,
        },
        targets: menuContainer,
    });

    //create cursors
    this.#mainMenuCursorPhaserImageObject1 = this.add.image(PLAYER_INPUT_CURSOR_POSITION.x, PLAYER_INPUT_CURSOR_POSITION.y, UI_ASSET_KEYS.CURSOR_LEFT)
        .setOrigin(.8, .5)
        .setScale(2)
        .setFlipX(true);
    menuContainer.add(this.#mainMenuCursorPhaserImageObject1);
    this.tweens.add({
        delay:0,
        duration:500,
        repeat: -1,
        x: {
            from: PLAYER_INPUT_CURSOR_POSITION.x,
            start: PLAYER_INPUT_CURSOR_POSITION.x,
            to: PLAYER_INPUT_CURSOR_POSITION.x +3,
        },
        targets: this.#mainMenuCursorPhaserImageObject1,
    });
    this.#mainMenuCursorPhaserImageObject2 = this.add.image(PLAYER_INPUT_CURSOR_POSITION.x, PLAYER_INPUT_CURSOR_POSITION.y, UI_ASSET_KEYS.CURSOR_LEFT)
        .setOrigin(-5.9, .5)
        .setScale(2)
    menuContainer.add(this.#mainMenuCursorPhaserImageObject2);

    this.tweens.add({
        delay:0,
        duration:500,
        repeat: -1,
        x: {
            from: PLAYER_INPUT_CURSOR_POSITION.x,
            start: PLAYER_INPUT_CURSOR_POSITION.x,
            to: PLAYER_INPUT_CURSOR_POSITION.x -3,
        },
        targets: this.#mainMenuCursorPhaserImageObject2,
    });
    //add in fade effects
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, ()=>{
        if(this.#selectedMenuOption === MAIN_MENU_OPTIONS.OPTIONS){
            this.scene.start(SCENE_KEYS.OPTIONS_SCENE);
            return;
        }

        if(this.#selectedMenuOption === MAIN_MENU_OPTIONS.NEW_GAME){
            dataManager.startNewGame(this);
        }
        this.scene.start(SCENE_KEYS.WORLD_SCENE);
        
    });
    playBackgroundMusic(this, AUDIO_ASSET_KEY.TITLE);

  }
  update(){
    super.update();

    if(this._controls.isInputLocked){
        return;
    }
    const wasSpaceKeyPressed = this._controls.wasSpaceKeyPressed();
    if(wasSpaceKeyPressed){
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this._controls.lockInput = true;
        return;
    }

    const selectedDirection = this._controls.getDirectionKeyJustPressed();
    if (selectedDirection !== DIRECTION.NONE){
        this.#moveMenuSelectCursor(selectedDirection);
    }
  }
  /**
   * 
   * @param {import("../common/direction.js").Direction} direction 
   * @returns {void}
   */

  #moveMenuSelectCursor(direction){
    this.#updateSelectedMenuOptionFromInput(direction);
    switch (this.#selectedMenuOption){
        case MAIN_MENU_OPTIONS.NEW_GAME:
        this.#mainMenuCursorPhaserImageObject1.setY(PLAYER_INPUT_CURSOR_POSITION.y);
        this.#mainMenuCursorPhaserImageObject2.setY(PLAYER_INPUT_CURSOR_POSITION.y);
        break;
        case MAIN_MENU_OPTIONS.CONTINUE:
        this.#mainMenuCursorPhaserImageObject1.setY(91);
        this.#mainMenuCursorPhaserImageObject2.setY(91);
        break;
        case MAIN_MENU_OPTIONS.OPTIONS:
        this.#mainMenuCursorPhaserImageObject1.setY(141);
        this.#mainMenuCursorPhaserImageObject2.setY(141);
        break;
        default:
            exhaustiveGuard(this.#selectedMenuOption);
    }
  }

  /**
   * 
   * @param {import("../common/direction.js").Direction} direction 
   * @returns {void}
   */

  #updateSelectedMenuOptionFromInput(direction){
    switch(direction){
        case DIRECTION.UP:
            if (this.#selectedMenuOption === MAIN_MENU_OPTIONS.NEW_GAME){
                return;
            }
            if (this.#selectedMenuOption === MAIN_MENU_OPTIONS.CONTINUE){
                this.#selectedMenuOption = MAIN_MENU_OPTIONS.NEW_GAME;
                return;
            }
            if (this.#selectedMenuOption === MAIN_MENU_OPTIONS.OPTIONS && !this.#isContinueButtonEnabled){
                this.#selectedMenuOption = MAIN_MENU_OPTIONS.NEW_GAME;
                return;
            }
            this.#selectedMenuOption = MAIN_MENU_OPTIONS.CONTINUE;
            return;
        case DIRECTION.DOWN:
            if (this.#selectedMenuOption === MAIN_MENU_OPTIONS.OPTIONS){
                return;
            }
            if (this.#selectedMenuOption === MAIN_MENU_OPTIONS.CONTINUE){
                this.#selectedMenuOption = MAIN_MENU_OPTIONS.OPTIONS;
                return;
            }
            if (this.#selectedMenuOption === MAIN_MENU_OPTIONS.NEW_GAME && !this.#isContinueButtonEnabled){
                this.#selectedMenuOption = MAIN_MENU_OPTIONS.OPTIONS;
                return;
            }
            this.#selectedMenuOption = MAIN_MENU_OPTIONS.CONTINUE;
            return;
        case DIRECTION.LEFT:
        case DIRECTION.RIGHT:
        case DIRECTION.NONE:
            return;
        default:
            exhaustiveGuard(direction);
    }

  }
}