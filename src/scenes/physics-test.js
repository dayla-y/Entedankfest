import { CHARACTER_ASSET_KEY, WORLD_ASSET_KEY } from "../assets/asset-keys";
import { PlayerCameraStrategy } from "../utils/camera_strategy";
import Character from "../world/physics-characters/character";
import { SCENE_KEYS } from "./scene-keys";


export class PysichsTestScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENE_KEYS.PHYSICS_TEST_SCENE,      
    });
    this.cameraStrategy = null; // La cámara de estrategia personalizada

    
  }


  create() {
    console.log(`[${PysichsTestScene.name}:create] invoked`);


    this.add.image(0, 0, WORLD_ASSET_KEY.WORLD_BACKGROUND, 0).setOrigin(0);

    // Configurar las capas de colisión
    const map = this.make.tilemap({ key: WORLD_ASSET_KEY.WORLD_MAIN_LEVEL });

    const collisionTiles = map.addTilesetImage('collision', WORLD_ASSET_KEY.WORLD_COLLISION);
    if (!collisionTiles) {
      console.log(`[${PysichsTestScene.name}:create] encountered error while creating collision world data from tiled`);
      return;
    }
    
    const collisionLayer = map.createLayer('Collision', collisionTiles, 0, 0);
    if (!collisionLayer) {
      console.log(`[${PysichsTestScene.name}:create] encountered error while creating collision layer using data from tiled`);
      return;
    }
    
    // Configuración del alpha y profundidad (opcional)
    collisionLayer.setAlpha(.5).setDepth(2);
    collisionLayer.setCollisionByExclusion([-1]); // Excluye el índice -1 (los tiles vacíos)
    
    // Configurar colisiones con el sistema de físicas
    this.physics.world.setBoundsCollision(true, true, true, true);    
        
    
    this.Player = new Character(this, 200, 200, CHARACTER_ASSET_KEY.LYAN);
    this.cameraStrategy = new PlayerCameraStrategy(this.Player, this);    this.physics.add.collider(this.Player, collisionLayer, (Player, tile) => {
      });
    // Activar colisión en las baldosas marcadas con una propiedad específica
    collisionLayer.setCollisionByProperty({ collides: true });

    const mapLimits = this.cameras.main.setBounds(0, 0, 2560, 1920);
    this.cameraStrategy.setRoomLimits(mapLimits);

  
  }



    update () {   
        this.Player.update();
        this.cameraStrategy.action();
    }
}