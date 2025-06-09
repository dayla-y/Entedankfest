import { Menu } from "../common/menu/menu.js";
import { SCENE_KEYS } from "../scenes/scene-keys.js";

/**
 * @typedef {keyof typeof RECIPE_BOOK_MENU_OPTIONS} RecipeBookMenuOptions
 */
/** @enum {RecipeBookMenuOptions} */
export const RECIPE_BOOK_MENU_OPTIONS = Object.freeze({
    SELECT: 'SELECT',
    MOVE: 'MOVE',
    SUMMARY: 'SUMMARY',
    DESTROY: 'DESTROY',
    CANCEL: 'CANCEL',
});

export class RecipeBookMenu extends Menu{
    /**
     * @param {Phaser.Scene} scene
     * @param {string} previousSceneName
     */

    constructor(scene, previousSceneName){
        /** @type {RecipeBookMenuOptions[]} */
        const availableOptions = [
            RECIPE_BOOK_MENU_OPTIONS.SELECT,
            RECIPE_BOOK_MENU_OPTIONS.SUMMARY,
            RECIPE_BOOK_MENU_OPTIONS.CANCEL,   
        ]
        if(previousSceneName === SCENE_KEYS.WORLD_SCENE){
            availableOptions.splice(0, 1, RECIPE_BOOK_MENU_OPTIONS.MOVE);
            availableOptions.splice(2, 0, RECIPE_BOOK_MENU_OPTIONS.DESTROY);
        }
        super(scene, availableOptions);
    }

}