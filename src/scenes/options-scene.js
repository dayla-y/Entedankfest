import Phaser from "phaser";
import { SCENE_KEYS } from './scene-keys.js';
import { OPTIONS_ASSET_KEY, UI_ASSET_KEYS } from "../assets/asset-keys.js";
import { CARETODANCE } from "../assets/font-keys.js";
import { Controls } from "../utils/controls.js";
import { BATTLE_SCENE_OPTIONS, BATTLE_STYLE_OPTIONS, OPTION_MENU_OPTIONS, SOUND_OPTIONS, TEXT_SPEED_OPTIONS } from "../common/options.js";
import { DIRECTION } from "../common/direction.js";
import { exhaustiveGuard } from "../utils/guard.js";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "../utils/data-manager.js";
import { BaseScene } from "./base-scene.js";
import { setGlobalSoundSettings } from "../types/audio-utils.js";
/** @type {Phaser.Types.GameObjects.Text.TextStyle} */
export const OPTIONS_TEXT_STYLE = Object.freeze({
    fontFamily: CARETODANCE,
    color: '#4D4A49',
    fontSize: '20px',
});

const OPTION_MENU_OPTION_INFO_MSG = Object.freeze({
  TEXT_SPEED: 'Choose one to three text to display speeds.',
  BATTLE_SCENE: ' Choose to display battle animations, and effects or not.',
  BATTLE_STYLE: 'Choose to allow ingredients to be recalled even if they are not fresh.',
  SOUND: 'Choose to enable or disable the sound.',
  VOLUME: 'Choose the volume for the music and sound effects of the game.',
  MENU_COLOR: 'Choose one of the tree menu color options.',
  CONFIRM: 'Save your changes and go back to the main menu.',
});

const TEXT_FONT_COLORS = Object.freeze({
  NOT_SELECTED: '#4D4A49',
  SELECTED: '#718a86'
});

const BACKGROUND = Object.freeze({
  BROWN: OPTIONS_ASSET_KEY.FIRST,
  BLACK: UI_ASSET_KEYS.MENU_BACKGROUND_BLACK,
  BLUE: UI_ASSET_KEYS.MENU_BACKGROUND_BLUE,
})

export class OptionsScene extends BaseScene {
  /** @type {Phaser.GameObjects.Container} */
  #mainContainer;
  /** @type {Phaser.GameObjects.Group} */
  #textSpeedOptionTextObjects;
  /** @type {Phaser.GameObjects.Group} */
  #battleSceneOptionTextObjects;
  /** @type {Phaser.GameObjects.Group} */
  #battelStyleOptionTextObjects;
  /** @type {Phaser.GameObjects.Group} */
  #soundOptionTextObjects;
  /** @type {Phaser.GameObjects.Rectangle} */
  #volumeOptionMenuCursor;
  /** @type {Phaser.GameObjects.Text} */
  #volumeOptionsValueText;
  /** @type {Phaser.GameObjects.Text} */
  #selectedMenuColorTextGameObject
  /** @type {Phaser.GameObjects.Container} */
  #infoContainer;
  /** @type {Phaser.GameObjects.Text} */
  #selectedOptionInfoMsgTextGameObject;
  /** @type {Phaser.GameObjects.Rectangle} */
  #optionMenuCursor
  /** @type {import("../common/options.js").OptionMenuOptions} */
  #selectedOptionMenu;
  /** @type {import("../common/options.js").TextSpeedMenuOptions} */
  #selectedTextSpeedOption;
  /** @type {import("../common/options.js").BattleSceneMenuOptions} */
  #selectedBattleSceneOption;
  /** @type {import("../common/options.js").BattleStyleMenuOptions} */
  #selectedBattleStyleOption;
  /** @type {import("../common/options.js").SoundMenuOptions} */
  #selectedSoundOption;
  /** @type {import("../common/options.js").VolumeMenuOptions} */
  #selectedVolumeOption;
  /** @type {import("../common/options.js").MenuColorOptions} */
  #selectedMenuColorOption;
  /** @type {Phaser.GameObjects.Image} */
  #background
  
  
    constructor() {
        super({
          key: SCENE_KEYS.OPTIONS_SCENE,
        });
      }

      init(){
        super.init();


        this.#selectedOptionMenu = OPTION_MENU_OPTIONS.TEXT_SPEED;
        this.#selectedTextSpeedOption = dataManager.store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED);
        this.#selectedBattleSceneOption = dataManager.store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS);
        this.#selectedBattleStyleOption = dataManager.store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_STYLE);
        this.#selectedSoundOption = dataManager.store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND);
        this.#selectedVolumeOption = dataManager.store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME);
        this.#selectedMenuColorOption = dataManager.store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_MENU_COLOR);
      }

      create() {
        super.create();
        //main options container

        // this.#background = this.add.image(0, 0, BACKGROUND.BROWN).setOrigin(0);
        this.add.image(0, 0, OPTIONS_ASSET_KEY.FIRST_PANEL).setOrigin(0);
        this.add.image(0, 0, OPTIONS_ASSET_KEY.LINES_PAPER).setOrigin(0);
        const image1 = this.add.image(0, 0, OPTIONS_ASSET_KEY.OPTION_PANEL).setOrigin(0);
        const image2 =this.add.image(0, 0, OPTIONS_ASSET_KEY.DECORATIONS).setOrigin(0);
        

        // create main options sections
        this.add.text(190, 95, 'OPTIONS', OPTIONS_TEXT_STYLE).setOrigin(.5).setRotation(-.12);
        const menuOptionsPosition = {
          xStart: 490,
          xIncrement: -3,
          yStart: 110,
          yIncrement: 60
        }
        const menuOptions = ['Text Speed', 'Battle Scene', 'Battle Style', 'Sound', 'Volume', 'Menu Color', 'Close'];
        menuOptions.forEach((option, index) =>{
          const x = menuOptionsPosition.xStart +menuOptionsPosition.xIncrement * index;
          const y = menuOptionsPosition.yStart +menuOptionsPosition.yIncrement * index;
          const textGameObject = this.add.text(x, y, option, OPTIONS_TEXT_STYLE).setRotation(.1);

        });
        
        // create text speed options
        this.#textSpeedOptionTextObjects = this.add.group([
          this.add.text(680, 128, 'Slow', OPTIONS_TEXT_STYLE).setRotation(.1),
          this.add.text(800, 140, 'Mid', OPTIONS_TEXT_STYLE).setRotation(.1),
          this.add.text(900, 148, 'Fast', OPTIONS_TEXT_STYLE).setRotation(.1),
        ]);

        // create battle scene options
        this.#battleSceneOptionTextObjects = this.add.group([
          this.add.text(675, 185, 'On', OPTIONS_TEXT_STYLE).setRotation(.1),
          this.add.text(800, 195, 'Off', OPTIONS_TEXT_STYLE).setRotation(.1),
        ]);

        // create battle style options
        this.#battelStyleOptionTextObjects = this.add.group([
          this.add.text(670, 245, 'Set', OPTIONS_TEXT_STYLE).setRotation(.1),
          this.add.text(800, 252, 'Shift', OPTIONS_TEXT_STYLE).setRotation(.1),
        ]);

        // create sounds options

        this.#soundOptionTextObjects = this.add.group([
          this.add.text(665, 305, 'On', OPTIONS_TEXT_STYLE).setRotation(.1),
          this.add.text(800, 320, 'Off', OPTIONS_TEXT_STYLE).setRotation(.1),
        ]);

        // volume options
        this.add.rectangle(650, 382, 250, 3, 0x4D4A49, 1).setOrigin(0, 0.5).setRotation(.1);
        this.#volumeOptionMenuCursor = this.add.rectangle(895, 406, 10, 25, 0x4c9f89, 1).setOrigin(0, 0.5).setRotation(.1);
        this.#volumeOptionsValueText = this.add.text(910, 396, '100%', OPTIONS_TEXT_STYLE).setRotation(.1).setScale(.9);
        // frame options
        this.#selectedMenuColorTextGameObject = this.add.text(590, 350, '', OPTIONS_TEXT_STYLE)
        this.add.image(700, 430, UI_ASSET_KEYS.CURSOR_LEFT).setOrigin(1, 0).setScale(2).setRotation(.1);
        this.add.image(840, 443, UI_ASSET_KEYS.CURSOR_LEFT).setOrigin(0, 0).setScale(2).setFlipX(true).setRotation(.1);

        // options details container
        // this.#infoContainer.setX(100).setY(100) 

        this.#selectedOptionInfoMsgTextGameObject = this.add.text(50, 159, OPTION_MENU_OPTION_INFO_MSG.TEXT_SPEED, {
          ...OPTIONS_TEXT_STYLE,
          ...{
            wordWrap: {width: 380}
          },
        });

          this.#optionMenuCursor = this.add.rectangle(470, 107, 520, 35, 0xfffff, 0).setOrigin(0).setStrokeStyle(0, 0x4D4A49, 2).setRotation(.1);
        
          this.#updateTextSpeedGameObject();
          this.#updateBattleSceneOptionGameObjects();
          this.#updateBattleStyleOptionGameObjects();
          this.#updateSoundOptionGameObjects();
          this.#updateVolumeSlider();
          this.#updateMenuColorDisplayText();
          


          this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,()=>{
            this.scene.start(SCENE_KEYS.TITLE_SCENE);
          })
      }

      update(){
        super.update();
        if(this._controls.isInputLocked){
          return;
        }

        if (this._controls.wasSpaceKeyPressed() && this.#selectedOptionMenu === OPTION_MENU_OPTIONS.CONFIRM) {
          this._controls.lockInput = true;
          this.#updateOptionDataInDataManager();
          setGlobalSoundSettings(this);
          this.cameras.main.fadeOut(500, 0, 0, 0);
          return;
        }

        const selectedDirection = this._controls.getDirectionKeyJustPressed();
        if(selectedDirection !== DIRECTION.NONE){
          this.#moveOptionMenuCursor(selectedDirection);
        }
      }

      #updateOptionDataInDataManager(){
        dataManager.store.set({
          [DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED]: this.#selectedTextSpeedOption,
          [DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS]: this.#selectedBattleSceneOption,
          [DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_STYLE]: this.#selectedBattleStyleOption,
          [DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND]: this.#selectedSoundOption,
          [DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME]: this.#selectedVolumeOption,
          [DATA_MANAGER_STORE_KEYS.OPTIONS_MENU_COLOR]: this.#selectedMenuColorOption,
        });
        dataManager.saveData();
      }

      /**
       * 
       * @param {import("../common/direction.js").Direction} direction 
       */
      #moveOptionMenuCursor(direction) {
        if (direction === DIRECTION.NONE) {
          return;
        }
    
        this.#updateSelectedOptionMenuFromInput(direction);
    
        switch (this.#selectedOptionMenu) {
          case OPTION_MENU_OPTIONS.TEXT_SPEED:
            this.#optionMenuCursor.setY(108).setX(470);
            break;
          case OPTION_MENU_OPTIONS.BATTLE_SCENE:
            this.#optionMenuCursor.setY(165).setX(460);
            break;
          case OPTION_MENU_OPTIONS.BATTLE_STYLE:
            this.#optionMenuCursor.setY(223).setX(455);
            break;
          case OPTION_MENU_OPTIONS.SOUND:
            this.#optionMenuCursor.setY(286).setX(450);
            break;
          case OPTION_MENU_OPTIONS.VOLUME:
            this.#optionMenuCursor.setY(347).setX(455);
            break;
          case OPTION_MENU_OPTIONS.MENU_COLOR:
            this.#optionMenuCursor.setY(405).setX(450);
            break;
          case OPTION_MENU_OPTIONS.CONFIRM:
            this.#optionMenuCursor.setY(465).setX(450);
            break;
          default:
            exhaustiveGuard(this.#selectedOptionMenu);
        }
        this.#selectedOptionInfoMsgTextGameObject.setText(OPTION_MENU_OPTION_INFO_MSG[this.#selectedOptionMenu]);
      }
    
      /**
       * @param {import('../common/direction.js').Direction} direction
       */
      #updateSelectedOptionMenuFromInput(direction) {
        if (direction === DIRECTION.NONE) {
          return;
        }
    
        if (this.#selectedOptionMenu === OPTION_MENU_OPTIONS.TEXT_SPEED) {
          switch (direction) {
            case DIRECTION.DOWN:
              this.#selectedOptionMenu = OPTION_MENU_OPTIONS.BATTLE_SCENE;
              return;
            case DIRECTION.UP:
              this.#selectedOptionMenu = OPTION_MENU_OPTIONS.CONFIRM;
              return;
            case DIRECTION.LEFT:
            case DIRECTION.RIGHT:
              this.#updateTextSpeedOption(direction);
              this.#updateTextSpeedGameObject();
              return;
            default:
              exhaustiveGuard(direction);
          }
          return;
        }
    
        if (this.#selectedOptionMenu === OPTION_MENU_OPTIONS.BATTLE_SCENE) {
          switch (direction) {
            case DIRECTION.DOWN:
              this.#selectedOptionMenu = OPTION_MENU_OPTIONS.BATTLE_STYLE;
              return;
            case DIRECTION.UP:
              this.#selectedOptionMenu = OPTION_MENU_OPTIONS.TEXT_SPEED;
              return;
            case DIRECTION.LEFT:
            case DIRECTION.RIGHT:
              this.#updateBattleSceneOption(direction);
              this.#updateBattleSceneOptionGameObjects();
              return;
            default:
              exhaustiveGuard(direction);
          }
          return;
        }
    
        if (this.#selectedOptionMenu === OPTION_MENU_OPTIONS.BATTLE_STYLE) {
          switch (direction) {
            case DIRECTION.DOWN:
              this.#selectedOptionMenu = OPTION_MENU_OPTIONS.SOUND;
              return;
            case DIRECTION.UP:
              this.#selectedOptionMenu = OPTION_MENU_OPTIONS.BATTLE_SCENE;
              return;
            case DIRECTION.LEFT:
            case DIRECTION.RIGHT:
              this.#updateBattleStyleOption(direction);
              this.#updateBattleStyleOptionGameObjects();
              return;
            default:
              exhaustiveGuard(direction);
          }
          return;
        }
    
        if (this.#selectedOptionMenu === OPTION_MENU_OPTIONS.SOUND) {
          switch (direction) {
            case DIRECTION.DOWN:
              this.#selectedOptionMenu = OPTION_MENU_OPTIONS.VOLUME;
              return;
            case DIRECTION.UP:
              this.#selectedOptionMenu = OPTION_MENU_OPTIONS.BATTLE_STYLE;
              return;
            case DIRECTION.LEFT:
            case DIRECTION.RIGHT:
              this.#updateSoundOption(direction);
              this.#updateSoundOptionGameObjects();
              return;
            default:
              exhaustiveGuard(direction);
          }
          return;
        }
    
        if (this.#selectedOptionMenu === OPTION_MENU_OPTIONS.VOLUME) {
          switch (direction) {
            case DIRECTION.DOWN:
              this.#selectedOptionMenu = OPTION_MENU_OPTIONS.MENU_COLOR;
              return;
            case DIRECTION.UP:
              this.#selectedOptionMenu = OPTION_MENU_OPTIONS.SOUND;
              return;
            case DIRECTION.LEFT:
            case DIRECTION.RIGHT:
              this.#updateVolumeOption(direction);
              this.#updateVolumeSlider();
              return;
            default:
              exhaustiveGuard(direction);
          }
          return;
        }
    
        if (this.#selectedOptionMenu === OPTION_MENU_OPTIONS.MENU_COLOR) {
          switch (direction) {
            case DIRECTION.DOWN:
              this.#selectedOptionMenu = OPTION_MENU_OPTIONS.CONFIRM;
              return;
            case DIRECTION.UP:
              this.#selectedOptionMenu = OPTION_MENU_OPTIONS.VOLUME;
              return;
            case DIRECTION.LEFT:
            case DIRECTION.RIGHT:
              this.#updateMenuColorOption(direction);
              this.#updateMenuColorDisplayText();
              return;
            default:
              exhaustiveGuard(direction);
          }
          return;
        }
    
        if (this.#selectedOptionMenu === OPTION_MENU_OPTIONS.CONFIRM) {
          switch (direction) {
            case DIRECTION.DOWN:
              this.#selectedOptionMenu = OPTION_MENU_OPTIONS.TEXT_SPEED;
              return;
            case DIRECTION.UP:
              this.#selectedOptionMenu = OPTION_MENU_OPTIONS.MENU_COLOR;
              return;
            case DIRECTION.LEFT:
            case DIRECTION.RIGHT:
              // TODO;
              return;
            default:
              exhaustiveGuard(direction);
          }
          return;
        }
    
        exhaustiveGuard(this.#selectedOptionMenu);
      }

      /**
     *
     * @param {'LEFT' | 'RIGHT'} direction
     */
    #updateTextSpeedOption(direction) {
      if (direction === DIRECTION.LEFT) {
        if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.SLOW) {
          return;
        }
        if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.MID) {
          this.#selectedTextSpeedOption = TEXT_SPEED_OPTIONS.SLOW;
          return;
        }
        if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.FAST) {
          this.#selectedTextSpeedOption = TEXT_SPEED_OPTIONS.MID;
          return;
        }
        exhaustiveGuard(this.#selectedTextSpeedOption);
        return;
      }

      if (direction === DIRECTION.RIGHT) {
        if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.FAST) {
          return;
        }
        if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.MID) {
          this.#selectedTextSpeedOption = TEXT_SPEED_OPTIONS.FAST;
          return;
        }
        if (this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.SLOW) {
          this.#selectedTextSpeedOption = TEXT_SPEED_OPTIONS.MID;
          return;
        }
        exhaustiveGuard(this.#selectedTextSpeedOption);
        return;
      }

      exhaustiveGuard(direction);
    }
          
      #updateTextSpeedGameObject(){
        const textGameObject = /** @type {Phaser.GameObjects.Text[]} */ (this.#textSpeedOptionTextObjects.getChildren());
        textGameObject.forEach((obj)=>{
          obj.setColor(TEXT_FONT_COLORS.NOT_SELECTED);
        });

        if(this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.SLOW){
          textGameObject[0].setColor(TEXT_FONT_COLORS.SELECTED);
          return;
        }

        if(this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.MID){
          textGameObject[1].setColor(TEXT_FONT_COLORS.SELECTED);
          return;
        }

        if(this.#selectedTextSpeedOption === TEXT_SPEED_OPTIONS.FAST){
          textGameObject[2].setColor(TEXT_FONT_COLORS.SELECTED);
          return;
        }
        exhaustiveGuard(this.#selectedTextSpeedOption);
      }

   /**
   *
   * @param {'LEFT' | 'RIGHT'} direction
   */
  #updateBattleSceneOption(direction) {
    if (direction === DIRECTION.LEFT && this.#selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.ON) {
      return;
    }
    if (direction === DIRECTION.LEFT) {
      this.#selectedBattleSceneOption = BATTLE_SCENE_OPTIONS.ON;
      return;
    }

    if (direction === DIRECTION.RIGHT && this.#selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.OFF) {
      return;
    }
    if (direction === DIRECTION.RIGHT) {
      this.#selectedBattleSceneOption = BATTLE_SCENE_OPTIONS.OFF;
      return;
    }

    exhaustiveGuard(direction);
  }
  #updateBattleSceneOptionGameObjects() {
    const textGameObjects = /** @type {Phaser.GameObjects.Text[]} */ (
      this.#battleSceneOptionTextObjects.getChildren()
    );

    textGameObjects.forEach((obj) => {
      obj.setColor(TEXT_FONT_COLORS.NOT_SELECTED);
    });

    if (this.#selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.OFF) {
      textGameObjects[1].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }

    if (this.#selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.ON) {
      textGameObjects[0].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }

    exhaustiveGuard(this.#selectedBattleSceneOption);
  }

  /**
   *
   * @param {'LEFT' | 'RIGHT'} direction
   */
  #updateBattleStyleOption(direction) {
    if (direction === DIRECTION.LEFT && this.#selectedBattleStyleOption === BATTLE_STYLE_OPTIONS.SET) {
      return;
    }
    if (direction === DIRECTION.LEFT) {
      this.#selectedBattleStyleOption = BATTLE_STYLE_OPTIONS.SET;
      return;
    }

    if (direction === DIRECTION.RIGHT && this.#selectedBattleStyleOption === BATTLE_STYLE_OPTIONS.SHIFT) {
      return;
    }
    if (direction === DIRECTION.RIGHT) {
      this.#selectedBattleStyleOption = BATTLE_STYLE_OPTIONS.SHIFT;
      return;
    }

    exhaustiveGuard(direction);
  }
  #updateBattleStyleOptionGameObjects() {
    const textGameObjects = /** @type {Phaser.GameObjects.Text[]} */ (
      this.#battelStyleOptionTextObjects.getChildren()
    );

    textGameObjects.forEach((obj) => {
      obj.setColor(TEXT_FONT_COLORS.NOT_SELECTED);
    });

    if (this.#selectedBattleStyleOption === BATTLE_STYLE_OPTIONS.SHIFT) {
      textGameObjects[1].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }

    if (this.#selectedBattleStyleOption === BATTLE_STYLE_OPTIONS.SET) {
      textGameObjects[0].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }

    exhaustiveGuard(this.#selectedBattleStyleOption);
  }

  /**
   *
   * @param {'LEFT' | 'RIGHT'} direction
   */
  #updateSoundOption(direction) {
    if (direction === DIRECTION.LEFT && this.#selectedSoundOption === SOUND_OPTIONS.ON) {
      return;
    }
    if (direction === DIRECTION.LEFT) {
      this.#selectedSoundOption = SOUND_OPTIONS.ON;
      return;
    }

    if (direction === DIRECTION.RIGHT && this.#selectedSoundOption === SOUND_OPTIONS.OFF) {
      return;
    }
    if (direction === DIRECTION.RIGHT) {
      this.#selectedSoundOption = SOUND_OPTIONS.OFF;
      return;
    }

    exhaustiveGuard(direction);
  }
  #updateSoundOptionGameObjects() {
    const textGameObjects = /** @type {Phaser.GameObjects.Text[]} */ (this.#soundOptionTextObjects.getChildren());

    textGameObjects.forEach((obj) => {
      obj.setColor(TEXT_FONT_COLORS.NOT_SELECTED);
    });

    if (this.#selectedSoundOption === SOUND_OPTIONS.OFF) {
      textGameObjects[1].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }

    if (this.#selectedSoundOption === SOUND_OPTIONS.ON) {
      textGameObjects[0].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }

    exhaustiveGuard(this.#selectedSoundOption);
  }

  /**
   *
   * @param {'LEFT' | 'RIGHT'} direction
   */
  #updateVolumeOption(direction) {
    if (direction === DIRECTION.LEFT && this.#selectedVolumeOption === 0) {
      return;
    }
    if (direction === DIRECTION.LEFT) {
      this.#selectedVolumeOption = /** @type {import('../common/options.js').VolumeMenuOptions} */ (
        this.#selectedVolumeOption - 1
      );
      return;
    }

    if (direction === DIRECTION.RIGHT && this.#selectedVolumeOption === 4) {
      return;
    }
    if (direction === DIRECTION.RIGHT) {
      this.#selectedVolumeOption = /** @type {import('../common/options.js').VolumeMenuOptions} */ (
        this.#selectedVolumeOption + 1
      );
      return;
    }
  }
  #updateVolumeSlider() {
    switch (this.#selectedVolumeOption) {
      case 0:
        this.#volumeOptionMenuCursor.setX(650).setY(380).setRotation(.15);
        this.#volumeOptionsValueText.setText('0%');
        break;
      case 1:
        this.#volumeOptionMenuCursor.setX(710).setY(388).setRotation(.1);
        this.#volumeOptionsValueText.setText('25%');
        break;
      case 2:
        this.#volumeOptionMenuCursor.setX(760).setY(393).setRotation(.1);
        this.#volumeOptionsValueText.setText('50%');
        break;
      case 3:
        this.#volumeOptionMenuCursor.setX(830).setY(400).setRotation(.1);
        this.#volumeOptionsValueText.setText('75%');
        break;
      case 4:
        this.#volumeOptionMenuCursor.setX(890).setY(407).setRotation(.1);
        this.#volumeOptionsValueText.setText('100%');
        break;
      default:
        exhaustiveGuard(this.#selectedVolumeOption);
    }
  }

  /**
   *
   * @param {'LEFT' | 'RIGHT'} direction
   */
  #updateMenuColorOption(direction) {
    if (direction === DIRECTION.LEFT && this.#selectedMenuColorOption === 0) {
      this.#selectedMenuColorOption = 2;
      return;
    }
    if (direction === DIRECTION.RIGHT && this.#selectedMenuColorOption === 2) {
      this.#selectedMenuColorOption = 0;
      return;
    }
    if (direction === DIRECTION.LEFT) {
      this.#selectedMenuColorOption -= 1;
      return;
    }
    if (direction === DIRECTION.RIGHT) {
      this.#selectedMenuColorOption += 1;
      return;
    }
    exhaustiveGuard(direction);
  }
  #updateMenuColorDisplayText() {
    switch (this.#selectedMenuColorOption) {
      case 0:
        this.#selectedMenuColorTextGameObject.setText('1').setX(760).setY(437).setRotation(.1);
        this.#background = this.add.image(0, 0, BACKGROUND.BROWN).setOrigin(0).setDepth(-10);
        break;
      case 1:
        this.#selectedMenuColorTextGameObject.setText('2').setX(760).setY(437).setRotation(.1);
        this.#background = this.add.image(0, 0, BACKGROUND.BLACK).setOrigin(0).setDepth(-10).setScale(1.5, 1.03);
        break;
      case 2:
        this.#selectedMenuColorTextGameObject.setText('3').setX(760).setY(437).setRotation(.1);
        this.#background = this.add.image(0, 0, BACKGROUND.BLUE).setOrigin(0).setDepth(-10).setScale(1.5, 1.03);
        break;
      default:
        exhaustiveGuard(this.#selectedMenuColorOption);
    }
  }
}
