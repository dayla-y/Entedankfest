import Phaser from "phaser";
import { ATTACK_ASSET_KEYS } from "../../assets/asset-keys.js";
import { Attack } from "./attack.js";

export class Flame_Slash_Attack extends Attack{
    /** @protected @type {Phaser.GameObjects.Sprite} */
    _attackGameObject;



    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {import("../../types/typedef").Coordinate} position 
     */
    constructor(scene, position){
        super(scene, position);
        
        this._scene.anims.create({
            key: "FLAME_SLASH",
            frames: this._scene.anims.generateFrameNumbers(ATTACK_ASSET_KEYS.FLAME_SLASH),
            frameRate: 8,
            repeat: 0,
            delay: 0,
        });

        // create game objects
        this._attackGameObject= this._scene.add
        .sprite(this._position.x, this._position.y, ATTACK_ASSET_KEYS.FLAME_SLASH, 1)
        .setOrigin(0.4)
        .setAlpha(0);
    }

    /**
         * 
         * @param {() => void} [callback] 
         * @returns {void}
         */
    playAnimation(callback){
        if(this._isAnimationPlaying){
            return;
        }
        this._isAnimationPlaying = true;
        this._attackGameObject.setAlpha(1);

        //play animation
        this._attackGameObject.play(ATTACK_ASSET_KEYS.FLAME_SLASH);

        this._attackGameObject.once(
            Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + ATTACK_ASSET_KEYS.FLAME_SLASH, ()=>{
                this._isAnimationPlaying = false;
                this._attackGameObject.setAlpha(0).setFrame(0);
                if (callback){
                    callback();
                }
            });
    }
}
