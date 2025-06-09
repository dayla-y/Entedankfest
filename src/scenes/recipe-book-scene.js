import Phaser from "phaser";
import { SCENE_KEYS } from "./scene-keys";
import { BaseScene } from "./base-scene";
import { HealthBar } from "../common/health-bar";
import { BATTLE_ASSET_KEYS, HEALTH_BAR_ASSET_KEYS, OPTIONS_ASSET_KEY, RECIPE_BOOK_ASSET_KEY, UI_ASSET_KEYS } from "../assets/asset-keys";
import { CARETODANCE } from "../assets/font-keys";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "../utils/data-manager";
import { DIRECTION } from "../common/direction";
import { exhaustiveGuard } from "../utils/guard";
import { ITEM_EFFECT } from "../types/typedef";
import { RECIPE_BOOK_MENU_OPTIONS, RecipeBookMenu } from "../recipe-book/recipe-book";
import { CONFIRMATION_MENU_OPTIONS, ConfirmationMenu } from "../common/menu/confirmation-menu";
/** @type {Phaser.Types.GameObjects.Text.TextStyle} */
const UI_TEXT_STYLE = Object.freeze({
    fontFamily: CARETODANCE,
    color: 'rgb(152, 116, 97)',
    fontSize: '20px',
});

const INGREDIENT_RECIPE_BOOK = Object.freeze({
  EVEN: {
    x: 0,
    y: 0,
  },
  ODD: {
    x: 370,
    y: -30,
  },
  increment: 110.5,
});

/**
 * @typedef RecipeBookSceneData
 * @type {object}
 * @property {string} previousSceneName
 * @property {import("../types/typedef").Item} [itemSelected]
 * @property {number} [activePlayerIngredientInBagIndex]
 * @property {boolean} [activeIngredientKnockedOut]
 */

export class RecipeBookScene extends BaseScene{
    /** @type {Phaser.GameObjects.Image[]} */
    #ingredientInBagBackground;
    /** @type {Phaser.GameObjects.Image} */
    #cancelButton;
    /** @type {Phaser.GameObjects.Text} */
    #infoTextGameObject;
    /** @type {HealthBar[]} */
    #healthBars;
    /** @type {Phaser.GameObjects.Text[]} */
    #healthBarTextGameObject;
    /** @type {number} */
    #selectedRecipeIngredientIndex;
    /** @type {import("../types/typedef").Ingredient[]} */
    #ingredients;
    /** @type {RecipeBookSceneData} */
    #sceneData;
    /** @type {ConfirmationMenu} */
    #confirmationMenu
    /** @type {boolean} */
    #waitingForInput;
    /** @type {RecipeBookMenu} */
    #menu;
    /** @type {boolean} */
    #isMovingIngredient;
    /** @type {number} */
    #ingredientToBeMovedIndex;
    /** @type {Phaser.GameObjects.Container[]} */
    #ingredientContainers;

    constructor(){
        super({
            key: SCENE_KEYS.RECIPE_BOOK_SCENE,
        });
    }

    /**
     * 
     * @param {RecipeBookSceneData} data 
     * @returns {void}
     */
    init(data){
        super.init(data);
       
        if(!data || !data.previousSceneName){
          data.previousSceneName = SCENE_KEYS.WORLD_SCENE;
        }

        this.#sceneData = data;
        this.#ingredientInBagBackground = [];
        this.#healthBars = [];
        this.#healthBarTextGameObject = [];
        this.#selectedRecipeIngredientIndex = 0;
        this.#ingredients = dataManager.store.get(DATA_MANAGER_STORE_KEYS.INGREDIENTS_IN_BAG);
        this.#waitingForInput = false;
        this.#isMovingIngredient = false;
        this.#ingredientToBeMovedIndex = undefined;
        this.#ingredientContainers = [];
    }

    create(){
        super.create();

            // Create custom background
            this.add.image(0, 0, OPTIONS_ASSET_KEY.FIRST).setOrigin(0);            // Create button
            // Create button
            const buttonContainer = this.add.container(883, 519, []);
            this.#cancelButton = this.add.image(0, 26, UI_ASSET_KEYS.BUTTON_NORMAL, 0).setOrigin(0).setScale(2.4, 2).setAlpha(1).setAngle(180);
            buttonContainer.add([this.#cancelButton])
            // Create info container
            const infoContainer = this.add.container(4, this.scale.height -69, []);
            const infoDisplay = this.add.image(0, -518, RECIPE_BOOK_ASSET_KEY.PAPER).setOrigin(0);
            this.add.image(0, 0, RECIPE_BOOK_ASSET_KEY.LINES_PAPER).setOrigin(0);
            this.#infoTextGameObject = this.add.text(860, 96, '', {
                fontFamily: CARETODANCE,
                color: '#4D4A49',
                fontSize: '14px',
                      ...{
                        align: 'center',
                        wordWrap: {width: 150},
                        lineSpacing: 1.2
                      },

            });
            infoContainer.add([infoDisplay]);
            this.#updateInfoContainerText();
            // Create ingredients in bag
            this.add.image(10,0, RECIPE_BOOK_ASSET_KEY.BOOK).setOrigin(0);
            this.add.image(10,0, RECIPE_BOOK_ASSET_KEY.LINES1).setOrigin(0);
            this.add.image(170,0, RECIPE_BOOK_ASSET_KEY.LINES2).setOrigin(0).setFlipX(true);

            this.#ingredients.forEach((ingredient, index) =>{
              const isEven = index % 2 === 0;
              const x = isEven ? INGREDIENT_RECIPE_BOOK.EVEN.x : INGREDIENT_RECIPE_BOOK.ODD.x;
              const y = (isEven ? INGREDIENT_RECIPE_BOOK.EVEN.y : INGREDIENT_RECIPE_BOOK.ODD.y) +
              INGREDIENT_RECIPE_BOOK.increment *Math.floor(index/2);
              const ingredientContainer = this.#createIngredient(x, y, ingredient);
              this.#ingredientContainers.push(ingredientContainer);
            });
            this.#movePlayerInputCursor(DIRECTION.NONE);
            
            // Create menu
            this.#menu = new RecipeBookMenu(this, this.#sceneData.previousSceneName);
            this.#confirmationMenu = new ConfirmationMenu(this);


            this.add.text(143, 58, 'Shopping list...', UI_TEXT_STYLE).setOrigin(0);
    }

    /**
     * 
     * @returns void
     */
    update(){
      super.update();

    if (this._controls.isInputLocked) {
      return;
    }
    const selectedDirection = this._controls.getDirectionKeyJustPressed();
    const wasSpaceKeyPressed = this._controls.wasSpaceKeyPressed();
    const wasBackKeyPressed = this._controls.wasBackKeyPressed();

    if(this.#confirmationMenu.isVisible){
      this.#handleInputForConfirmationMenu(wasBackKeyPressed, wasSpaceKeyPressed, selectedDirection);
      return;
    }

    if(this.#menu.isVisible){
      this.#handleInputForMenu(wasBackKeyPressed, wasSpaceKeyPressed, selectedDirection);
      return;
    }

    if (wasBackKeyPressed) {
      if (this.#waitingForInput) {
        this.#updateInfoContainerText();
        this.#waitingForInput = false;
        return;
      }

      if (this.#isMovingIngredient) {
        this.#updateInfoContainerText();
        this.#waitingForInput = false;
        return;
      }

      this.#goBackToPreviousScene(false, false);
      return;
    }

    if (wasSpaceKeyPressed) {
      if (this.#waitingForInput) {
        this.#updateInfoContainerText();
        this.#waitingForInput = false;
        return;
      }
        if(this.#selectedRecipeIngredientIndex === -1){
          if (this.#isMovingIngredient) {
            this.#updateInfoContainerText();
            this.#waitingForInput = false;
            return;
          }
          this.#goBackToPreviousScene(false, false);
          return;
        }

        if(this.#isMovingIngredient){
          if(this.#selectedRecipeIngredientIndex === this.#ingredientToBeMovedIndex){
            return;
          }
          this.#moveIngredients();
          return;
        }

        this.#menu.show();
        return;
      }

      if(this.#waitingForInput){
        return;
      }

      if(selectedDirection !== DIRECTION.NONE){
        this.#movePlayerInputCursor(selectedDirection);
        if(this.#isMovingIngredient){
          return;
        }
        this.#updateInfoContainerText();
      }
    }

    #updateInfoContainerText(){
        if(this.#selectedRecipeIngredientIndex === -1){
            this.#infoTextGameObject.setText('Go back to previous menu');
            return;
        }

        this.#infoTextGameObject.setText('Choose an ingredient.');
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {import("../types/typedef").Ingredient} ingredientDetails 
     * @returns {Phaser.GameObjects.Container}
     */
    #createIngredient(x, y, ingredientDetails){
        const container = this.add.container(x, y, []);

        const background = this.add.image(195, 105, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND).setOrigin(0).setScale(.44, .84).setAlpha(0);
        this.#ingredientInBagBackground.push(background);

            const leftShadowCap = this.add
              .image(214, 160, HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW)
              .setOrigin(0, 0).setScale(1, 1.3);
        
            const middleShadow = this.add
              .image(leftShadowCap.x + leftShadowCap.width, 160, HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW)
              .setOrigin(0).setScale(1.3);
            middleShadow.displayWidth = 160;
        
            const rightShadowCap = this.add
              .image(middleShadow.x + middleShadow.displayWidth, 160, HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW)
              .setOrigin(0).setScale(2, 1.3);
        

        const healthBar = new HealthBar(this, 107,84, 160);
        healthBar.setMeterPercentageAnimated(ingredientDetails.currentHp / ingredientDetails.maxHp,{
            duration: 0,
            skipBattleAnimations: true
        });
        this.#healthBars.push(healthBar);
        
    
        const ingredientNameGameText = this.add.text(
          260,
          120,
          ingredientDetails.name,{
            fontFamily: CARETODANCE,
            color: 'rgb(100, 87, 66)',
            fontSize: '16px',
          }
        );
    
        const ingredientHealthBarLevelText = this.add.text(
            210, 180, `Lv. ${ingredientDetails.currentLevel}`,{
                fontFamily: CARETODANCE,
                color: 'rgb(92, 86, 84)',
              fontSize: '13px',
            });
        const ingredientHpText = this.add.text(327, 185, 'HP',{
            color: '#50483f  ',
            fontSize: '15px',
            fontStyle: 'italic',
          });
        const healthBarTextGameObject = this.add
        .text(390, 180, `${ingredientDetails.currentHp}/${ingredientDetails.maxHp}`,{
          fontFamily: CARETODANCE,
          color: '#50483f',
            fontSize: '13px',
          })
          .setOrigin(1, 0 );
          this.#healthBarTextGameObject.push(healthBarTextGameObject);

        
        const ingredientImage = this.add.image(88, 120, ingredientDetails.assetKey).setOrigin(0).setScale(.5);
        container.add([
          background,
          ingredientHpText,
          leftShadowCap,
          middleShadow,
          rightShadowCap,
          ingredientImage,
          healthBarTextGameObject,
          ingredientNameGameText,
          ingredientHealthBarLevelText,
          healthBar.container,
          ]);
        return container;
    }

    /**
     * @param {boolean} itemUsed
     * @param {boolean} wasIngredientSelected
     * @returns {void}
     */
    #goBackToPreviousScene(itemUsed, wasIngredientSelected){

      if(this.#sceneData.activeIngredientKnockedOut
        && this.#sceneData.previousSceneName === SCENE_KEYS.BATTLE_SCENE
        && !wasIngredientSelected){
        this.#infoTextGameObject.setText('You must select another ingredient for now...');
        this.#waitingForInput = true;
        this.#menu.hide();
        return;
      }

      this._controls.lockInput = true;
      this.scene.stop(SCENE_KEYS.RECIPE_BOOK_SCENE);
      this.scene.resume(this.#sceneData.previousSceneName, {
        itemUsed,
        selectedIngredientIndex: wasIngredientSelected ? this.#selectedRecipeIngredientIndex : undefined,
        wasIngredientSelected,
      });
    }

    /**
     * 
     * @param {import("../common/direction").Direction} direction 
     * @returns {void}
     */
    #movePlayerInputCursor(direction){
      switch(direction){
        case DIRECTION.UP:
          if(this.#selectedRecipeIngredientIndex === -1){
            this.#selectedRecipeIngredientIndex = this.#ingredients.length;
          }
          this.#selectedRecipeIngredientIndex -= 1;
          if(this.#selectedRecipeIngredientIndex < 0){
            this.#selectedRecipeIngredientIndex = 0;
          }
          this.#ingredientInBagBackground[this.#selectedRecipeIngredientIndex].setAlpha(1);
          this.#cancelButton.setTexture(UI_ASSET_KEYS.BUTTON_NORMAL, 0).setAlpha(1);
          break;
        case DIRECTION.DOWN:
          if(this.#selectedRecipeIngredientIndex === -1){
            break;
          }
          this.#selectedRecipeIngredientIndex += 1;
          if(this.#selectedRecipeIngredientIndex > this.#ingredients.length -1){
            this.#selectedRecipeIngredientIndex = -1;
          }

          if(this.#selectedRecipeIngredientIndex === -1){
            this.#cancelButton.setTexture(UI_ASSET_KEYS.BUTTON_SELECTED, 0).setAlpha(1);
            break;
          }
          this.#ingredientInBagBackground[this.#selectedRecipeIngredientIndex].setAlpha(1);
        case DIRECTION.LEFT:
          break;
        case DIRECTION.RIGHT:
          break;
        case DIRECTION.NONE:
          break;
        default:
          exhaustiveGuard(direction);
      }
      this.#ingredientInBagBackground.forEach((obj, index) =>{
        if (index === this.#selectedRecipeIngredientIndex){
          return;
        }
        obj.setAlpha(0);
      });
    }

    /**
     * 
     * @returns {void}
     */
    #handleItemUsed() {
      switch (this.#sceneData.itemSelected.effect) {
        case ITEM_EFFECT.HEAL_30:
          this.#handleHealItemUsed(30);
          break;
        default:
          exhaustiveGuard(this.#sceneData.itemSelected.effect);
      }
    }
    
    /**
     * 
     * @param {number} amount 
     * @returns {void}
     */
    #handleHealItemUsed(amount){
      // Validate that the ingredient is not fainted
      if(this.#ingredients[this.#selectedRecipeIngredientIndex].currentHp ===
        0 ){
        this.#infoTextGameObject.setText(`Come on! It is rotten! I won't health it.`);
        this.#waitingForInput = true;
        this.#menu.hide();
        return;
      }
      // Validate that the ingredient is not already fully healed
      if(this.#ingredients[this.#selectedRecipeIngredientIndex].currentHp === this.#ingredients[this.#selectedRecipeIngredientIndex].maxHp){
        this.#infoTextGameObject.setText(`What are you thinking, It is fresh!`);
        this.#waitingForInput = true;
        this.#menu.hide();
        return;
      }
      // Otherwise, heal ingredient by the amount
      this._controls.lockInput = true;
      this.#ingredients[this.#selectedRecipeIngredientIndex].currentHp += amount;
      if(this.#ingredients[this.#selectedRecipeIngredientIndex].currentHp > this.#ingredients[this.#selectedRecipeIngredientIndex].maxHp){
        this.#ingredients[this.#selectedRecipeIngredientIndex].currentHp = this.#ingredients[this.#selectedRecipeIngredientIndex].maxHp;
      }
      this.#infoTextGameObject.setText(`Your ingredient freshed ${amount} HP`);
      this.#healthBars[this.#selectedRecipeIngredientIndex].setMeterPercentageAnimated(
        this.#ingredients[this.#selectedRecipeIngredientIndex].currentHp / this.#ingredients[this.#selectedRecipeIngredientIndex].maxHp,
        {
          callback: ()=>{
            this.#healthBarTextGameObject[this.#selectedRecipeIngredientIndex].setText
            (`${this.#ingredients[this.#selectedRecipeIngredientIndex].currentHp} /
              ${this.#ingredients[this.#selectedRecipeIngredientIndex].maxHp
              }`);
              dataManager.store.set(DATA_MANAGER_STORE_KEYS.INGREDIENTS_IN_BAG, this.#ingredients);
              this.time.delayedCall(300, ()=>{
                this.#goBackToPreviousScene(true, false);
              });

          }
        }
        
      );
    }

    #handleIngredientSelectedForSwitch(){
      if(this.#ingredients[this.#selectedRecipeIngredientIndex].currentHp === 0){
        this.#infoTextGameObject.setText('Selected ingredient is not fresh.');
        this.#waitingForInput = true;
        return;
      }

      if(this.#sceneData.activePlayerIngredientInBagIndex === this.#selectedRecipeIngredientIndex){
        this.#infoTextGameObject.setText(`I'm using that, wtf.`);
        this.#waitingForInput = true;
        return;
      }

      this.#goBackToPreviousScene(false, true);
    }

    /**
     * 
     * @param {boolean} wasBackKeyPressed 
     * @param {boolean} wasSpaceKeyPressed 
     * @param {import("../common/direction").Direction} selectedDirection 
     * @returns 
     */
    #handleInputForMenu(wasBackKeyPressed, wasSpaceKeyPressed, selectedDirection){
      if(wasBackKeyPressed){
       this.#menu.hide();
       return; 
      }

      if(wasSpaceKeyPressed){
        this.#menu.handlePlayerInput('OK');
        if(this.#menu.selectedMenuOption === RECIPE_BOOK_MENU_OPTIONS.CANCEL){
          this.#menu.hide();
        return;
        }
        if(this.#menu.selectedMenuOption === RECIPE_BOOK_MENU_OPTIONS.SUMMARY){
          this._controls.lockInput = true;

          const sceneDataToPass = {
            ingredient: this.#ingredients[this.#selectedRecipeIngredientIndex]
          };
    
          this.scene.launch(SCENE_KEYS.INGREDIENT_DETAILS_SCENE, sceneDataToPass);
          this.scene.pause(SCENE_KEYS.RECIPE_BOOK_SCENE);
    
        return;
        }
        if(this.#menu.selectedMenuOption === RECIPE_BOOK_MENU_OPTIONS.SELECT){
          // Handle input based on what player intention was (use item, view ingredient details, select ingredient switch to)
          if(this.#sceneData.previousSceneName === SCENE_KEYS.INVENTORY_SCENE && this.#sceneData.itemSelected){
            this.#handleItemUsed();
            return;
          }

          if(this.#sceneData.previousSceneName === SCENE_KEYS.BATTLE_SCENE){
            this.#handleIngredientSelectedForSwitch();
            return;
          }
          return;
          }

        if(this.#menu.selectedMenuOption === RECIPE_BOOK_MENU_OPTIONS.DESTROY){
          if(this.#ingredients.length <= 1){
            this.#infoTextGameObject.setText('Meinen Sie? Das kann ich nicht machen.');
            this.#waitingForInput = true;
            this.#menu.hide();
            return;
          }
          this.#menu.hide();
          this.#confirmationMenu.show();
          this.#infoTextGameObject.setText('Es war verdorben, niemand brauchte es.')

        return;
        }

        if(this.#menu.selectedMenuOption === RECIPE_BOOK_MENU_OPTIONS.MOVE){
          if(this.#ingredients.length <= 1){
            this.#infoTextGameObject.setText('Zutat kann nicht verschoben werden');
            this.#waitingForInput = true;
            this.#menu.hide();
            return;
          }
          this.#isMovingIngredient = true;
          this.#ingredientToBeMovedIndex = this.#selectedRecipeIngredientIndex;
          this.#infoTextGameObject.setText('Wählen Sie eine Zutat aus, mit der Sie die Positionen tauschen möchten');
          this.#menu.hide();
          return;
          }
        
        return;
      }

      if(selectedDirection !== DIRECTION.NONE){
        this.#menu.handlePlayerInput(selectedDirection);
        return;
      }

      
    }

    /**
     * 
     * @param {boolean} wasBackKeyPressed 
     * @param {boolean} wasSpaceKeyPressed 
     * @param {import("../common/direction").Direction} selectedDirection 
     * @returns 
     */
    #handleInputForConfirmationMenu(wasBackKeyPressed, wasSpaceKeyPressed, selectedDirection){
      if(wasBackKeyPressed){
        this.#confirmationMenu.hide();
        this.#menu.show();
        this.#updateInfoContainerText();
        return; 
       }
 
       //TO DO: Change the logic for eat in place that just "release"
       if(wasSpaceKeyPressed){
         this.#confirmationMenu.handlePlayerInput('OK');
         if(this.#confirmationMenu.selectedMenuOption === CONFIRMATION_MENU_OPTIONS.YES){
           this.#confirmationMenu.hide();
           
           if(this.#menu.selectedMenuOption === RECIPE_BOOK_MENU_OPTIONS.DESTROY){
            this._controls.lockInput = true;
            this.#infoTextGameObject.setText('Ok, ich musste nicht essen, aber es war wirklich lecker')
            this.time.delayedCall(1000, ()=>{
              this.#removeIngredient();
              this._controls.lockInput = false;
            })
            return;
           }
         return;
         }
         
         this.#confirmationMenu.hide();
         this.#menu.show();
         return;
       }
 
       if(selectedDirection !== DIRECTION.NONE){
         this.#confirmationMenu.handlePlayerInput(selectedDirection);
         return;
       }
 
    }

    #moveIngredients(){
      const ingredientRef = this.#ingredients[this.#ingredientToBeMovedIndex];
      this.#ingredients[this.#ingredientToBeMovedIndex]= this.#ingredients[this.#selectedRecipeIngredientIndex];
      this.#ingredients[this.#selectedRecipeIngredientIndex] = ingredientRef;
      dataManager.store.set(DATA_MANAGER_STORE_KEYS.INGREDIENTS_IN_BAG, this.#ingredients);

      const ingredientContainerRefPosition1 ={
        x: this.#ingredientContainers[this.#ingredientToBeMovedIndex].x,
        y: this.#ingredientContainers[this.#ingredientToBeMovedIndex].y,
      };
      const ingredientContainerRefPosition2 ={
        x: this.#ingredientContainers[this.#ingredientToBeMovedIndex].x,
        y: this.#ingredientContainers[this.#ingredientToBeMovedIndex].y,
      };

      this.#ingredientContainers[this.#ingredientToBeMovedIndex].setPosition(
        ingredientContainerRefPosition2.x,
        ingredientContainerRefPosition2.y
      );
      
      this.#ingredientContainers[this.#ingredientToBeMovedIndex].setPosition(
        ingredientContainerRefPosition1.x,
        ingredientContainerRefPosition1.y
      );

      const containerRef = this.#ingredientContainers[this.#ingredientToBeMovedIndex];
      this.#ingredientContainers[this.#ingredientToBeMovedIndex]= this.#ingredientContainers[this.#selectedRecipeIngredientIndex];
      this.#ingredientContainers[this.#selectedRecipeIngredientIndex] = containerRef;

      const backgroundRef = this.#ingredientInBagBackground[this.#ingredientToBeMovedIndex];
      this.#ingredientInBagBackground[this.#ingredientToBeMovedIndex]= this.#ingredientInBagBackground[this.#selectedRecipeIngredientIndex];
      this.#ingredientInBagBackground[this.#selectedRecipeIngredientIndex] = backgroundRef;

      this.#isMovingIngredient = false;
      this.#selectedRecipeIngredientIndex = this.#ingredientToBeMovedIndex;
      this.#ingredientToBeMovedIndex = undefined;

    
    }

    //Change logic for heal Lyan
    #removeIngredient(){

    }
}