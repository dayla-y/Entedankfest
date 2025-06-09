import Phaser from "phaser";
import { ATTACK_ASSET_KEYS } from "../../assets/asset-keys.js";
import { Attack } from "./attack.js";

export class Lafire extends Attack{
    /** @protected @type {Phaser.GameObjects.Sprite} */
    _attackGameObject
    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {import("../../types/typedef").Coordinate} position 
     */
    constructor(scene, position){
        super(scene, position);
        
        //create animations
        this._scene.anims.create({
            key: "FIRE",
            frames: this._scene.anims.generateFrameNumbers(ATTACK_ASSET_KEYS.FIRE),
            frameRate: 8,
            repeat: 0,
            delay: 0,
        });
        this._scene.anims.create({
            key: "FIRE_START",
            frames: this._scene.anims.generateFrameNumbers(ATTACK_ASSET_KEYS.FIRE_START),
            frameRate: 8,
            repeat: 0,
            delay: 0,
        });

        // create game objects
        this._attackGameObject= this._scene.add
        .sprite(this._position.x, this._position.y, ATTACK_ASSET_KEYS.FIRE, 5)
        .setOrigin(0.3)
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
                this._attackGameObject.play(ATTACK_ASSET_KEYS.FIRE_START);
                this._attackGameObject.once(
                    Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + ATTACK_ASSET_KEYS.FIRE_START, ()=>{
                    this._attackGameObject.play(ATTACK_ASSET_KEYS.FIRE);
                });

                this._attackGameObject.once(
                    Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + ATTACK_ASSET_KEYS.FIRE, ()=>{
                        this._isAnimationPlaying = false;
                        this._attackGameObject.setAlpha(0).setFrame(0);
                        if (callback){
                            callback();
                        }
                    });
            }
    
}