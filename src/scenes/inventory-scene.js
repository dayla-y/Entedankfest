import Phaser from "phaser";
import { BaseScene } from "./base-scene.js";
import { SCENE_KEYS } from "./scene-keys.js";
import { INVENTORY_ASSET_KEY, OPTIONS_ASSET_KEY, UI_ASSET_KEYS } from "../assets/asset-keys.js";
import { CARETODANCE } from "../assets/font-keys.js";
import { DIRECTION } from "../common/direction.js";
import { exhaustiveGuard } from "../utils/guard.js";
import { dataManager } from "../utils/data-manager.js";

const CANCEL_TEXT_DESCRIPTION = 'Close the notebook.'

const INVENTORY_ITEM_POSITION = Object.freeze({
    x: 260,
    y: 250,
    space: 50,

    EVEN: {
        x: 0,
        y: 0,
      },
      ODD: {
        x: 195,
        y: 0,
      },
      increment: 50.5,
});


/** @type {Phaser.Types.GameObjects.Text.TextStyle} */
const UI_TEXT_STYLE = Object.freeze({
    fontFamily: CARETODANCE,
    color: 'rgb(152, 116, 97)',
    fontSize: '20px',
});

/** @type {Phaser.Types.GameObjects.Text.TextStyle} */
const SMALL_UI_TEXT_STYLE = Object.freeze({
    fontFamily: CARETODANCE,
    color: 'rgb(152, 116, 97)',
    fontSize: '14px',
});

/** @type {Phaser.Types.GameObjects.Text.TextStyle} */
const UI_TEXT_STYLE_GREEN = Object.freeze({
    fontFamily: CARETODANCE,
    color: 'rgb(74, 146, 98)',
    fontSize: '15px',
});

/**
 * @typedef InventoryItemGameObjects
 * @type {object}
 * @property {Phaser.GameObjects.Text} [itemName]
 * @property {Phaser.GameObjects.Text} [quantitySign]
 * @property {Phaser.GameObjects.Text} [quantity]
 */

/**
 * @typedef {import('../types/typedef.js').InventoryItem & { gameObjects: InventoryItemGameObjects }} InventoryItemWithGameObjects
 */

/**
 * @typedef CustomInventory
 * @type {InventoryItemWithGameObjects[]}
 */

/**
 * @typedef InventorySceneData
 * @type {object}
 * @property {string} previousSceneName
 */

/**
 * @typedef InventorySceneWasResumeData
 * @type {object}
 * @property {boolean} itemUsed
 */

/**
 * @typedef InventorySceneItemUsedData
 * @type {object}
 * @property {boolean} itemUsed
 * @property {import("../types/typedef.js").Item} [item]
 */


export class InventoryScene extends BaseScene{
    /** @type {InventorySceneData} */
    #sceneData;
    /** @type {Phaser.GameObjects.Text} */
    #selectedInventoryDescriptionText;
    /** @type {Phaser.GameObjects.Image} */
    #userInputCursor;
    /** @type {CustomInventory} */
    #inventory
    /** @type {number} */
    #selectedInventoryOptionIndex;

    constructor(){
        super({
            key: SCENE_KEYS.INVENTORY_SCENE,
        });
        
    }
        /**
         * @param {InventorySceneData} data
         * @return {void}
         */
        init(data) {
            super.init(data);
            
            this.#sceneData = data;
            const inventory = dataManager.getInventory(this);
        
            this.#inventory = inventory.map((inventoryItem)=>{
                return{
                    item: inventoryItem.item,
                    quantity: inventoryItem.quantity,
                    gameObjects: {},
                };
            })
            this.#selectedInventoryOptionIndex = 0;
        }
        

        /** 
         * @returns {void}
         */
        create(){
            super.create();
            
            //Create custom background
            this.add.image(0, 0, OPTIONS_ASSET_KEY.FIRST).setOrigin(0);
            this.add.image(0,-10, INVENTORY_ASSET_KEY.BOOK2).setOrigin(0);

            this.add.text(350, 15, 'Inventory', UI_TEXT_STYLE);
            this.add.text(700, 35, 'Tasks', UI_TEXT_STYLE);
            this.add.text(25, 35, 'How I feel?', UI_TEXT_STYLE);
            this.add.text(785, 513, 'Days', UI_TEXT_STYLE_GREEN);


            // Create inventory text from available items
            this.#inventory.forEach((inventoryItem, index) => {
                const isEven = index % 2 === 0;
                const x = isEven ? INVENTORY_ITEM_POSITION.EVEN.x : INVENTORY_ITEM_POSITION.ODD.x;
                const y = (isEven ? INVENTORY_ITEM_POSITION.EVEN.y : INVENTORY_ITEM_POSITION.ODD.y) +
                          INVENTORY_ITEM_POSITION.increment * Math.floor(index / 2);
            
                // Crear nombre del item
                const itemText = this.add.text(
                    x + 260,
                    y + 250,
                    inventoryItem.item.name,
                    UI_TEXT_STYLE_GREEN
                );
            
                // Crear cantidad (símbolo 'x')
                const qty1Text = this.add.text(
                    x + 213,
                    y + 265,
                    'x',
                    { ...UI_TEXT_STYLE_GREEN, fontSize: 10 }
                );
            
                // Crear cantidad del item
                const qty2Text = this.add.text(
                    x + 220,
                    y + 258,
                    `${inventoryItem.quantity}`,
                    UI_TEXT_STYLE_GREEN
                );
            
                inventoryItem.gameObjects = {
                    itemName: itemText,
                    quantity: qty2Text,
                    quantitySign: qty1Text,
                };
            });

            
            // Create cancel text
            // Calcular posición de "Cancel"
            const totalItems = this.#inventory.length;
            const isLastRowOdd = totalItems % 2 === 1; // Última fila tiene un solo elemento

            // Si la última fila es impar, usa la posición de la columna impar
            const cancelX = isLastRowOdd
                ? INVENTORY_ITEM_POSITION.ODD.x
                : INVENTORY_ITEM_POSITION.EVEN.x;

            // Y permanece debajo de la última fila calculada
            const rows = Math.ceil(totalItems/ 2); // Total de filas ocupadas
            const cancelY =
                INVENTORY_ITEM_POSITION.EVEN.y +
                INVENTORY_ITEM_POSITION.increment * (rows - 1); // Basado en la última fila completa              
              
            this.add.text(
                cancelX + 260, // Ajuste según la columna calculada
                cancelY + 250, // Ajuste visual para separar de los elementos del inventario
                'Cancel',
                UI_TEXT_STYLE_GREEN
            );

            // Create player input cursor
            this.#userInputCursor = this.add.image(385, 260, UI_ASSET_KEYS.CURSOR_LEFT).setScale(2);
            // Create invetory description text
            this.#selectedInventoryDescriptionText = this.add.text(316, 55, '', {
                ...SMALL_UI_TEXT_STYLE,
            wordWrap:{
                width: 270,
            },
            color: 'rgb(108, 92, 84)', 
            fontSize: '12px',
                },
            );

            this.#updateItemDescriptionText();
        }

         /**
   * @returns {void}
   */
  update() {
    super.update();

    if (this._controls.isInputLocked) {
      return;
    }

    if (this._controls.wasBackKeyPressed()) {
      this.#goBackToPreviousScene(false);
      return;
    }

    const wasSpaceKeyPressed = this._controls.wasSpaceKeyPressed();
    if (wasSpaceKeyPressed) {
      if (this.#isCancelButtonSelected()) {
        this.#goBackToPreviousScene();
        return;
      }

      if(this.#inventory[this.#selectedInventoryOptionIndex].quantity < 1){
        return;
      }

      this._controls.lockInput = true;
      // pause this scene and launch the monster details scene
        /** @type {import("./recipe-book-scene.js").RecipeBookSceneData} */
      const sceneDataToPass = {
        previousSceneName: SCENE_KEYS.INVENTORY_SCENE,
        itemSelected: this.#inventory[this.#selectedInventoryOptionIndex].item
      };
      this.scene.launch(SCENE_KEYS.RECIPE_BOOK_SCENE, sceneDataToPass);
      this.scene.pause(SCENE_KEYS.INVENTORY_SCENE);
      return;
    }

    const selectedDirection = this._controls.getDirectionKeyJustPressed();
    if (selectedDirection !== DIRECTION.NONE) {
      this.#movePlayerInputCursor(selectedDirection);
      this.#updateItemDescriptionText();
    }
  }      
  
  /**
     * @param {Phaser.Scenes.Systems} sys
     * @param {InventorySceneWasResumeData | undefined} [data]
     * @returns {void}
     */
  handleSceneResume(sys, data) {
    super.handleSceneResume(sys, data);

    if(!data || !data.itemUsed){
      return;
    }

    const selectedItem = this.#inventory[this.#selectedInventoryOptionIndex];
    selectedItem.quantity -= 1;
    selectedItem.gameObjects.quantity.setText(`${selectedItem.quantity}`);
    // To do: Add logic to handle when last of an item was just used
    dataManager.updateInventory(this.#inventory);

    if(this.#sceneData.previousSceneName === SCENE_KEYS.BATTLE_SCENE){
      this.#goBackToPreviousScene(true, selectedItem.item)
    }
  }


        /**
   * @returns {void}
   */
  #updateItemDescriptionText() {
    if (this.#isCancelButtonSelected()) {
      this.#selectedInventoryDescriptionText.setText(CANCEL_TEXT_DESCRIPTION);
      return;
    }

    this.#selectedInventoryDescriptionText.setText(this.#inventory[this.#selectedInventoryOptionIndex].item.description);
  }

  /**
   * @returns {boolean}
   */
  #isCancelButtonSelected() {
    return this.#selectedInventoryOptionIndex === this.#inventory.length;
  }

  /**
   * @returns {void}
   */
  #goBackToPreviousScene(wasItemUsed, item) {
    this._controls.lockInput = true;
    this.scene.stop(SCENE_KEYS.INVENTORY_SCENE);
    /** @type {InventorySceneItemUsedData} */
    const sceneDataToPass={
      itemUsed: wasItemUsed,
      item,
    };
    this.scene.resume(this.#sceneData.previousSceneName, sceneDataToPass);
  }
  /**
   * @param {import('../common/direction.js').Direction} direction
   * @returns {void}
   */
  #movePlayerInputCursor(direction) {
    switch (direction) {
      case DIRECTION.UP:
        this.#selectedInventoryOptionIndex -= 1;
        if (this.#selectedInventoryOptionIndex < 0) {
          this.#selectedInventoryOptionIndex = this.#inventory.length;
        }
        break;
      case DIRECTION.DOWN:
        this.#selectedInventoryOptionIndex += 1;
        if (this.#selectedInventoryOptionIndex > this.#inventory.length) {
          this.#selectedInventoryOptionIndex = 0;
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

    // Calculamos la columna y la fila para el índice seleccionado
    const index = this.#selectedInventoryOptionIndex;
    const isEven = index % 2 === 0; // Determina si el índice está en la columna par o impar

    // La columna determina el valor de 'x'
    const x = isEven ? INVENTORY_ITEM_POSITION.EVEN.x : INVENTORY_ITEM_POSITION.ODD.x;

    // La fila se calcula dividiendo el índice por 2, ya que hay dos columnas
    const y = (isEven ? INVENTORY_ITEM_POSITION.EVEN.y : INVENTORY_ITEM_POSITION.ODD.y) +
            INVENTORY_ITEM_POSITION.increment * Math.floor(index / 2);

    // Establece la posición del cursor
    this.#userInputCursor.setX(x + 390);  // Ajusta el valor de 'x' según lo que necesites
    this.#userInputCursor.setY(y + 260);  // Ajusta el valor de 'y' según lo que necesites

  }
        
}