import { DIRECTION } from "../../../common/direction.js";
import { exhaustiveGuard } from "../../../utils/guard.js";
import { BATTLE_MENU_CURSOR_POS } from "./battle-menu-constants.js";
import { BATTLE_MENU_OPTIONS, ATTACK_MOVE_OPTIONS, ACTIVE_BATTLE_MENU } from "./battle-menu-options.js";

export class BattleMenuHelper {
    /** @type {Phaser.Scene}*/
    #scene;
    /** @type {import("./battle-menu-options.js").BattleMenuOptions}*/
    #selectedBattleMenuOption;
    /** @type {import("./battle-menu-options.js").AttackMoveOptions}*/
    #selectedAttackMenuOption;
    /** @type {import("./battle-menu-options.js").ActiveBattleMenu}*/
    #activeBattleMenu;
    /** @type {Phaser.GameObjects.Image}*/
    #mainBattleMenuCursorPhaserImageGameObject;

    /**
     * 
     * @param {Phaser.Scene} scene that Phaser 3 Scene
     */
    constructor(scene) {
        this.#scene = scene;
        this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
        this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1;
        this.#activeBattleMenu = null; // Inicializar con un valor por defecto.
        this.#mainBattleMenuCursorPhaserImageGameObject = scene?.add?.image(0, 0, 'cursor') || null; // Ejemplo de inicialización.
    }

    /**
     * Actualiza la opción seleccionada en el menú de movimientos.
     * @param {import("../../../common/direction.js").Direction} direction 
     */
    updateSelectedOptionForupdateSelectedBattleMenuOptionFromInput(direction) {
        this.#updateSelectedBattleMenuOptionFromInput(direction);
    }

    /**
     * Actualiza la opción seleccionada en el menú de batalla.
     * @param {import("../../../common/direction.js").Direction} direction 
     */
    #updateSelectedBattleMenuOptionFromInput(direction){
        if(this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FIGHT){
            switch(direction){
                case DIRECTION.RIGHT:
                    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SWITCH;
                    return;
                case DIRECTION.DOWN:
                    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.ITEM;
                    return;
                case DIRECTION.LEFT:
                case DIRECTION.UP:
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }
        if(this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.SWITCH){
            switch(direction){
                case DIRECTION.LEFT:
                    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
                    return;
                case DIRECTION.DOWN:
                    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FLEE;
                    return;
                case DIRECTION.RIGHT:
                case DIRECTION.UP:
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }

        if(this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.ITEM){
            switch(direction){
                case DIRECTION.RIGHT:
                    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FLEE;
                    return;
                case DIRECTION.UP:
                    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
                    return;
                case DIRECTION.LEFT:
                case DIRECTION.DOWN:
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }

        if(this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FLEE){
            switch(direction){
                case DIRECTION.LEFT:
                    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.ITEM;
                    return;
                case DIRECTION.UP:
                    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SWITCH;
                    return;
                case DIRECTION.RIGHT:
                case DIRECTION.DOWN:
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }
        exhaustiveGuard(this.#selectedBattleMenuOption);
      }

    

    moveMainBattleMenuCursor(selectedBattleMenuOption) {
        switch(this.#selectedBattleMenuOption){
            case BATTLE_MENU_OPTIONS.FIGHT:
                this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(BATTLE_MENU_CURSOR_POS.x, BATTLE_MENU_CURSOR_POS.y);
                return;
            case BATTLE_MENU_OPTIONS.SWITCH:
                this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(228, BATTLE_MENU_CURSOR_POS.y);
                return;
            case BATTLE_MENU_OPTIONS.ITEM:
                this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(BATTLE_MENU_CURSOR_POS.x, 86);
                return;
            case BATTLE_MENU_OPTIONS.FLEE:
                this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(228, 86);
                return;
            default:
                exhaustiveGuard(this.#selectedBattleMenuOption);
        }
    }
    
    

    /**
     * Actualiza la opción seleccionada en el menú de movimientos.
     * @param {import("../../../common/direction.js").Direction} direction 
     */
    updateSelectedOptionForupdateSelectedMoveMenuOptionFromInput(direction) {
        this.#updateSelectedMoveMenuOptionFromInput(direction);
    }

    /**
     * Actualiza la opción seleccionada en el menú de movimientos.
     * @param {import("../../../common/direction.js").Direction} direction 
     */
    #updateSelectedMoveMenuOptionFromInput(direction) {
        if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT){
            return;
        }
        if(this.#selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_1){
            switch(direction){
                case DIRECTION.RIGHT:
                    this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_2;
                    return;
                case DIRECTION.DOWN:
                    this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_3;
                    return;
                case DIRECTION.LEFT:
                case DIRECTION.UP:
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        }
        
        if(this.#selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_2){
            switch(direction){
                case DIRECTION.LEFT:
                    this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1;
                    return;
                case DIRECTION.DOWN:
                    this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_4;
                    return;
                case DIRECTION.RIGHT:
                case DIRECTION.UP:
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        } 
        
        if(this.#selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_3){
            switch(direction){
                case DIRECTION.RIGHT:
                    this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_4;
                    return;
                case DIRECTION.UP:
                    this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1;
                    return;
                case DIRECTION.LEFT:
                case DIRECTION.DOWN:
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        } 
        
        if(this.#selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_4){
            switch(direction){
                case DIRECTION.LEFT:
                    this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_3;
                    return;
                case DIRECTION.UP:
                    this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_2;
                    return;
                case DIRECTION.RIGHT:
                case DIRECTION.DOWN:
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
            return;
        } 
        exhaustiveGuard(this.#selectedAttackMenuOption);
    }
}
