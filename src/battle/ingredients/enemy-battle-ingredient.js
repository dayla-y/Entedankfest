import { BattleIngredients } from "./battle-ingredients.js";
/** @type {import("../../types/typedef").Coordinate} */
const ENEMY_POSITION = Object.freeze({
    x: 768,
    y: 144,
});


export class EnemyBattleIngredient extends BattleIngredients{
    /**
     * 
     * @param {import("../../types/typedef").BattleIngredientConfig} config 
     */
    constructor(config){
        super({...config, scaleHealthBarBackgroundImageByY: 0.8}, ENEMY_POSITION);
        this._phaserGameObject.setFlipX(true); //Protected allows to flip
    }

    /** @type {number} */
    get baseExpValue(){
      return this._ingredientDetails.baseExp;
    }
    /**
     * 
     * @param {() => void} callback 
     * @returns {void}
     */
    playIngredientAppearAnimation(callback){
      const startXPos = -30;
      const endXPos = ENEMY_POSITION.x;
      this._phaserGameObject.setPosition(startXPos, ENEMY_POSITION.y);
      this._phaserGameObject.setAlpha(1);
  
      if (this._skipBattleAnimations) {
        this._phaserGameObject.setX(endXPos);
        callback();
        return;
      }
  
      this._scene.tweens.add({
        delay: 0,
        duration: 1600,
        x: {
          from: startXPos,
          start: startXPos,
          to: endXPos,
        },
        targets: this._phaserGameObject,
        onComplete: () => {
          callback();
        },
      });
    }

    /**
     * 
     * @param {() => void} callback 
     * @returns {void}
     */
    playIngredientHealthAppearAnimation(callback){
      const startXPos = -600;
      const endXPos = 0;
      this._phaserHealthBarGameContainer.setPosition(startXPos, this._phaserHealthBarGameContainer.y);
      this._phaserHealthBarGameContainer.setAlpha(1);
  
      if (this._skipBattleAnimations) {
        this._phaserHealthBarGameContainer.setX(endXPos);
        callback();
        return;
      }
  
      this._scene.tweens.add({
        delay: 0,
        duration: 1500,
        x: {
          from: startXPos,
          start: startXPos,
          to: endXPos,
        },
        targets: this._phaserHealthBarGameContainer,
        onComplete: () => {
          callback();
        },
      });
    }

    /**
     * 
     * @param {() => void} callback 
     * @returns {void}
     */
    playDeathAnimation(callback){
      const startYPos = this._phaserGameObject.y;
      const endYPos = startYPos - 400;
  
      if (this._skipBattleAnimations) {
        this._phaserGameObject.setY(endYPos);
        callback();
        return;
      }
  
      this._scene.tweens.add({
        delay: 0,
        duration: 2000,
        y: {
          from: startYPos,
          start: startYPos,
          to: endYPos,
        },
        targets: this._phaserGameObject,
        onComplete: () => {
          callback();
        },
      });
    }

    /** @returns {number} */
    pickRandomMove(){
      return Phaser.Math.Between(0, this._ingredientsAttacks.length -1);
    }
  }
  