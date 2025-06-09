import Phaser from "phaser";

/**
 * @typedef BattleIngredientConfig 
 * @type {Object}
 * @property {Phaser.Scene} scene the Phaser 3 Scene the battle menu will be added to
 * @property {Ingredient} ingredientDetails the details of the ingredient that is currently in battle
 * @property {number} [scaleHealthBarBackgroundImageByY=1] scales the health bar background vertically by the specified value, defaults to 1
 * @property {boolean} [skipBattleAnimations=false] Used to skip all animation tied to the ingredients during battle
 */

/**
 * @typedef Ingredient
 * @type {Object}
 * @property {number} id The unique identifier for this ingredient
 * @property {number} ingredientId The unique identifier for this ingredient type
 * @property {string} name the name of the ingredient
 * @property {string} assetKey the name of the asset key that should be used for this ingredient
 * @property {number} [assetFrame=0] if the asset key is tied to a spritesheet, this frame will be used, defaults to 0
 * @property {number} currentLevel the current level of this ingredient
 * @property {number} maxHp the max health of this ingredient
 * @property {number} currentHp the max health of this ingredient
 * @property {number} baseAttack the base attack value of this ingredient
 * @property {number[]} attackIds the ids of the attacks this ingredient uses
 * @property {number} currentAttack the current attack value of this ingredient
 * @property {number} baseExp the base exp value of this ingredient
 * @property {number} currentExp the current exp this ingredient has
 */

/**
 * @typedef Coordinate 
 * @type {Object}
 * @property {number} x the position of this coordinate
 * @property {number} y the position of this coordinate
 */

/**
 * @typedef Attack 
 * @type {Object}
 * @property {number} id the unique id of this attack
 * @property {string} name the name of this attack
 * @property {import("../battle/attacks/attack-keys").AttackKeys} animationName the animation key that is tied to this attack, will be used to play the attack animation when attack is used.
 * @property {string} audioKey the unique key of the audio asst taht is cached py phaser, will be passed to the phaser sound manager to play this audio object
*/

/**
 * @typedef Animation
 * @type {object}
 * @property {string} key
 * @property {number[]} [frames]
 * @property {number} frameRate
 * @property {number} repeat
 * @property {number} delay
 * @property {string} assetKey
 */


/**
 * @typedef {keyof typeof ITEM_EFFECT} ItemEffect
 */
/** @enum {ItemEffect} */
export const ITEM_EFFECT = Object.freeze({
    HEAL_30: 'HEAL_30',
});


/**
 * @typedef Item
 * @type {object}
 * @property {number} id
 * @property {string} name
 * @property {ItemEffect} effect
 * @property {string} description
 */

/**
 * @typedef BaseInventoryItem
 * @type {object}
 * @property {object} item
 * @property {number} item.id
 * @property {number} quantity
 */

/**
 * @typedef Inventory
 * @type {BaseInventoryItem[]}
 */

/**
 * @typedef InventoryItem
 * @type {object}
 * @property {Item} item
 * @property {number} quantity
 */


/**
 * @typedef EncounterData
 * @type {Object.<string, number[][]>}
 */


/** NPC Data Types */

/**
 * @typedef {keyof typeof NPC_EVENT_TYPE} NpcEventType
 */
/** @enum {NpcEventType} */
export const NPC_EVENT_TYPE = Object.freeze({
    MESSAGE: 'MESSAGE',
    SCENE_FADE_IN_AND_OUT: 'SCENE_FADE_IN_AND_OUT',
    HEAL: 'HEAL',
    TRADE: 'TRADE',
    ITEM: 'ITEM',
    BATTLE: 'BATTLE',
    FOLLOW: 'FOLLOW',
    ATTACK: 'ATTACK',
});

/**
 * @typedef NpcEventMessage
 * @type {object}
 * @property {'MESSAGE'} type
 * @property {object} data
 * @property {string[]} data.messages
 */

/**
 * @typedef NpcEventSceneFadeInAndOut
 * @type {object}
 * @property {'SCENE_FADE_IN_AND_OUT'} type
 * @property {object} data
 * @property {number} data.fadeInDuration
 * @property {number} data.fadeOutDuration
 * @property {number} data.waitDuration
 */

/**
 * @typedef NpcEventHeal
 * @type {object}
 * @property {'HEAL'} type
 * @property {object} data
 */

/**
 * @typedef NpcEvent
 * @type {NpcEventMessage | NpcEventSceneFadeInAndOut | NpcEventHeal}
 */

/**
 * @typedef NpcDetails
 * @type {object}
 * @property {number} frame
 * @property {NpcEvent[]} events
 */

/**
 * @typedef NpcData
 * @type {Object.<string, NpcDetails>}
 */
