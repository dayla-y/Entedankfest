import Phaser from "phaser";
import { TEXT_SPEED, TILE_SIZE } from "../config.js";
import { DIRECTION } from "../common/direction.js";
import { BATTLE_SCENE_OPTIONS, BATTLE_STYLE_OPTIONS, SOUND_OPTIONS, TEXT_SPEED_OPTIONS } from "../common/options.js";
import { exhaustiveGuard } from "./guard.js";
import { BATTLE_CHARACTHER_ASSET_KEYS, INVENTORY_ASSET_KEY } from "../assets/asset-keys.js";
import { DataUtils } from "./data-utils.js";

const LOCAL_STORAGE_KEY = 'ENTEDANKFEST';


/**
 * @typedef IngredientData
 * @type {object}
 * @property {import("../types/typedef.js").Ingredient[]} RecipeBook
 */

/**
 * @typedef PlayerLocation
 * @type {object}
 * @property {string} area
 * @property {boolean} isInterior
 */

/**
 * @typedef GlobalSate
 * @type {object}
 * @property {object} player
 * @property {object} player.position
 * @property {number} player.position.x
 * @property {number} player.position.y
 * @property {PlayerLocation} player.location
 * @property {import("../common/direction").Direction} player.direction
 * @property {object} options
 * @property {import("../common/options.js").TextSpeedMenuOptions} options.textSpeed
 * @property {import("../common/options.js").BattleSceneMenuOptions} options.battleSceneAnimations
 * @property {import("../common/options.js").BattleStyleMenuOptions} options.battleStyle
 * @property {import("../common/options.js").SoundMenuOptions} options.sound
 * @property {import("../common/options.js").VolumeMenuOptions} options.volume
 * @property {import("../common/options.js").MenuColorOptions} options.menuColor
 * @property {boolean} gameStarted
 * @property {IngredientData} ingredients
 * @property {import("../types/typedef.js").Inventory} inventory
 * @property {number []} itemPickedUp
*/

/** @type {GlobalSate} */
const initialState = {
    player: {
        position: {
            x: 4 * TILE_SIZE,
            y: 4  * TILE_SIZE,
        },
        direction: DIRECTION.DOWN,
        location: {
            area: 'pink_1',
            isInterior: false,
        },
    },
    options: {
        textSpeed:TEXT_SPEED_OPTIONS.MID,
        battleSceneAnimations: BATTLE_SCENE_OPTIONS.ON,
        battleStyle: BATTLE_STYLE_OPTIONS.SHIFT,
        sound: SOUND_OPTIONS.ON,
        volume: 4,
        menuColor: 0,
    },
    gameStarted: false,
    ingredients: {
        RecipeBook: [],
    },
    inventory: [
        {
          item: {
            id: 1,
          },
          quantity: 1,
        },
      ],
      itemPickedUp: []
    
}

export const DATA_MANAGER_STORE_KEYS = Object.freeze({
    PLAYER_POSITION: 'PLAYER_POSITION',
    PLAYER_DIRECTION: 'PLAYER_DIRECTION',
    PLAYER_LOCATION: 'PLAYER_LOCATION',
    OPTIONS_TEXT_SPEED: 'OPTIONS_TEXT_SPEED',
    OPTIONS_BATTLE_SCENE_ANIMATIONS: 'OPTIONS_BATTLE_SCENE_ANIMATIONS',
    OPTIONS_BATTLE_STYLE: 'OPTIONS_BATTLE_STYLE',
    OPTIONS_SOUND: 'OPTIONS_SOUND',
    OPTIONS_VOLUME: 'OPTIONS_VOLUME',
    OPTIONS_MENU_COLOR: 'OPTIONS_MENU_COLOR',
    GAME_STARTED: 'GAME_STARTED',
    INGREDIENTS_IN_BAG: 'INGREDIENTS_IN_BAG',
    INVENTORY: 'INVENTORY',
    ITEMS_PICKED_UP: 'ITEMS_PICKED_UP',
})

class DataManager extends Phaser.Events.EventEmitter{
    /** @type {Phaser.Data.DataManager} */
    #store;

    constructor(){
        super();
        this.#store = new Phaser.Data.DataManager(this);
        this.#updateDataManager(initialState);
    }

    /** @type {Phaser.Data.DataManager} */
    get store(){
        return this.#store;
    }

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @returns {void}
     */
    init(scene){
        const startingIngredient1 = DataUtils.getIngredientById(scene, 1);
        const startingIngredient2 = DataUtils.getIngredientById(scene, 3);
        const startingIngredient3 = DataUtils.getIngredientById(scene, 4);
        // this.#store.set(DATA_MANAGER_STORE_KEYS.INGREDIENTS_IN_BAG, [startingIngredient2]);

        this.#store.set(DATA_MANAGER_STORE_KEYS.INGREDIENTS_IN_BAG, [startingIngredient1, startingIngredient2, startingIngredient3]);
    }

    loadData(){
        if(typeof Storage === 'undefined'){
            console.warn(`[${DataManager.name}:loadData] local Storage is not suported, will not be able to save and load data.`);
            return;
        }

        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if(savedData === null){
            return;
        } 

        try{
            const parsedData = JSON.parse(savedData);
            this.#updateDataManager(parsedData);
        }catch(error){
            console.warn(`[${DataManager.name}:loadData] ecountered an error while attempting to load and parse saved data.`);
            return;
        }
    }

    saveData(){
        if(typeof Storage === 'undefined'){
            console.warn(`[${DataManager.name}:saveData] local Storage is not suported, will not be able to save and load data.`);
            return;
        }
        const dataToSave = this.#dataManagerDataToGlobalStateObject();
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
        }

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @returns {void}
     */
    startNewGame(scene){
        //Get existing data before resetting all of the data, so can persist options data
        const existingData = {...this.#dataManagerDataToGlobalStateObject()};
        existingData.player.position = {...initialState.player.position};
        existingData.player.location = { ...initialState.player.location };
        existingData.player.direction = initialState.player.direction;
        existingData.gameStarted = initialState.gameStarted;
        existingData.ingredients= {
            RecipeBook: [...initialState.ingredients.RecipeBook],
        };
        existingData.inventory = initialState.inventory;
        existingData.itemPickedUp = [...initialState.itemPickedUp]

        this.#store.reset();
        this.#updateDataManager(existingData);
        this.init(scene);
        this.saveData();
    }

    getAnimatedTextSpeed(){
        /** @type {import("../common/options.js").TextSpeedMenuOptions| undefined} */
        const choosenTextSpeed = this.#store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED);
        if(choosenTextSpeed === undefined){
            return TEXT_SPEED.MEDIUM;
        }

        switch(choosenTextSpeed){
            case TEXT_SPEED_OPTIONS.FAST:
                return TEXT_SPEED.FAST;
            case TEXT_SPEED_OPTIONS.MID:
                return TEXT_SPEED.MEDIUM;
            case TEXT_SPEED_OPTIONS.SLOW:
                return TEXT_SPEED.SLOW;
            default:
                exhaustiveGuard(choosenTextSpeed);
        }
    }

    /**
   * @param {Phaser.Scene} scene
   * @returns {import('../types/typedef.js').InventoryItem[]}
   */
  getInventory(scene) {
    /** @type {import('../types/typedef.js').InventoryItem[]} */
    const items = [];
    /** @type {import('../types/typedef.js').Inventory} */
    const inventory = this.#store.get(DATA_MANAGER_STORE_KEYS.INVENTORY);
    inventory.forEach((baseItem) => {
      const item = DataUtils.getItem(scene, baseItem.item.id);
      items.push({
        item: item,
        quantity: baseItem.quantity,
      });
    });
    return items;
  }

  /**
   * @param {import('../types/typedef.js').InventoryItem[]} items
   * @returns {void}
   */
  updateInventory(items) {
    const inventory = items.map((item) => {
      return {
        item: {
          id: item.item.id,
        },
        quantity: item.quantity,
      };
    });
    this.#store.set(DATA_MANAGER_STORE_KEYS.INVENTORY, inventory);
  }

  /**
   * 
   * @param {import("../types/typedef.js").Item} item 
   * @param {number} quantity 
   */
  addItem(item, quantity){
    const inventory = this.#store.get(DATA_MANAGER_STORE_KEYS.INVENTORY);
    const existingItem = inventory.find((inventoryItem)=>{
        return inventoryItem.item.id === item.id;
    });
    if(existingItem){
        existingItem.quantity += quantity;
        return;
    }

    inventory.push({
        item,
        quantity,
    });
    this.#store.set(DATA_MANAGER_STORE_KEYS.INVENTORY, inventory);
  }
  
  /**
   * 
   * @param {number} itemId 
   */
  addItemPicked(itemId){
    const itemsPickedUp = this.#store.get(DATA_MANAGER_STORE_KEYS.ITEMS_PICKED_UP) || [];
    itemsPickedUp.push(itemId);
    this.#store.set(DATA_MANAGER_STORE_KEYS.ITEMS_PICKED_UP, itemsPickedUp);
  }

    /**
     * 
     * @param {GlobalSate} data 
     * @return {void}
     */
    #updateDataManager(data){
        this.#store.set({
            [DATA_MANAGER_STORE_KEYS.PLAYER_POSITION]: data.player.position,
            [DATA_MANAGER_STORE_KEYS.PLAYER_LOCATION]: data.player.location || {...initialState.player.location},
            [DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION]: data.player.direction,
            [DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED]: data.options.textSpeed,
            [DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS]: data.options.battleSceneAnimations,
            [DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_STYLE]: data.options.battleStyle,
            [DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND]: data. options.sound,
            [DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME]: data.options.volume,
            [DATA_MANAGER_STORE_KEYS.OPTIONS_MENU_COLOR]: data.options.menuColor,
            [DATA_MANAGER_STORE_KEYS.GAME_STARTED]: data.gameStarted,
            [DATA_MANAGER_STORE_KEYS.INGREDIENTS_IN_BAG]: data.ingredients.RecipeBook,
            [DATA_MANAGER_STORE_KEYS.INVENTORY]: data.inventory,
            [DATA_MANAGER_STORE_KEYS.ITEMS_PICKED_UP]: data.itemPickedUp,


        });
    }

    #dataManagerDataToGlobalStateObject(){
        return{
            player: {
                position: {
                    x: this.#store.get(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION).x,
                    y: this.#store.get(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION).y,
                },
                direction: this.#store.get(DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION),
                location: {...this.#store.get(DATA_MANAGER_STORE_KEYS.PLAYER_LOCATION)}
            },
            options: {
                textSpeed: this.#store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED),
                battleSceneAnimations: this.#store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS),
                battleStyle: this.#store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_STYLE),
                sound: this.#store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND),
                volume: this.#store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME),
                menuColor: this.#store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_MENU_COLOR),
            },
            gameStarted: this.#store.get(DATA_MANAGER_STORE_KEYS.GAME_STARTED),
            ingredients: {
                RecipeBook: [...this.#store.get(DATA_MANAGER_STORE_KEYS.INGREDIENTS_IN_BAG)]
            },
            inventory: this.#store.get(DATA_MANAGER_STORE_KEYS.INVENTORY),
            itemPickedUp: [...(this.#store.get(DATA_MANAGER_STORE_KEYS.ITEMS_PICKED_UP) || [])],
        };
    }
}

export const dataManager = new DataManager();