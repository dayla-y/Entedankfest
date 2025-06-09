import Phaser from 'phaser';
import { BATTLE_BACKGROUND_ASSET_KEYS } from "../assets/asset-keys";

export class Background{
    /** @type {Phaser.Scene}*/
    #scene
    /** @type {Phaser.GameObjects.Image} */
    #backgroundGameObject;

    /**
     * 
     * @param {Phaser.Scene} scene that Phaser 3 Scene
     */
    constructor(scene){
        this.#scene = scene;

        this.#backgroundGameObject = this.#scene.add
        .image(0,0, BATTLE_BACKGROUND_ASSET_KEYS.FOREST)
        .setOrigin(0)
        .setAlpha(0)
        .setScale(.5, .5);
        
    }

    showForest(){
        this.#backgroundGameObject.setTexture(BATTLE_BACKGROUND_ASSET_KEYS.FOREST).setAlpha(1);
    }
}