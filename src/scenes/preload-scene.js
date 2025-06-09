import Phaser from 'phaser';
import {
  BATTLE_ASSET_KEYS,
  BATTLE_BACKGROUND_ASSET_KEYS,
  HEALTH_BAR_ASSET_KEYS,
  BATTLE_CHARACTHER_ASSET_KEYS,
  UI_ASSET_KEYS,
  DATA_ASSET_KEYS,
  ATTACK_ASSET_KEYS,
  WORLD_ASSET_KEY,
  CHARACTER_ASSET_KEY,
  TITLE_ASSET_KEY,
  OPTIONS_ASSET_KEY,
  RECIPE_BOOK_ASSET_KEY,
  INGREDIENT_DETAILS_ASSET_KEY,
  INVENTORY_ASSET_KEY,
  AUDIO_ASSET_KEY,
  PINK_ASSET_KEY,
  EXP_BAR_ASSET_KEYS,
} from '../assets/asset-keys.js';
import { SCENE_KEYS } from './scene-keys.js';
import { CARETODANCE, CUTIVE_REGULAR, KENNEYS_FONT } from '../assets/font-keys.js';
import { WebFontFileLoader } from '../assets/web-font-file-loader.js';
import { DataUtils } from '../utils/data-utils.js';
import { dataManager } from '../utils/data-manager.js';
import { BaseScene } from './base-scene.js';
import { setGlobalSoundSettings } from '../types/audio-utils.js';

export class PreloadScene extends BaseScene {
  constructor() {
    super({
      key: SCENE_KEYS.PRELOAD_SCENE,
    });
  }

  preload() {
    super.preload();
    const EntedankfestPath = 'assets/Entedankfest';
    const uiAssets = 'assets/textboxes';
    const attackAssetPath = 'assets/attack';
    const mapPathAsset = 'assets/map';
    const spritesPathAsset = 'assets/sprites/main-characters';
    const uititleasset = 'assets/ui/title';
    const uiRecipeBook = 'assets/ui/Recipe book';
    const uiDetailsBook = 'assets/ui/Ingredient details';
    const uiInventoryBook = 'assets/ui/Inventory';
    const battleUIAssethPath = 'assets/ui'



    // battle backgrounds
    this.load.image(
      BATTLE_BACKGROUND_ASSET_KEYS.FOREST,
      `${EntedankfestPath}/battle-backgrounds/forest-background.png`
    );

    // battle assets
    this.load.image(
      BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND,
      `${uiAssets}/righter-font/ui-space-expansion/custom-ui.png`
    );

    // health bar assets
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.RIGHT_CAP,
      `${uiAssets}/righter-font/ui-space-expansion/barHorizontal_green_right.png`
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.MIDDLE,
      `${uiAssets}/righter-font/ui-space-expansion/barHorizontal_green_mid.png`
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.LEFT_CAP,
      `${uiAssets}/righter-font/ui-space-expansion/barHorizontal_green_left.png`
    );

    this.load.image(
      HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW,
      `${uiAssets}/righter-font/ui-space-expansion/barHorizontal_shadow_right.png`
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW,
      `${uiAssets}/righter-font/ui-space-expansion/barHorizontal_shadow_mid.png`
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW,
      `${uiAssets}/righter-font/ui-space-expansion/barHorizontal_shadow_left.png`
    );


    // fresh exp bar assets
    this.load.image(
      EXP_BAR_ASSET_KEYS.EXP_LEFT_CAP,
      `${uiAssets}/righter-font/ui-space-expansion/left.png`
    );
    this.load.image(
      EXP_BAR_ASSET_KEYS.EXP_MIDDLE,
      `${uiAssets}/righter-font/ui-space-expansion/middle.png`
    );
    this.load.image(
      EXP_BAR_ASSET_KEYS.EXP_RIGHT_CAP,
      `${uiAssets}/righter-font/ui-space-expansion/right.png`
    );

    // Character assets (for battle)
    this.load.image(
        BATTLE_CHARACTHER_ASSET_KEYS.LYANEL,
      `${EntedankfestPath}/characters (for battle)/Lyan.png`
    );
    this.load.image(
        BATTLE_CHARACTHER_ASSET_KEYS.IANTHE,
      `${EntedankfestPath}/characters (for battle)/Ianthe.png`
    );
    this.load.image(BATTLE_CHARACTHER_ASSET_KEYS.SHIMADA, `${EntedankfestPath}/characters (for battle)/Kamo.png`);
    this.load.image(BATTLE_CHARACTHER_ASSET_KEYS.KIMARIS, `${EntedankfestPath}/characters (for battle)/North.png`);
    this.load.image(BATTLE_CHARACTHER_ASSET_KEYS.LAMP, `${EntedankfestPath}/characters (for battle)/Lampri.png`);
    this.load.image(BATTLE_CHARACTHER_ASSET_KEYS.FROG, `${EntedankfestPath}/characters (for battle)/Rana 90.png`);


    //UI assets
    this.load.image(
      UI_ASSET_KEYS.CURSOR,
    `${EntedankfestPath}/ui/cursor.png`
    );
    this.load.image(
      UI_ASSET_KEYS.CURSOR_DOWN,
    `${uititleasset}/cursor_down.png`
    );
    this.load.image(
      UI_ASSET_KEYS.CURSOR_LEFT,
    `${uititleasset}/cursor_left.png`
    );

    this.load.image(
      BATTLE_ASSET_KEYS.POTION_FULL,
      'assets/ui/potions/potion_full.png'
    );
    //D:\Documentos\Lyan. Entedankfest\assets\ui\potions\potion_empty.png
    this.load.image(
      BATTLE_ASSET_KEYS.POTION_EMPTY,
    `assets/ui/potions/potion_empty.png`
    );

    this.load.image(UI_ASSET_KEYS.MENU_BACKGROUND, `${uititleasset}/panel.png`);
    this.load.image(UI_ASSET_KEYS.DIALOG, `${uititleasset}/dialog.png`);

    this.load.image(UI_ASSET_KEYS.NOTIFICATION, `${uiAssets}/notification.png`);


    //Recipe book UI
    this.load.image(RECIPE_BOOK_ASSET_KEY.BOOK, `${uiRecipeBook}/Tiles.png`);
    this.load.image(RECIPE_BOOK_ASSET_KEY.LINES1, `${uiRecipeBook}/Tiles2.png`);
    this.load.image(RECIPE_BOOK_ASSET_KEY.LINES2, `${uiRecipeBook}/Tiles4.png`);
    this.load.image(RECIPE_BOOK_ASSET_KEY.LINES_PAPER, `${uiRecipeBook}/Tiles5.png`);
    this.load.image(RECIPE_BOOK_ASSET_KEY.PAPER, `${uiRecipeBook}/Tiles3.png`);
    this.load.image(RECIPE_BOOK_ASSET_KEY.HIGHLIGHT_1, `${uiRecipeBook}/1.png`);
    this.load.image(RECIPE_BOOK_ASSET_KEY.HIGHLIGHT_2, `${uiRecipeBook}/2.png`);
    this.load.image(RECIPE_BOOK_ASSET_KEY.HIGHLIGHT_3, `${uiRecipeBook}/3.png`);
    this.load.image(RECIPE_BOOK_ASSET_KEY.HIGHLIGHT_4, `${uiRecipeBook}/4.png`);
    this.load.image(UI_ASSET_KEYS.BUTTON_NORMAL, `${uiRecipeBook}/botton_normal.png`);
    this.load.image(UI_ASSET_KEYS.BUTTON_SELECTED, `${uiRecipeBook}/brown_botton.png`);


    //Details book UI
    this.load.image(INGREDIENT_DETAILS_ASSET_KEY.DECORATIONS_FOR_BOOK, `${uiDetailsBook}/_composite.png`);
  
    
    //Inventory book UI
    this.load.image(INVENTORY_ASSET_KEY.BOOK2, `${uiInventoryBook}/_composite.png`);


      // load json data
      this.load.json(DATA_ASSET_KEYS.ATTACKS, 'assets/data/attacks.json');
      this.load.json(DATA_ASSET_KEYS.ANIMATIONS, 'assets/data/animations.json');
      this.load.json(DATA_ASSET_KEYS.ITEMS, 'assets/data/items.json');
      this.load.json(DATA_ASSET_KEYS.INGREDIENTS, 'assets/data/ingredient.json');
      this.load.json(DATA_ASSET_KEYS.ENCOUNTERS, 'assets/data/encounters.json');
      this.load.json(DATA_ASSET_KEYS.NPCS, 'assets/data/npcs.json');


      //load custom fonts
      this.load.addFile(new WebFontFileLoader(this.load, [KENNEYS_FONT]));
      this.load.addFile(new WebFontFileLoader(this.load, [CARETODANCE]));

      //load attack assets
      this.load.spritesheet(ATTACK_ASSET_KEYS.FIRE, `${attackAssetPath}/lafire/lafire_atack.png`,{
        frameWidth: 64,
        frameHeight: 64,
      });
      this.load.spritesheet(ATTACK_ASSET_KEYS.FIRE_START, `${attackAssetPath}/lafire/lafire_start.png`,{
        frameWidth: 48,
        frameHeight: 48,
      });
      this.load.spritesheet(ATTACK_ASSET_KEYS.SLASH_PURPLE, `${attackAssetPath}/slash purple.png`,{
        frameWidth: 64,
        frameHeight: 64,
      });
      this.load.spritesheet(ATTACK_ASSET_KEYS.GREEN_SLASH, `${attackAssetPath}/PoisonSlashEffect_spritesheet.png`,{
        frameWidth: 64,
        frameHeight: 64,
      });
      this.load.spritesheet(ATTACK_ASSET_KEYS.FLAME_SLASH, `${attackAssetPath}/Flameslash1 spritesheet.png`,{
        frameWidth: 64,
        frameHeight: 64,
      });
      this.load.spritesheet(ATTACK_ASSET_KEYS.DARK_SPELL, `${attackAssetPath}/DarkSpell_01_spritesheet.png`,{
        frameWidth: 128,
        frameHeight: 128,
      });

      //Load world assets
      this.load.image(WORLD_ASSET_KEY.PINK_1_BACKGROUND, `${mapPathAsset}/pink-part/pink_1.png`);
      this.load.image(WORLD_ASSET_KEY.PINK_1_FOREGROUND, `${mapPathAsset}/pink-part/pink_4.png`);
      this.load.image(WORLD_ASSET_KEY.PATH, `${mapPathAsset}/pink-part/pink_2.png`);
      this.load.image(WORLD_ASSET_KEY.PINK1_MONTAIN, `${mapPathAsset}/pink-part/pink_4.png`);
      this.load.tilemapTiledJSON(WORLD_ASSET_KEY.PINK_1_LEVEL, `assets/data/pink_1.json`);
      this.load.image(WORLD_ASSET_KEY.WORLD_COLLISION, `${mapPathAsset}/collision.png`);
      this.load.image(WORLD_ASSET_KEY.WORLD_ENCOUNTER_ZONE, `${mapPathAsset}/encounter.png`);
      this.load.image(WORLD_ASSET_KEY.WORLD_SIGNS, `${mapPathAsset}/pink-part/pink_6.png`);
      this.load.spritesheet(WORLD_ASSET_KEY.TILE_SET_ONE, `${mapPathAsset}/Tileset1.png`,{
        frameWidth: 64,
        frameHeight: 64,
      });
      this.load.spritesheet(WORLD_ASSET_KEY.TILE_SET_TWO, `${mapPathAsset}/Tileset2.png`,{
        frameWidth: 64,
        frameHeight: 64,
      });
      this.load.spritesheet(WORLD_ASSET_KEY.TILE_SET_THREE, `${mapPathAsset}/Tileset3.png`,{
        frameWidth: 64,
        frameHeight: 64,
      });
      this.load.spritesheet(WORLD_ASSET_KEY.GROUND, `${mapPathAsset}/Ground1.png`,{
        frameWidth: 64,
        frameHeight: 64,
      });
      this.load.spritesheet(WORLD_ASSET_KEY.POTIONS, `${mapPathAsset}/[64x64] Potions.png`,{
        frameWidth: 64,
        frameHeight: 64,
      });


      this.load.tilemapTiledJSON(PINK_ASSET_KEY.PINK_LEFT_1_MAIN_LEVEL, `assets/data/pink_left_1.json`);
      this.load.image(PINK_ASSET_KEY.PINK_LEFT_1_BACKGROUND, `${mapPathAsset}/pink-part/pink-left1-background.png`);
      this.load.image(PINK_ASSET_KEY.PINK_LEFT_1_FOREGROUND, `${mapPathAsset}/pink-part/pink-left1-foreground.png`);


      //Load character images
      this.load.spritesheet(CHARACTER_ASSET_KEY.LYAN, `${spritesPathAsset}/Len.png`,{
        frameWidth: 128,
        frameHeight: 128,
      });
      this.load.spritesheet(CHARACTER_ASSET_KEY.BEE, `${spritesPathAsset}/Bee2.png`,{
        frameWidth: 128,
        frameHeight: 128,
      });
      this.load.spritesheet(CHARACTER_ASSET_KEY.LAMPRI, `${spritesPathAsset}/Lampri.png`,{
        frameWidth: 128,
        frameHeight: 128,
      });
      this.load.spritesheet(CHARACTER_ASSET_KEY.KALEGO, `${spritesPathAsset}/Kalego2.png`,{
        frameWidth: 128,
        frameHeight: 128,
      });
      this.load.spritesheet(CHARACTER_ASSET_KEY.FOCALORS, `${spritesPathAsset}/Ianthe.png`,{
        frameWidth: 128,
        frameHeight: 128,
      });
      
      //ui components for title
      this.load.image(TITLE_ASSET_KEY.BACKGROUND, `${uititleasset}/Comparatio.png`);
      this.load.image(TITLE_ASSET_KEY.PANEL, `${uititleasset}/1.png`);
      this.load.image(TITLE_ASSET_KEY.TITLE, `${uititleasset}/title_text.png`);

      //ui components for options
      this.load.image(OPTIONS_ASSET_KEY.FIRST, `${uititleasset}/Tiles.png`);
      this.load.image(UI_ASSET_KEYS.MENU_BACKGROUND_BLACK, `${uititleasset}/black.png`);
      this.load.image(UI_ASSET_KEYS.MENU_BACKGROUND_BLUE, `${uititleasset}/blue.png`);
      this.load.image(OPTIONS_ASSET_KEY.FIRST_PANEL, `${uititleasset}/Tiles2.png`);
      this.load.image(OPTIONS_ASSET_KEY.DECORATIONS, `${uititleasset}/Tiles5.png`);
      this.load.image(OPTIONS_ASSET_KEY.LINES_PAPER, `${uititleasset}/Tiles4.png`);
      this.load.image(OPTIONS_ASSET_KEY.OPTION_PANEL, `${uititleasset}/Tiles3.png`);
  
      // Load audio
      this.load.setPath('assets/audio');
      this.load.audio(AUDIO_ASSET_KEY.MAIN, 'QUEEN.wav');
      this.load.audio(AUDIO_ASSET_KEY.BATTLE, 'オーバーライド.wav');
      this.load.audio(AUDIO_ASSET_KEY.TITLE, 'ラビットホール.wav');
      this.load.audio(AUDIO_ASSET_KEY.FIRE, 'Fire2.wav');
      this.load.audio(AUDIO_ASSET_KEY.GRASS, '03_Step_grass_03.wav');
      this.load.audio(AUDIO_ASSET_KEY.FLEE, 'GameOver2.wav');
      this.load.audio(AUDIO_ASSET_KEY.SLASH, 'Explosion4.wav');



  }
  
  

  create() {
    super.create();

    this.#createAnimations();

    dataManager.init(this);
    dataManager.loadData();
    setGlobalSoundSettings(this);

    this.scene.start(SCENE_KEYS.TITLE_SCENE);
  }

  #createAnimations() {
    const animations = DataUtils.getAnimations(this);
    animations.forEach((animation) => {
      const frames = animation.frames
        ? this.anims.generateFrameNumbers(animation.assetKey, { frames: animation.frames })
        : this.anims.generateFrameNumbers(animation.assetKey);
      this.anims.create({
        key: animation.key,
        frames: frames,
        frameRate: animation.frameRate,
        repeat: animation.repeat,
        delay: animation.delay,
      });
    });
  }
}
