import { exhaustiveGuard } from "../../utils/guard.js";
import { Attack_KEYS } from "./attack-keys.js";
import { Dark_Spell } from "./dark-spell.js";
import { Flame_Slash_Attack } from "./flame-slash.js";
import { Lafire } from "./lafire.js";
import { Green_Slash_Attack } from "./slash-green.js";
import { Purple_Slash } from "./slash-purple.js";

/**
 * @typedef {keyof typeof ATTACK_TARGET} AttackTarget
 */

/** @enum {AttackTarget} */
export const ATTACK_TARGET = Object.freeze({
    PLAYER: 'PLAYER',
    ENEMY: 'ENEMY',
  });
  
  export class AttackManager {
    /** @type {Phaser.Scene} */
    #scene;
    /** @type {boolean} */
    #skipBattleAnimations;
    /** @type {Lafire} */
    #iceShardAttack;
    /** @type {Purple_Slash} */
    #slashAttack;
    /** @type {Dark_Spell} */
    #darkSpell
    /** @type {Flame_Slash_Attack} */
    #fireSlashAttack
    /** @type {Green_Slash_Attack} */
    #slashGreenAttack

    /**
     *
     * @param {Phaser.Scene} scene
     * @param {boolean} skipBattleAnimations
     */
    constructor(scene, skipBattleAnimations) {
      this.#scene = scene;
      this.#skipBattleAnimations = skipBattleAnimations;
    }
  
    /**
     *
     * @param {import('./attack-keys').AttackKeys} attack
     * @param {AttackTarget} target
     * @param {() => void} callback
     * @returns {void}
     */
    playAttackAnimation(attack, target, callback) {
      if (this.#skipBattleAnimations) {
        callback();
        return;
      }
  
      // if attack target is enemy
      let x = 740;
      let y = 140;
      let scale = 1;
      if (target === ATTACK_TARGET.PLAYER) {
        x = 226;
        y = 300;
        scale = 2;
      }
  
      switch (attack) {
        case Attack_KEYS.LAFIRE:
          if (!this.#iceShardAttack) {
            this.#iceShardAttack = new Lafire(this.#scene, { x, y });
          }
          this.#iceShardAttack.gameObject.setPosition(x, y).setScale(scale);
          this.#iceShardAttack.playAnimation(callback);
          break;


        case Attack_KEYS.SLASH_PURPLE:
          if (!this.#slashAttack) {
            this.#slashAttack = new Purple_Slash(this.#scene, { x, y });
          }
          this.#slashAttack.gameObject.setPosition(x, y).setScale(scale);
          this.#slashAttack.playAnimation(callback);
          break;


          case Attack_KEYS.DARK_SPELL:
          if (!this.#darkSpell) {
            this.#darkSpell = new Dark_Spell(this.#scene, { x, y });
          }
          this.#darkSpell.gameObject.setPosition(x, y).setScale(scale);
          this.#darkSpell.playAnimation(callback);
          break;


          case Attack_KEYS.FLAME_SLASH:
          if (!this.#fireSlashAttack) {
            this.#fireSlashAttack = new Flame_Slash_Attack(this.#scene, { x, y });
          }
          this.#fireSlashAttack.gameObject.setPosition(x, y).setScale(scale);
          this.#fireSlashAttack.playAnimation(callback);
          break;


          case Attack_KEYS.GREEN_SLASH:
          if (!this.#slashGreenAttack) {
            this.#slashGreenAttack = new Green_Slash_Attack(this.#scene, { x, y });
          }
          this.#slashGreenAttack.gameObject.setPosition(x, y).setScale(scale);
          this.#slashGreenAttack.playAnimation(callback);
          break;

        default:
          exhaustiveGuard(attack);
      }
    }
  }
  