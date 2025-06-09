import { CARETODANCE, KENNEYS_FONT } from "../../assets/font-keys.js";
import { ExpBar } from "../../common/exp-bar.js";
import { calculateRateBarValue, handleIngredientGainingRate } from "../../utils/rate-utils.js";
import { BattleIngredients } from "./battle-ingredients.js";
/** @type {import("../../types/typedef").Coordinate} */
const PLAYER_POSITION = Object.freeze({
    x: 256,
    y: 316,
});


export class PlayerBattleIngredient extends BattleIngredients{
    /** @type {Phaser.GameObjects.Text} */
    #healthBarTextGameObject;
    /** @type {ExpBar} */
    #expBar;

    /**
     * 
     * @param {import("../../types/typedef").BattleIngredientConfig} config 
     */
    constructor(config){
        super(config, PLAYER_POSITION);
        this._phaserGameObject.setScale(2,2);
        this._phaserHealthBarGameContainer.setPosition(556,318);

        this.#addHealthBarComponents();
        this.#addExpBarComponents();
    }
    
    #setHealthBarText(){
        this.#healthBarTextGameObject.setText(`${this._currentHealth}/${this._maxHealth}`);
    }

    #addHealthBarComponents(){
        this.#healthBarTextGameObject = this._scene.add
        .text(443, 80, '',{
          fontFamily: KENNEYS_FONT,
          color: '#7E3D3F',
            fontSize: '16px',
          })
          .setOrigin(1, 0 );
          this.#setHealthBarText();

          this._phaserHealthBarGameContainer.add(this.#healthBarTextGameObject);
        }
    /**
     * @param {number} damage 
     * @param {() => void} [callback] 
     */
    takeDamage(damage, callback){
        super.takeDamage(damage, callback);
        this.#setHealthBarText();
    }

    /**
     * 
     * @param {() => void} callback 
     * @returns {void}
     */
    playIngredientAppearAnimation(callback){
      const startXPos = -30;
      const endXPos = PLAYER_POSITION.x;
      this._phaserGameObject.setPosition(startXPos, PLAYER_POSITION.y);
      this._phaserGameObject.setAlpha(1);
  
      if (this._skipBattleAnimations) {
        this._phaserGameObject.setX(endXPos);
        callback();
        return;
      }
  
      this._scene.tweens.add({
        delay: 0,
        duration: 800,
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
      const startXPos = 800;
      const endXPos = this._phaserHealthBarGameContainer.x;
      this._phaserHealthBarGameContainer.setPosition(startXPos, this._phaserHealthBarGameContainer.y);
      this._phaserHealthBarGameContainer.setAlpha(1);
  
      if (this._skipBattleAnimations) {
        this._phaserHealthBarGameContainer.setX(endXPos);
        callback();
        return;
      }
  
      this._scene.tweens.add({
        delay: 0,
        duration: 800,
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
      const endYPos = startYPos + 400;
      const healthBarStartXPos = this._phaserHealthBarGameContainer.x;
      const healthBarEndXPos = 1200;
  
      if (this._skipBattleAnimations) {
        this._phaserGameObject.setY(endYPos);
        this._phaserHealthBarGameContainer.setAlpha(0);
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

      this._scene.tweens.add({
        delay: 0,
        duration: 2000,
        y: {
          from: this._phaserHealthBarGameContainer.x,
          start: this._phaserHealthBarGameContainer.x,
          to: healthBarEndXPos,
        },
        targets: this._phaserHealthBarGameContainer,
        onComplete: () => {
          this._phaserHealthBarGameContainer.setAlpha(0);
          this._phaserHealthBarGameContainer.setX(healthBarStartXPos);
        },
      });
    }

    updateIngredientHealth(updatedHp){
      this._currentHealth = updatedHp;
      if(this._currentHealth < this._maxHealth){
        this._currentHealth = this._maxHealth;
      }
      this._healthBar.setMeterPercentageAnimated(this._currentHealth / this._maxHealth,{
        skipBattleAnimations: true,
      });
      this.#setHealthBarText();
    }
    #addExpBarComponents(){
      this.#expBar = new ExpBar(this._scene, 34, 53.5);
      this.#expBar.setMeterPercentageAnimated(calculateRateBarValue(this._ingredientDetails.currentLevel, this._ingredientDetails.currentExp), {skipBattleAnimations: true});

      const ingredientExpText = this._scene.add.text(12, 100, 'RATE', {
        fontFamily: CARETODANCE,
        color:' #6505FF',
        fontSize: '14px',
        fontStyle: 'italic',
      });
      this._phaserHealthBarGameContainer.add([ingredientExpText, this.#expBar.container]);
    }

    /**
     * 
     * @param {number} gainedExp 
     * @returns {import("../../utils/rate-utils.js").StatChanges}
     */
    updateingredientExp(gainedExp){
      return handleIngredientGainingRate(this._ingredientDetails, gainedExp);
    }


    /**
     * 
     * @param {boolean} levelUp
     * @param {boolean} skipBattleAnimations
     * @param {()=> void} [callback = (()=> {})] 
     * @returns {void}
     */
    updateIngredientExpBar(levelUp, skipBattleAnimations, callback = () => {}){
      const cb = () =>{
        this._setIngredientRateText();
        this._maxHealth = this._ingredientDetails.maxHp;
        this.updateIngredientHealth(this._currentHealth);
        callback();
      };
      
      if(levelUp){
        this.#expBar.setMeterPercentageAnimated(
          1, {
            callback: ()=>{
              this._scene.time.delayedCall(500, ()=>{
                this.#expBar.setMeterPercentageAnimated(0, {skipBattleAnimations: true});
                this.#expBar.setMeterPercentageAnimated(
                  calculateRateBarValue(this._ingredientDetails.currentLevel, this._ingredientDetails.currentExp)
                  , {
                  callback: cb,
                });
              });
            }
          }
        );
        this.#expBar.setMeterPercentageAnimated(
          calculateRateBarValue(this._ingredientDetails.currentLevel, this._ingredientDetails.currentExp)
          , {
          callback: cb,
        });
        return;
      }

      this.#expBar.setMeterPercentageAnimated(
        calculateRateBarValue(this._ingredientDetails.currentLevel, this._ingredientDetails.currentExp)
        , {
        callback: cb,
      });
    }

    /**
     * 
     * @param {import("../../types/typedef").Ingredient} ingredient 
     * @returns {void}
     */
    switchIngredient(ingredient){
      super.switchIngredient(ingredient);
      this.#setHealthBarText();
      this.updateIngredientExpBar(false, true, undefined);
    }

  }