import { INGREDIENT_DETAILS_ASSET_KEY, OPTIONS_ASSET_KEY } from "../assets/asset-keys.js";
import { CARETODANCE } from "../assets/font-keys.js";
import { ExpBar } from "../common/exp-bar.js";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "../utils/data-manager.js";
import { DataUtils } from "../utils/data-utils.js";
import { calculateRateBarValue, expNeededForNextLevel } from "../utils/rate-utils.js";
import { BaseScene } from "./base-scene.js";
import { SCENE_KEYS } from "./scene-keys.js";


/** @type {Phaser.Types.GameObjects.Text.TextStyle} */
const UI_TEXT_STYLE = Object.freeze({
    fontFamily: CARETODANCE,
    color: 'rgb(152, 116, 97)',
    fontSize: '15px',
});

/**
 * @typedef IngredientDetailsSceneData
 * @type {object}
 * @property {import("../types/typedef.js").Ingredient} ingredient
 */


export class IngredientDetailsScene extends BaseScene{
    /** @type {import("../types/typedef.js").Ingredient} */
    #ingredientDetails;
    /** @type {import("../types/typedef.js").Attack[]} */
    #ingredientAttack;
    constructor(){
        super({
            key: SCENE_KEYS.INGREDIENT_DETAILS_SCENE,
        });
    }

    /**
   * @param {IngredientDetailsSceneData} data
   * @returns {void}
   */
    init(data){
        super.init(data);

        this.#ingredientDetails = data.ingredient;
        if(this.#ingredientDetails === undefined){
            this.#ingredientDetails = dataManager.store.get(DATA_MANAGER_STORE_KEYS.INGREDIENTS_IN_BAG)[0];
        }
        this.#ingredientAttack = [];
        this.#ingredientDetails.attackIds.forEach((attackId)=>{
            const ingredientAttack = DataUtils.getIngredientAttack(this, attackId);
            if(ingredientAttack !== undefined){
                this.#ingredientAttack.push(ingredientAttack);
            }
        });
    }

    create(){
        super.create();

        // Create main backgroud and title
        this.add.image(0, 0, OPTIONS_ASSET_KEY.FIRST).setOrigin(0);
        this.add.image(0, 0, INGREDIENT_DETAILS_ASSET_KEY.DECORATIONS_FOR_BOOK).setOrigin(0);

        // Add ingredient details

        this.add.text(309, 125, `Lv. ${this.#ingredientDetails.currentLevel}`, {
            ... UI_TEXT_STYLE,
            fontSize: '14px',
        });
        this.add.text(570, 54, `${this.#ingredientDetails.name}`, {
            ... UI_TEXT_STYLE,
            fontSize: '16px',
        });

        this.add.image(170, 140, this.#ingredientDetails.assetKey).setOrigin(0, 1).setScale(.7);

        if(this.#ingredientAttack[0] !== undefined){
            this.add.text(195, 227, this.#ingredientAttack[0].name, {...UI_TEXT_STYLE});
        }
        if(this.#ingredientAttack[1] !== undefined){
            this.add.text(120, 275, this.#ingredientAttack[1].name, {...UI_TEXT_STYLE});
        }if(this.#ingredientAttack[2] !== undefined){
            this.add.text(270, 275, this.#ingredientAttack[2].name, {...UI_TEXT_STYLE});
        }if(this.#ingredientAttack[3] !== undefined){
            this.add.text(197, 327, this.#ingredientAttack[3].name, {...UI_TEXT_STYLE});
        }

        // add ingredient rate details
        // TODO: Update with real exp

        this.add.text(455, 130, 'Current rate:', UI_TEXT_STYLE).setOrigin(0, 0);
        this.add.text(730, 140, `${this.#ingredientDetails.currentExp}`, UI_TEXT_STYLE).setOrigin(0, 0);
        this.add.text(455, 170, 'Can make them more valuated after', UI_TEXT_STYLE).setOrigin(0,0);
        this.add.text(730, 200, `${expNeededForNextLevel(this.#ingredientDetails.currentLevel, this.#ingredientDetails.currentExp)}`, UI_TEXT_STYLE).setOrigin(0,0);
        this.add.text(453, 102, 'RATE', {
            fontFamily: CARETODANCE,
            color:'rgb(85, 129, 120)',
            fontSize: '10px',
            fontStyle: 'italic',
          });

          const expBar = new ExpBar (this, 245, 54);
          expBar.setMeterPercentageAnimated(calculateRateBarValue(this.#ingredientDetails.currentLevel, this.#ingredientDetails.currentExp), {skipBattleAnimations: true});
;
        this.scene.bringToTop(SCENE_KEYS.INGREDIENT_DETAILS_SCENE)
    }

    update(){
        super.update();

        if(this._controls.isInputLocked){
            return;
        }

        if(this._controls.wasBackKeyPressed()){
            this.#goBackToPreviousScene();
            return;
        }

        if(this._controls.wasSpaceKeyPressed()){
            this.#goBackToPreviousScene();
        }
    }

    #goBackToPreviousScene(){
        this._controls.lockInput = true;
        this.scene.stop(SCENE_KEYS.INGREDIENT_DETAILS_SCENE);
        this.scene.resume(SCENE_KEYS.RECIPE_BOOK_SCENE);
      }
}