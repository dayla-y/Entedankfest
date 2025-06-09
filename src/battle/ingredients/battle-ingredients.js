import { Data } from "phaser";
import Phaser from "../../lib/phaser";
import { BATTLE_ASSET_KEYS } from "../../assets/asset-keys";
import { HealthBar } from "../../common/health-bar";
import { DataUtils } from "../../utils/data-utils";
import { KENNEYS_FONT } from "../../assets/font-keys";


export class BattleIngredients{
    /** @protected @type {Phaser.Scene} */
    _scene;
    /**  @protected @type {import("../../types/typedef").Ingredient} */
    _ingredientDetails;
    /** @protected @type {HealthBar} */
    _healthBar;
    /** @protected @type {Phaser.GameObjects.Image} */
    _phaserGameObject; 
    /** @protected @type {number} */
    _currentHealth;
    /** @protected @type {number} */
    _maxHealth;
    /** @protected @type {import("../../types/typedef").Attack[]} */
    _ingredientsAttacks;
    /** @protected @type {Phaser.GameObjects.Container} */
    _phaserHealthBarGameContainer;
    /** @protected @type {boolean} */
    _skipBattleAnimations;
    /** @protected @type {Phaser.GameObjects.Text} */
    _ingredientHealthBarLevelText;
    /** @protected @type {Phaser.GameObjects.Text} */
    _ingredientNameText;

    
    /**
     * @param {import("../../types/typedef").BattleIngredientConfig} config 
     * @param {import("../../types/typedef").Coordinate} position 
     */
   

    constructor(config, position){
        this._scene = config.scene;
        this._ingredientDetails = config.ingredientDetails;
        this._currentHealth = this._ingredientDetails.currentHp;
        this._maxHealth = this._ingredientDetails.maxHp;
        this._ingredientsAttacks = [];
        this._skipBattleAnimations = config.skipBattleAnimations || false;

        this._phaserGameObject = this._scene.add.image(
            position.x,
            position.y,
            this._ingredientDetails.assetKey,
            this._ingredientDetails.assetFrame || 0
        ).setAlpha(0);
        this.#createHealthBarComponents(config.scaleHealthBarBackgroundImageByY);
        this._healthBar.setMeterPercentageAnimated(this._currentHealth/this._maxHealth,{
            skipBattleAnimations: true,
        });

        this._ingredientDetails.attackIds.forEach((attackId) =>{
            const ingredientAttack= DataUtils.getIngredientAttack(this._scene, attackId);
            if(ingredientAttack !== undefined){
                this._ingredientsAttacks.push(ingredientAttack);
            }
        });
    }

    /**  @type {number} */
    get currentHp(){
        return this._currentHealth;
    }

    /**  @type {boolean} */
    get isFainted(){
        return this._currentHealth <= 0;
    }
    
    /**  @type {string} */
    get name(){
        return this._ingredientDetails.name;
    }

    /**  @type {import("../../types/typedef").Attack[]} */
    get attacks(){
        return [...this._ingredientsAttacks];
    }

    /**  @type {number} */
    get baseAttack(){
        return this._ingredientDetails.baseAttack;
    }

    /**  @type {number} */
    get level(){
        return this._ingredientDetails.currentLevel;
    }

    /**
     * 
     * @param {import("../../types/typedef").Ingredient} ingredient 
     * @returns {void}
     */
    switchIngredient(ingredient) {
        this._ingredientDetails = ingredient;
        this._currentHealth = this._ingredientDetails.currentHp;
        this._maxHealth = this._ingredientDetails.maxHp;
        this._healthBar.setMeterPercentageAnimated(this._currentHealth / this._maxHealth, {
          skipBattleAnimations: true,
        });
        this._ingredientAttacks = [];
        this._ingredientDetails.attackIds.forEach((attackId) => {
          const ingredientAttack = DataUtils.getIngredientAttack(this._scene, attackId);
          if (ingredientAttack !== undefined) {
            this._ingredientAttacks.push(ingredientAttack);
          }
        });
        this._phaserGameObject.setTexture(this._ingredientDetails.assetKey, this._ingredientDetails.assetFrame || 0);
        this._ingredientNameText.setText(this._ingredientDetails.name);
        this._setIngredientRateText();
        this._ingredientHealthBarLevelText.setX(this._ingredientNameText.width + 35);
      }
    
    /**
     * @param {number} damage 
     * @param {() => void} [callback] 
     */
    takeDamage(damage, callback){
        //update current ingredient health, and animate health bar
        this._currentHealth -= damage;
        if(this._currentHealth < 0){
            this._currentHealth = 0;
        } this._healthBar.setMeterPercentageAnimated(this._currentHealth / this._maxHealth, {callback})
    }

    /**
     * 
     * @param {() => void} callback 
     * @returns {void}
     */
    playIngredientAppearAnimation(callback){
        throw new Error('playIngredientAppearAnimation is not implemented.')
    }

    /**
     * 
     * @param {() => void} callback 
     * @returns {void}
     */
    playIngredientHealthAppearAnimation(callback){
        throw new Error('playIngredientHealthAppearAnimation is not implemented.')
    }
    /**
     * 
     * @param {() => void} callback 
     * @returns {void}
     */
        /**
     * 
     * @param {() => void} callback 
     * @returns {void}
     */
        playTakeDamageAnimation(callback){
            if (this._skipBattleAnimations) {
                this._phaserGameObject.setAlpha(1);
                callback();
                return;
              }
          
              this._scene.tweens.add({
                delay: 0,
                duration: 150,
                targets: this._phaserGameObject,
                alpha: {
                  from: 1,
                  start: 1,
                  to: 0,
                },
                repeat: 10,
                onComplete: () => {
                  this._phaserGameObject.setAlpha(1);
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
        throw new Error('playDeathAnimation is not implemented.')
    }

    /**
     * @protected
     */
    _setIngredientRateText(){
        this._ingredientHealthBarLevelText.setText(`L${this.level}`);
    }

    /**
   * Creates the base health bar components for this ingredient.
   * @param {number} [scaleHealthBarBackgroundImageByY=1] the scaling factor applied to the phaser image game object Y value
   */

    #createHealthBarComponents(scaleHealthBarBackgroundImageByY = 1){
    this._healthBar = new HealthBar(this._scene, 34, 34);

    this._ingredientNameText = this._scene.add.text(
      30,
      20,
      this.name,{
        fontFamily: KENNEYS_FONT,
        color: '#E303F',
        fontSize: '32px',
      }
    );

    const healthBarBgImage = this._scene.add
    .image(0,0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
    .setOrigin(0)
    .setScale(1, scaleHealthBarBackgroundImageByY);

    this._ingredientHealthBarLevelText = this._scene.add.text(
        this._ingredientNameText.width + 35, 23, '',{
            fontFamily: KENNEYS_FONT,
            color: '#ED474B',
          fontSize: '28px',
        });
        this._setIngredientRateText();
    const ingredientHpText = this._scene.add.text(30, 55, 'HP',{
        color: '#FF6505',
        fontSize: '24px',
        fontStyle: 'italic',
      });

    this._phaserHealthBarGameContainer = this._scene.add.container(0, 0, [
        healthBarBgImage,
        this._ingredientNameText,
        this._healthBar.container,
        this._ingredientHealthBarLevelText,
        ingredientHpText,
        ])
        .setAlpha(0);
      }
}