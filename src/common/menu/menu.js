import Phaser from "phaser";
import { UI_ASSET_KEYS } from "../../assets/asset-keys";
import { CARETODANCE } from "../../assets/font-keys";
import { DIRECTION } from "../../common/direction";
import { exhaustiveGuard } from "../../utils/guard";


/** @type {Phaser.Types.GameObjects.Text.TextStyle} */
export const MENU_TEXT_STYLE = Object.freeze({
    fontFamily: CARETODANCE,
    color: '#4D4A49',
    fontSize: '10px',
});


export class Menu {
    /** @type {Phaser.Scene} */
    #scene;
    /** @type {number} */
    #padding;
    /** @type {number} */
    #width;
    /** @type {number} */
    #height;
    /** @type {Phaser.GameObjects.Image} */
    #image
    /** @type {Phaser.GameObjects.Container} */
    #container;
    /** @type {boolean} */
    #isVisible;
    /** @type {string[]} */
    #availableMenuOptions;
    /** @type {Phaser.GameObjects.Text[]} */
    #menuOptionsTextGameObjects;
    /** @type {number} */
    #selectedMenuOptionsIndex;
    /** @type {string} */
    #selectedMenuOptions;
    /** @type {Phaser.GameObjects.Image} */
    #userInputCursor

    /**
     * @param {Phaser.Scene} scene
     * @param {string[]} menuOptions
     */

    constructor(scene, menuOptions){
        this.#scene = scene;
        this.#padding= 15 ;
        this.#width = 300;
        this.#availableMenuOptions = menuOptions;
        this.#menuOptionsTextGameObjects = [];
        this.#selectedMenuOptionsIndex = 0;
        
        //calculate height based on currently available options
        this.#height = 13 + this.#padding * 2 + this.#availableMenuOptions.length * 50;

        this.#image = this.#createGraphics();
        this.#container = this.#scene.add.container(0, 0, [this.#image]).setDepth(10000);
        
        // update menu container with menu options
        for(let i = 0; i < this.#availableMenuOptions.length; i+= 1){
            const y = 10 * i + this.#padding;
            const textObj = this.#scene.add.text(80 + this.#padding, y, this.#availableMenuOptions[i], MENU_TEXT_STYLE);
            this.#menuOptionsTextGameObjects.push(textObj);
            this.#container.add(textObj);
        }

        // add player input cursor
        this.#userInputCursor = this.#scene.add.image(70 + this.#padding, 6 + this.#padding, UI_ASSET_KEYS.CURSOR_LEFT).setFlipX(true);
        this.#userInputCursor.setScale(1);
        this.#container.add(this.#userInputCursor);

        this.hide();
    }

    /** @type {boolean} */
    get isVisible(){
        return this.#isVisible;
    }

    /** @type {string} */
    get selectedMenuOption(){
        return this.#selectedMenuOptions;
    }

    show(){
        const { right, top } = this.#scene.cameras.main.worldView;
        const startX = right -this.#padding +13 -this.#width;
        const startY = top + this.#padding - 10;

        this.#container.setPosition(startX, startY);
        this.#container.setAlpha(1);
        this.#isVisible = true;
        }

    hide(){
        this.#container.setAlpha(0);
        this.#selectedMenuOptionsIndex = 0;
        this.#moveMenuCursor(DIRECTION.NONE);
        this.#isVisible = false;
    }
    /**
     * @param {import("../../common/direction").Direction| 'OK' | 'CANCEL'} input
     * @returns {void}
     */
    handlePlayerInput(input) {
        if (input === 'CANCEL') {
          this.hide();
          return;
        }
    
        if (input === 'OK') {
          this.#handleSelectedMenuOption();
          return;
        }
    
        // update selected menu option based on player input
        this.#moveMenuCursor(input);
      }
    

    #createGraphics(){
        const g = this.#scene.add.image(190, 40, UI_ASSET_KEYS.NOTIFICATION).setScale(1, .8);
        g.setAlpha(1);
        return g;

        
    }

    /**
     * @param {import("../../common/direction").Direction} direction
     * @returns {void}
     */
    #moveMenuCursor(direction) {
        switch (direction) {
          case DIRECTION.UP:
            this.#selectedMenuOptionsIndex -= 1;
            if (this.#selectedMenuOptionsIndex < 0) {
              this.#selectedMenuOptionsIndex = this.#availableMenuOptions.length - 1;
            }
            break;
          case DIRECTION.DOWN:
            this.#selectedMenuOptionsIndex += 1;
            if (this.#selectedMenuOptionsIndex > this.#availableMenuOptions.length - 1) {
              this.#selectedMenuOptionsIndex = 0;
            }
            break;
          case DIRECTION.LEFT:
          case DIRECTION.RIGHT:
            return;
          case DIRECTION.NONE:
            break;
          default:
            exhaustiveGuard(direction);
        }
    
        const x = 70 + this.#padding;
        const y = 7 + this.#padding + this.#selectedMenuOptionsIndex * 10;
    
        this.#userInputCursor.setPosition(x, y);
      }
    
    /**
     * @returns {void}
     */
    #handleSelectedMenuOption(){
        this.#selectedMenuOptions = this.#availableMenuOptions[this.#selectedMenuOptionsIndex];

    }
}