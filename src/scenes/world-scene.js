import Phaser from "phaser";
import { SCENE_KEYS } from "./scene-keys.js";
import { ATTACK_ASSET_KEYS, AUDIO_ASSET_KEY, BATTLE_ASSET_KEYS, CHARACTER_ASSET_KEY, DATA_ASSET_KEYS, WORLD_ASSET_KEY } from "../assets/asset-keys.js";
import { Player } from "../world/characters/player.js";
import { Controls } from "../utils/controls.js";
import { DIRECTION } from "../common/direction.js";
import { TILE_SIZE, TILED_COLLISION_LAYER_ALPHA } from "../config.js";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "../utils/data-manager.js";
import { getTargetPositionFromGameObjectPositionAndDirection } from "../utils/grid-utils.js";
import { CANNOT_READ_SIGN_TEXT, SAMPLE_TEXT } from "../utils/text-utils.js";
import { DialogUi } from "../world/dialog-ui.js";
import { NPC } from "../world/characters/npc.js";
import { WorldMenu } from "../world/world-menu.js";
import { BaseScene } from "./base-scene.js";
import { DataUtils } from "../utils/data-utils.js";
import { LAMPRI } from "../world/characters/lampri.js";
import { weightedRandom } from "../utils/random.js";
import { Item } from "../world/item.js";
import { NPC_EVENT_TYPE } from "../types/typedef.js";
import { exhaustiveGuard } from "../utils/guard.js";
import { playBackgroundMusic, playSoundFx } from "../types/audio-utils.js";

/**
 * @typedef TiledObjectProperty
 * @type {object}
 * @property {string} name
 * @property {string} type
 * @property {any} value
 */
const TILED_SIGN_PROPERTY = Object.freeze({
  MESSAGE: 'message',
});

const CUSTOM_TILED_TYPES = Object.freeze({
  NPC: 'npc',
  LAMPRI: 'LAMPRI',
  NPC_PATH: 'npc_path',
});

const TILED_NPC_PROPERTY = Object.freeze({
  MOVEMENT_PATTERN: 'movement_pattern',
  FRAME: 'frame',
  ID: 'id',
});

const TILED_ENCOUNTER_PROPERTY = Object.freeze({
  AREA: 'area',
});

const TILED_ITEM_PROPERTY = Object.freeze({
  ITEM_ID: 'item_id',
  ID: 'id',
});

const TILED_AREA_METADATA_PROPERTY = Object.freeze({
  FAINT_LOCATION: 'faint_location',
  ID: 'id',
});

/**
 * @typedef WorldSceneData
 * @type {object}
 * @property {boolean} [isPlayerKnockedOut]
 * @property {string} [area]
 * @property {boolean} [isInterior]
 */

export class WorldScene extends BaseScene{
    /** @type {Player} */
    #player;
    /** @type {Phaser.Tilemaps.TilemapLayer | undefined} */
    #encounterLayer;
    /** @type {boolean} */
    #wildIngredientEncountered;
    /** @type {number} */
    #lastEncounterTime;
    /** @type {number} */
    #encounterCooldown = 7000; // Tiempo en milisegundos entre posibles encuentros
    /** @type {Phaser.Tilemaps.ObjectLayer | undefined} */
    #signLayer
    /** @type {DialogUi} */
    #dialogUi;
    /** @type {NPC[]} */
    #npcs;
    /** @type {NPC | undefined} */
    #npcPlayerIsInteractingWith
    /** @type {WorldMenu} */
    #menu;
    /** @type {WorldSceneData} */
    #sceneData;
    /** @type {Item[]} */
    #items;
    /** @type {Phaser.Tilemaps.ObjectLayer | undefined} */
    #entranceLayer;
    /** @type {number} */
    #lastNpcEventHandledIndex;
    /** @type {boolean} */
    #isProcessingNpcEvent;


    constructor() {
        super({
          key: SCENE_KEYS.WORLD_SCENE,
        });
        
      }

      /**
       * @param {WorldSceneData} data
     * @returns {void}
     */
      init(data){
        super.init(data);
        this.#sceneData = data;

        if(Object.keys(data).length === 0){
          this.#sceneData ={
            isPlayerKnockedOut: false,
          }
        }

        /** @type {string} */
        const area= this.#sceneData?.area || dataManager.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_LOCATION).area;
        let isInterior = this.#sceneData?.isInterior;
        if(isInterior === undefined){
          isInterior = dataManager.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_LOCATION).isInterior;
        }
        const isPlayerKnockedOut = this.#sceneData?.isPlayerKnockedOut || false;

        this.#sceneData = {
          area,
          isInterior,
          isPlayerKnockedOut,
        };

        //Update player localitations, and map data if the player was knocked out in a battle
        if(this.#sceneData.isPlayerKnockedOut){
          let map = this.make.tilemap({key: `${this.#sceneData.area.toUpperCase()}_LEVEL`});
          const areaMetadataProperties = map.getObjectLayer('Area-Metadata').objects[0].properties;

          
          const knockOutSpawnLocation = areaMetadataProperties.find((property)=> property.name === TILED_AREA_METADATA_PROPERTY.FAINT_LOCATION
        )?.value;
        
        if(knockOutSpawnLocation !== this.#sceneData.area){
          this.#sceneData.area = knockOutSpawnLocation;
          map = this.make.tilemap({ key: `${this.#sceneData.area.toUpperCase()}_LEVEL`});
          
          const reviveLocation = map.getObjectLayer('Revive-Location').objects[0];

          dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION,{
            x: reviveLocation.x,
            y: reviveLocation.y - TILE_SIZE,
          });
          dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION, DIRECTION.UP);

        }          

        }
        dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_LOCATION,
          /** @type {import("../utils/data-manager.js").PlayerLocation} */({
          area: this.#sceneData.area,
          isInterior: this.#sceneData.isInterior,})
        );

        this.#wildIngredientEncountered = false;
        this.#npcPlayerIsInteractingWith = undefined;
        this.#items = [];
        this.#encounterLayer = undefined;
        this.#signLayer = undefined;
        this.#encounterLayer = undefined;
        this.#lastNpcEventHandledIndex = -1;
        this.#isProcessingNpcEvent = false;
      }

      /**
     * @returns {void}
     */
      create(){
        super.create();

            // this value comes from the width of the level background image we are using
    // we set the max camera width to the size of our image in order to control what
    // is visible to the player, since the phaser game world is infinite.
    // this.cameras.main.setBounds(0, 0, 1280, 960);
    // this.cameras.main.setZoom(1.5);
    // this.cameras.main.centerOn(x, y);


    // create map and collision layer
    const map = this.make.tilemap({ key: `${this.#sceneData.area.toUpperCase()}_LEVEL` });
    // The first parameter is the name of the tileset in Tiled and the second parameter is the key
    // of the tileset image used when loading the file in preload.
    const collisionTiles = map.addTilesetImage('collision', WORLD_ASSET_KEY.WORLD_COLLISION);
    if (!collisionTiles) {
      console.log(`[${WorldScene.name}:create] encountered error while creating collision world data from tiled`);
      return;
    }
    
    const collisionLayer = map.createLayer('Collision', collisionTiles, 0, 0);
    if (!collisionLayer) {
      console.log(`[${WorldScene.name}:create] encountered error while creating collision layer using data from tiled`);
      return;
    }
    
    // Configuración del alpha y profundidad (opcional)
    collisionLayer.setDepth(2);
    // collisionLayer.setCollisionByProperty({ collides: true });
    collisionLayer.setCollisionByExclusion([-1]); // Excluye el índice -1 (los tiles vacíos)
    
    // Configurar colisiones con el sistema de físicas
    this.physics.world.setBoundsCollision(true, true, true, true);    

    // create interactive layer
    const hasSignLayer = map.getObjectLayer('Signs') !== null;
    if (hasSignLayer) {
      this.#signLayer = map.getObjectLayer('Signs');
    }

    // Create layer for scene transitions entrances
    const hasSceneTransitionLayer = map.getObjectLayer('Scene-Transitions') !== null;
    if(hasSceneTransitionLayer){
      this.#entranceLayer = map.getObjectLayer('Scene-Transitions');
    }



     // create collision layer for encounters
     const hasEncounterLayer = map.getLayerIndexByName('Encounter') !== null;
        if (hasEncounterLayer) {
          const encounterTiles = map.addTilesetImage('encounter', WORLD_ASSET_KEY.WORLD_ENCOUNTER_ZONE);
        if (!encounterTiles) {
          console.log(`[${WorldScene.name}:create] encountered error while creating encounter world data from tiled`);
          return;
        }
        this.#encounterLayer = map.createLayer('Encounter', encounterTiles, 0, 0);
        if (!this.#encounterLayer) {
          console.error('Encounter layer not initialized properly');
          return;
         }
        }
     

     

    if (!this.#sceneData.isInterior) {
        this.cameras.main.setBounds(0, 0, 2560, 1280);
    }
    this.cameras.main.setZoom(1.5);


    this.add.image(0, 0, `${this.#sceneData.area.toUpperCase()}_BACKGROUND`, 0).setOrigin(0);


    this.#createItems(map);

    this.#createNPCs(map);
  
    this.#player = new Player({
      scene: this,
      position:
      // {x: 4 * TILE_SIZE,
      // y: 4  * TILE_SIZE,},
        dataManager.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION),
      direction: dataManager.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION),
      collisionLayer: collisionLayer,
      hp: 100,
      spriteGridMovementFinishedCallback: () =>{
        this.#handlePlayerMovementUpdate();
      },
      spriteChagedDirectionalCallback: ()=>{
        this.#handlePlayerDirectionUpdate();
      },
      otherCharactersToCheckForCollisionsWith: this.#npcs,
      objectsToCheckForCollisionsWith:this.#items,
      entranceLayer: this.#entranceLayer,
      enterEntranceCallback: (entranceName, entranceId, isBuildingEntrance)=>{
        this.#handleEntranceEnteredCallback(entranceName, entranceId, isBuildingEntrance);
      }
    });
    this.cameras.main.startFollow(this.#player.sprite);

    this.#npcs.forEach((npc) =>{
      npc.addCharacterToCheckForCollisionsWith(this.#player);
    });

    // create foreground for depth
    this.add.image(0, 0, `${this.#sceneData.area.toUpperCase()}_FOREGROUND`, 0).setOrigin(0).setDepth(1000);



    //Create dialog ui
    this.#dialogUi = new DialogUi (this, 1200);

    //Create menu
    this.#menu = new WorldMenu(this);
    
    this.cameras.main.fadeIn(1000, 0, 0, 0, (camera, progress) =>{
      if(progress === 1){
      // If player was knocked out, we want to lock input, heal player, and then have npc show message
        if(this.#sceneData.isPlayerKnockedOut){
          this.#healPlayerIngredientsInBag();
          this.#dialogUi.showDialogModal([
            `What the-...`,
            `Don't push luck! Was hard to heal you!`
          ]);
        }

      }
    });
    dataManager.store.set(DATA_MANAGER_STORE_KEYS.GAME_STARTED, true);

    // audio
    playBackgroundMusic(this, AUDIO_ASSET_KEY.MAIN);
    
  }


      /**
       * 
       * @param {DOMHighResTimeStamp} time
       * @returns {void} 
       */
      update(time) {
        super.update();
        if (this.#wildIngredientEncountered) {
          this.#player.update(time);
          return;
        }
    
        
        const wasSpaceKeyPressed = this._controls.wasSpaceKeyPressed();
        const selectedDirectionHelDown = this._controls.getDirectionKeyPressedDown();
        const selectedDirectionPressedOnce = this._controls.getDirectionKeyJustPressed();
        if (selectedDirectionHelDown !== DIRECTION.NONE && !this.#isPlayerInputLocked()) {
          this.#player.moveCharacter(selectedDirectionHelDown);
        }

        if (wasSpaceKeyPressed && !this.#player.isMoving && !this.#menu.isVisible) {
          this.#handlePlayerInteraction();
        }

        if (this._controls.wasEnterKeyPressed() && !this.#player.isMoving) {
          if (this.#dialogUi.isVisible || this.#isProcessingNpcEvent) {
            return;
          }

          if (this.#menu.isVisible) {
            this.#menu.hide();
            return;
          }

          this.#menu.show();
        }

        if (this.#menu.isVisible) {
          if (selectedDirectionPressedOnce !== DIRECTION.NONE) {
            this.#menu.handlePlayerInput(selectedDirectionPressedOnce);
          }

          if (wasSpaceKeyPressed) {
            this.#menu.handlePlayerInput('OK');

            if (this.#menu.selectedMenuOption === 'SAVE') {
              this.#menu.hide();
              dataManager.saveData();
              this.#dialogUi.showDialogModal(['Game progress has been saved']);
            }
            if (this.#menu.selectedMenuOption === 'INGREDIENTS') {
              /** @type {import("./recipe-book-scene.js").RecipeBookSceneData} */
              const sceneDataToPass ={
                previousSceneName: SCENE_KEYS.WORLD_SCENE,
              }
              this.scene.launch(SCENE_KEYS.RECIPE_BOOK_SCENE, sceneDataToPass);
              this.scene.pause();
            }

            if (this.#menu.selectedMenuOption === 'BAG') {
              /** @type {import("./inventory-scene.js").InventorySceneData} */
              const sceneDataToPass ={
                previousSceneName: SCENE_KEYS.WORLD_SCENE,
              }
              this.scene.launch(SCENE_KEYS.INVENTORY_SCENE, sceneDataToPass);
              this.scene.pause();
            }

            if (this.#menu.selectedMenuOption === 'EXIT') {
              this.#menu.hide();
            }

            // TODO: handle other selected menu options
          }

          if (this._controls.wasBackKeyPressed()) {
            this.#menu.hide();
          }

            }
        
            this.#player.update(time);
        
            this.#npcs.forEach((npc) => {
              npc.update(time);
            });
          }
    
    
      #handlePlayerInteraction() {
        if (this.#dialogUi.isAnimationPlaying) {
          return;
        }
    
        if (this.#dialogUi.isVisible && !this.#dialogUi.moreMessagesToShow) {
          this.#dialogUi.hideDialogModal();
          if (this.#npcPlayerIsInteractingWith) {
            this.#handleNpcInteraction();
          }
          return;
        }
    
        if (this.#dialogUi.isVisible && this.#dialogUi.moreMessagesToShow) {
          this.#dialogUi.showNextMessage();
          return;
        }
    
        // get players current direction and check 1 tile over in that direction to see if there is an object that can be interacted with
        const { x, y } = this.#player.sprite;
        const targetPosition = getTargetPositionFromGameObjectPositionAndDirection({ x, y }, this.#player.direction);
    
        // check for sign, and display appropriate message if player is not facing up
        const nearbySign = this.#signLayer?.objects.find((object) => {
          if (!object.x || !object.y) {
            return false;
          }
    
          // In Tiled, the x value is how far the object starts from the left, and the y is the bottom of tiled object that is being added
          return object.x === targetPosition.x && object.y - TILE_SIZE === targetPosition.y;
        });
    
        if (nearbySign) {
          /** @type {TiledObjectProperty[]} */
          const props = nearbySign.properties;
          /** @type {string} */
          const msg = props.find((prop) => prop.name === TILED_SIGN_PROPERTY.MESSAGE)?.value;
    
          const usePlaceholderText = this.#player.direction !== DIRECTION.UP;
          let textToShow = CANNOT_READ_SIGN_TEXT;
          if (!usePlaceholderText) {
            textToShow = msg || SAMPLE_TEXT;
          }
          this.#dialogUi.showDialogModal([textToShow]);
          return;
        }
    
        const nearbyNpc = this.#npcs.find((npc) => {
          return npc.sprite.x === targetPosition.x && npc.sprite.y === targetPosition.y;
        });
        if (nearbyNpc) {
          nearbyNpc.facePlayer(this.#player.direction);
          nearbyNpc.isTalkingToPlayer = true;
          this.#npcPlayerIsInteractingWith = nearbyNpc;
          this.#handleNpcInteraction();
          return;
        }

        let nearbyItemIndex;
        const nearbyItem = this.#items.find((item, index) =>{
          if(item.position.x === targetPosition.x && item.position.y === targetPosition.y){
            nearbyItemIndex = index;
            return true;
          }
          return false;
        });

        if(nearbyItem){
          const item = DataUtils.getItem(this, nearbyItem.itemId);
          dataManager.addItem(item, 1);
          nearbyItem.gameObject.destroy();
          this.#items.splice(nearbyItemIndex, 1);
          dataManager.addItemPicked(nearbyItem.id);
          this.#dialogUi.showDialogModal([`You found a ${item.name}`]);
        };
      }

      
    #handlePlayerMovementUpdate() {
      dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION,{
        x: this.#player.sprite.x,
        y: this.#player.sprite.y,
      });

      if (!this.#encounterLayer || this.#wildIngredientEncountered) {
          return;
      }

      const currentTime = this.time.now;

      // Comprueba si el jugador está en una zona de encuentro
      const isInEncounterZone = this.#encounterLayer.getTileAtWorldXY(
          this.#player.sprite.x,
          this.#player.sprite.y,
          true
      )?.index !== -1;
      if (isInEncounterZone){
        playSoundFx(this, AUDIO_ASSET_KEY.GRASS);
      };


      if (!isInEncounterZone) {
          return;
      }

      if (currentTime - this.#lastEncounterTime < this.#encounterCooldown) {
          return;
      }

      this.#lastEncounterTime = currentTime;
      // Determina si ocurre un encuentro basado en una probabilidad
      const encounterChance = .9; // 20% de probabilidad de encuentro

      if (Math.random() < encounterChance) {
          console.log(`[${WorldScene.name}:handlePlayerMovementUpdate] Encuentro iniciado`);
          this.#startEncounter();
      }
  }

  #startEncounter() {
      this.#wildIngredientEncountered = true;

      const encounterAreaId =
      /** @type {TiledObjectProperty[]} */ (this.#encounterLayer.layer.properties).find(
        (property) => property.name === TILED_ENCOUNTER_PROPERTY.AREA
      ).value;


      const possibleIngredientIds = DataUtils.getEncounterAreaDetails(this, encounterAreaId);
      const randomIngredientId = weightedRandom(possibleIngredientIds);


      console.log(`[${WorldScene.name}:startEncounter] player encountered an ingredient in area ${encounterAreaId}, and ingredient id has been picked randomly ${randomIngredientId}`);
      this.cameras.main.fadeOut(2000);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        /** @type {import("./battle-scene.js").BattleSceneData} */
        const dataToPass = {
          enemyIngredient: [DataUtils.getIngredientById(this, randomIngredientId)],
          playerIngredient: dataManager.store.get(DATA_MANAGER_STORE_KEYS.INGREDIENTS_IN_BAG),
        }  
        this.scene.start(SCENE_KEYS.BATTLE_SCENE, dataToPass);
      });
  }

  #isPlayerInputLocked(){
    return this._controls.isInputLocked || this.#dialogUi.isVisible || this.#menu.isVisible || this.#isProcessingNpcEvent;
  }

  /**
   * @param {Phaser.Tilemaps.Tilemap} map
   * @returns {void}
   */
  #createNPCs(map) {
    this.#npcs = [];


    // Filtra las capas que contienen NPCs (de cualquier tipo).
    const npcLayers = map.getObjectLayerNames().filter((layerName) => layerName.includes('NPC'));
    
    
    npcLayers.forEach((layerName) => {
        const layer = map.getObjectLayer(layerName);
        
        // Busca el objeto NPC dentro de la capa.
        const npcObject = layer.objects.find((obj) => {
            return obj.type === CUSTOM_TILED_TYPES.NPC;

        });

        if (!npcObject || npcObject.x === undefined || npcObject.y === undefined) {
            return;  // Si no tiene posición válida, lo ignoramos.
        }

        //get the path objects for the npc
        const pathObjects = layer.objects.filter((obj) =>{
          return obj.type === CUSTOM_TILED_TYPES.NPC_PATH
        });

        const npcPath = {
          0: {x: npcObject.x, y: npcObject.y - TILE_SIZE}
        }
        pathObjects.forEach((obj) => {
          if(obj.x === undefined || obj.y === undefined){
            return;
          }

          npcPath[parseInt(obj.name, 10)] = {x: obj.x, y: obj.y - TILE_SIZE}
        });

        const npcAssetKeys = [];
        // Identificar el assetKey basado en el nombre de la capa o una propiedad del objeto.
        if (layerName.includes('LAMPRI')) {
          npcAssetKeys.push(CHARACTER_ASSET_KEY.LAMPRI);
        }
        if (layerName.includes('BEE')) {
          npcAssetKeys.push(CHARACTER_ASSET_KEY.BEE);
        }
        if (layerName.includes('KALEGO')) {
          npcAssetKeys.push(CHARACTER_ASSET_KEY.KALEGO);
        }
        // Puedes añadir más condiciones para incluir otros assetKeys
        if (!npcAssetKeys.length) {
          npcAssetKeys.push(CHARACTER_ASSET_KEY.LYAN); // Valor por defecto
        }
        

      const npcMovement =
      /** @type {TiledObjectProperty[]} */ (npcObject.properties).find(
        (property) => property.name === TILED_NPC_PROPERTY.MOVEMENT_PATTERN
      )?.value || 'IDLE';

      const npcId =
      /** @type {TiledObjectProperty[]} */ (npcObject.properties).find(
        (property) => property.name === TILED_NPC_PROPERTY.ID
      )?.value;
      const npcDetails = DataUtils.getNpcData(this, npcId);
        

        // Crear el NPC con los parámetros necesarios.
        const npc = new NPC({
            assetKeys: npcAssetKeys, // Pasa el array de assetKeys
            scene: this,
            hp: 100,
            position: { x: npcObject.x, y: npcObject.y - TILE_SIZE },
            direction: DIRECTION.DOWN,
            frame: npcDetails.frame,
            npcPath,
            movementPattern: npcMovement,
            events: npcDetails.events,
        });
        
             
        // Añadir el NPC al array.
        this.#npcs.push(npc);
        console.debug(`Creating animation: ${npcAssetKeys}`);

        
        // Llamar a switchSprite para cambiar el sprite en caso de que sea necesario.
        // npc.switchSprite();
    });
}


  #handlePlayerDirectionUpdate(){
    dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION, this.#player.direction);

  }
  
  #healPlayerIngredientsInBag(){
    // Heal all ingredients
    /** @type {import("../types/typedef.js").Ingredient[]} */
    const ingredients = dataManager.store.get(DATA_MANAGER_STORE_KEYS.INGREDIENTS_IN_BAG);
    ingredients.forEach((ingredient) => {
      ingredient.currentHp = ingredient.maxHp;
    });
    dataManager.store.set(DATA_MANAGER_STORE_KEYS.INGREDIENTS_IN_BAG, ingredients);
  }

  /**
   * @param {Phaser.Tilemaps.Tilemap} map
   * @returns {void}
   */
  #createItems(map) {
    const itemObjectLayer = map.getObjectLayer('Item');
    if (!itemObjectLayer) {
      return;
    }
    const items = itemObjectLayer.objects;
    const validItems = items.filter((item) => {
      return item.x !== undefined && item.y !== undefined;
    });

    /** @type {number[]} */
    const itemsPickedUp = dataManager.store.get(DATA_MANAGER_STORE_KEYS.ITEMS_PICKED_UP) || [];

    for (const tiledItem of validItems) {
      /** @type {number} */
      const itemId = /** @type {TiledObjectProperty[]} */ (tiledItem.properties).find(
        (property) => property.name === TILED_ITEM_PROPERTY.ITEM_ID
      )?.value;

      /** @type {number} */
      const id = /** @type {TiledObjectProperty[]} */ (tiledItem.properties).find(
        (property) => property.name === TILED_ITEM_PROPERTY.ID
      )?.value;

      if(itemsPickedUp.includes(id)){
        continue;
      }

      const item = new Item({
        scene: this,
        position: {
          x: tiledItem.x,
          y: tiledItem.y - TILE_SIZE,
        },
        itemId,
        id,
      });
      this.#items.push(item);
    }
  }
  /**
   * 
   * @param {string} entranceName 
   * @param {string} entranceId 
   * @param {boolean} isBuildingEntrance 
   */
  #handleEntranceEnteredCallback(entranceName, entranceId, isBuildingEntrance){
    this._controls.lockInput = true;
    console.log(entranceId, entranceName, isBuildingEntrance);

    const map = this.make.tilemap({key: `${entranceName.toUpperCase()}_LEVEL`});
    const entranceObjectLayer = map.getObjectLayer('Scene-Transitions');
    const entranceObject = entranceObjectLayer.objects.find((object)=>{
      const tempEntranceName = object.properties.find((property)=> property.name === 'connects_to').value;
      const tempEntranceId = object.properties.find((property)=> property.name === 'entrance_id').value;

      return tempEntranceName === this.#sceneData.area && tempEntranceId === entranceId;
    });
    
    let x = entranceObject.x;
    let y = entranceObject.y - TILE_SIZE;

    if(this.#player.direction === DIRECTION.UP){
      y -= TILE_SIZE;
    }
    if (this.#player.direction === DIRECTION.DOWN){
      y += TILE_SIZE;
    }

    this.cameras.main.fadeOut(100, 0, 0, 0, (camera, progress)=>{
      if(progress === 1){
        dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION,{
          x, y
        });
    
        /** @type {WorldSceneData} */
        const dataToPass = {
          area: entranceName,
          isInterior: isBuildingEntrance,
        }
        this.scene.start(SCENE_KEYS.WORLD_SCENE, dataToPass);
      }
    });
  }

  #handleNpcInteraction() {
    if (this.#isProcessingNpcEvent) {
      return;
    }
    // check to see if the npc has any events associated with them
    const isMoveEventsToProcess = this.#npcPlayerIsInteractingWith.events.length - 1 !== this.#lastNpcEventHandledIndex;

    if (!isMoveEventsToProcess) {
      this.#npcPlayerIsInteractingWith.isTalkingToPlayer = false;
      this.#npcPlayerIsInteractingWith = undefined;
      this.#lastNpcEventHandledIndex = -1;
      this.#isProcessingNpcEvent = false;
      return;
    }

    // get the next event from the queue and process for this npc
    this.#lastNpcEventHandledIndex += 1;
    const eventToHandle = this.#npcPlayerIsInteractingWith.events[this.#lastNpcEventHandledIndex];
    const eventType = eventToHandle.type;

    switch (eventType) {
      case NPC_EVENT_TYPE.MESSAGE:
        this.#dialogUi.showDialogModal(eventToHandle.data.messages);
        break;
      case NPC_EVENT_TYPE.HEAL:
        this.#isProcessingNpcEvent = true;
        this.#healPlayerIngredientsInBag();
        this.#isProcessingNpcEvent = false;
        this.#handleNpcInteraction();
        break;
      case NPC_EVENT_TYPE.SCENE_FADE_IN_AND_OUT:
        this.#isProcessingNpcEvent = true;
        this.cameras.main.fadeOut(eventToHandle.data.fadeOutDuration, 0, 0, 0, (fadeOutCamera, fadeOutProgress) =>{
          if(fadeOutProgress !== 1){
            return;
          }
          this.time.delayedCall(eventToHandle.data.waitDuration, ()=>{
            this.cameras.main.fadeIn(eventToHandle.data.fadeInDuration, 0, 0, 0, (fadeInCamera, fadeInProgress)=>{
              if(fadeInProgress !== 1){
                return;
              }
              this.#isProcessingNpcEvent = false;
              this.#handleNpcInteraction()
            });
          });
        });
        break;
      default:
        exhaustiveGuard(eventType);
    }
  }

}

