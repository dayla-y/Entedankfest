import Phaser from 'phaser';
import { SCENE_KEYS } from './scenes/scene-keys.js';
import { PreloadScene } from './scenes/preload-scene.js';
import { BattleScene } from './scenes/battle-scene.js';
import { WorldScene } from './scenes/world-scene.js';
import { TitleScene } from './scenes/tittle-scene.js';
import { OptionsScene } from './scenes/options-scene.js';
import { TestScene } from './scenes/test-scene.js';
import { PysichsTestScene } from './scenes/physics-test.js';
import { RecipeBookScene } from './scenes/recipe-book-scene.js';
import { IngredientDetailsScene } from './scenes/ingredient-details-scene.js';
import { InventoryScene } from './scenes/inventory-scene.js';

const game = new Phaser.Game({
  type: Phaser.CANVAS,
  pixelArt: true,
  physics : {
    default:"arcade",
    arcade: {
        debug: false // debug
    }
},

  scale: {
    parent: 'game-container',
    width: 1024,
    height: 576,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  backgroundColor: '#000000',
});

game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene);
game.scene.add(SCENE_KEYS.BATTLE_SCENE, BattleScene);
game.scene.add(SCENE_KEYS.WORLD_SCENE, WorldScene);
game.scene.add(SCENE_KEYS.TITLE_SCENE, TitleScene);
game.scene.add(SCENE_KEYS.OPTIONS_SCENE, OptionsScene);
game.scene.add(SCENE_KEYS.TEST_SCENE, TestScene);
game.scene.add(SCENE_KEYS.PHYSICS_TEST_SCENE, PysichsTestScene);
game.scene.add(SCENE_KEYS.RECIPE_BOOK_SCENE, RecipeBookScene);
game.scene.add(SCENE_KEYS.INGREDIENT_DETAILS_SCENE, IngredientDetailsScene);
game.scene.add(SCENE_KEYS.INVENTORY_SCENE, InventoryScene);
game.scene.start(SCENE_KEYS.PRELOAD_SCENE);
