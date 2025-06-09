import Phaser from 'phaser';
import {
  AUDIO_ASSET_KEY,
  BATTLE_ASSET_KEYS,
  BATTLE_BACKGROUND_ASSET_KEYS,
  BATTLE_CHARACTHER_ASSET_KEYS,
} from '../assets/asset-keys.js';
import { Background } from '../battle/background.js';
import { BattleMenu } from '../battle/ui/menu/battle-menu.js';
import { DIRECTION } from '../common/direction.js';
import { SCENE_KEYS } from './scene-keys.js';
import { EnemyBattleIngredient } from '../battle/ingredients/enemy-battle-ingredient.js';
import { PlayerBattleIngredient } from '../battle/ingredients/player-battle-ingredient.js';
import { StateMachine } from '../utils/state-machine.js';
import { AttackManager } from '../battle/attacks/attack-manager.js';
import { ATTACK_TARGET } from '../battle/attacks/attack-keys.js';
import { createSceneTransition } from '../utils/scene-transition.js';
import { DATA_MANAGER_STORE_KEYS, dataManager } from '../utils/data-manager.js';
import { BATTLE_SCENE_OPTIONS } from '../common/options.js';
import { BaseScene } from './base-scene.js';
import { DataUtils } from '../utils/data-utils.js';
import { playBackgroundMusic, playSoundFx } from '../types/audio-utils.js';
import { calculatedRateGained, handleIngredientGainingRate } from '../utils/rate-utils.js';


const BATTLE_STATES = Object.freeze({
  INTRO: "INTRO",
  PRE_BATTLE_INFO: "PRE_BATTLE_INFO",
  BRING_OUT_INGREDIENT: "BRING_OUT_INGREDIENT",
  PLAYER_INPUT: "PLAYER_INPUT",
  ENEMY_INPUT: "ENEMY_INPUT",
  BATTLE: "BATTLE",
  POST_ATTACK_CHECK: "POST_ATTACK_CHECK",
  FINISHED: "FINISHED",
  FLEE_ATTEMPT: "FLEE_ATTEMPT",
  GAIN_EXPERIENCE: "GAIN_EXPERIENCE",
  SWITCH_INGREDIENT: "SWITCH_INGREDIENT",
});

/**
 * @typedef BattleSceneWasResumedData
 * @type {object}
 * @property {boolean} wasIngredientSelected
 * @property {number} [selectedIngredientIndex]
 * @property {boolean} itemUsed
 * @property {import("../types/typedef.js").Item} [item]
 */

/**
 * @typedef BattleSceneData
 * @type {object}
 * @property {import('../types/typedef.js').Ingredient[]} playerIngredient
 * @property {import('../types/typedef.js').Ingredient[]} enemyIngredient
 */

export class BattleScene extends BaseScene {
  /** @type {BattleMenu} */
  #battleMenu;
  /** @type {EnemyBattleIngredient} */
  #activeEnemyIngredient;
  /** @type {PlayerBattleIngredient} */
  #activePlayerIngredient;
  /** @type {number} */
  #activePlayerAttackIndex;
  /** @type {StateMachine} */
  #battleStateMachine;
  /** @type {AttackManager} */
  #attackManager;
  /** @type {boolean} */
  #skipAnimations;
  /** @type {number} */
  #activeEnemyAttackIndex;
  /** @type {BattleSceneData} */
  #sceneData;
  /** @type {number} */
  #activeIngredientIndex;
  /** @type {boolean} */
  #playerKnockedOut;
  /** @type {boolean} */
  #switchingActiveIngredient;
  /** @type {boolean} */
  #activeIngredientKnockedOut;
  /** @type {Phaser.GameObjects.Container} */
  #availableIngredientsUiContainer;

  constructor() {
    super({
      key: SCENE_KEYS.BATTLE_SCENE,
    });
  }

  /**
   * @param {BattleSceneData} data
   * @returns {void}
   */
  init(data) {
    super.init(data);
    this.#sceneData = data;

    // added for testing from preload scene
    if (Object.keys(data).length === 0) {
      this.#sceneData = {
        enemyIngredient: [DataUtils.getIngredientById(this, 2)],
        playerIngredient: [
          dataManager.store.get(DATA_MANAGER_STORE_KEYS.INGREDIENTS_IN_BAG)[0],
          dataManager.store.get(DATA_MANAGER_STORE_KEYS.INGREDIENTS_IN_BAG)[1],
          dataManager.store.get(DATA_MANAGER_STORE_KEYS.INGREDIENTS_IN_BAG)[2],
        ],
      };
    }

    this.#activePlayerAttackIndex = -1;
    this.#activeEnemyAttackIndex = -1;
    this.#activeIngredientIndex = 0;


    /** @type {import('../common/options.js').BattleSceneMenuOptions | undefined} */
    const chosenBattleSceneOption = dataManager.store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS);
    if (chosenBattleSceneOption === undefined || chosenBattleSceneOption === BATTLE_SCENE_OPTIONS.ON) {
      this.#skipAnimations = false;
      return;
    }
    this.#skipAnimations = true;
    this.#playerKnockedOut = false;
    this.#switchingActiveIngredient = false;
    this.#activeIngredientKnockedOut = false;
  }

  /**
   * @returns {void}
   */
  create() {
    super.create();

    // create main background
    const background = new Background(this);
    background.showForest();

    // create the player and enemy Ingredients
    this.#activeEnemyIngredient = new EnemyBattleIngredient({
      scene: this,
      ingredientDetails: this.#sceneData.enemyIngredient[0],
      skipBattleAnimations: this.#skipAnimations,
    });
    const eligibleIngredientIndex = this.#sceneData.playerIngredient.findIndex((ingredient) => ingredient.currentHp > 0);
    this.#activeIngredientIndex = eligibleIngredientIndex;
    this.#activePlayerIngredient = new PlayerBattleIngredient({
      scene: this,
      ingredientDetails: this.#sceneData.playerIngredient[this.#activeIngredientIndex],
      skipBattleAnimations: this.#skipAnimations,
    });

    // render out the main info and sub info panes
    this.#battleMenu = new BattleMenu(this, this.#activePlayerIngredient, this.#skipAnimations);
    this.#createBattleStateMachine();
    this.#attackManager = new AttackManager(this, this.#skipAnimations);
    this.#createAvailableIngredientsUi();

    this._controls.lockInput = true;

    // add audio
    playBackgroundMusic(this, AUDIO_ASSET_KEY.BATTLE);
  }

  /**
   * @returns {void}
   */
  update() {
    super.update();

    this.#battleStateMachine.update();

    if (this._controls.isInputLocked) {
      return;
    }

    const wasSpaceKeyPressed = this._controls.wasSpaceKeyPressed();
    // limit input based on the current battle state we are in
    // if we are not in the right battle state, return early and do not process input
    if (
      wasSpaceKeyPressed &&
      (this.#battleStateMachine.currentStateName === BATTLE_STATES.PRE_BATTLE_INFO ||
        this.#battleStateMachine.currentStateName === BATTLE_STATES.POST_ATTACK_CHECK ||
        this.#battleStateMachine.currentStateName === BATTLE_STATES.GAIN_EXPERIENCE ||
        this.#battleStateMachine.currentStateName === BATTLE_STATES.SWITCH_INGREDIENT ||
        this.#battleStateMachine.currentStateName === BATTLE_STATES.FLEE_ATTEMPT)
    ) {
      this.#battleMenu.handlePlayerInput('OK');
      return;
    }
    if (this.#battleStateMachine.currentStateName !== BATTLE_STATES.PLAYER_INPUT) {
      return;
    }

    if (wasSpaceKeyPressed) {
      this.#battleMenu.handlePlayerInput('OK');

      // check if the player used an item
      if (this.#battleMenu.wasItemUsed) {
        this.#battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT);
        return;
      }

      // check if the player attempted to flee
      if (this.#battleMenu.isAttemptingToFlee) {
        this.#battleStateMachine.setState(BATTLE_STATES.FLEE_ATTEMPT);
        return;
      }

      // check if the player attempted to flee
      if (this.#battleMenu.isAttemptingToSwitchIngredients) {
        this.#battleStateMachine.setState(BATTLE_STATES.SWITCH_INGREDIENT);
        return;
      }

      // check if the player selected an attack, and start battle sequence for the fight
      if (this.#battleMenu.selectedAttack === undefined) {
        return;
      }
      this.#activePlayerAttackIndex = this.#battleMenu.selectedAttack;

      if (!this.#activePlayerIngredient.attacks[this.#activePlayerAttackIndex]) {
        return;
      }

      console.log(
        `Player selected the following move: ${this.#activePlayerIngredient.attacks[this.#activePlayerAttackIndex].name}`
      );
      this.#battleMenu.hideIngredientAttackSubMenu();
      this.#battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT);
      return;
    }

    if (this._controls.wasBackKeyPressed()) {
      this.#battleMenu.handlePlayerInput('CANCEL');
      return;
    }

    const selectedDirection = this._controls.getDirectionKeyJustPressed();
    if (selectedDirection !== DIRECTION.NONE) {
      this.#battleMenu.handlePlayerInput(selectedDirection);
    }
  }

  /**
   * @param {() => void} callback
   * @returns {void}
   */
  #playerAttack(callback) {
    if (this.#activePlayerIngredient.isFainted) {
      callback();
      return;
    }

    this.#battleMenu.updateInfoPaneMessageNoInputRequired(
      `${this.#activePlayerIngredient.name} used ${this.#activePlayerIngredient.attacks[this.#activePlayerAttackIndex].name}`,
      () => {
        // play attack animation based on the selected attack
        // when attack is finished, play damage animation and then update health bar
        this.time.delayedCall(500, () => {
          this.time.delayedCall(100, () => {
            playSoundFx(this, this.#activePlayerIngredient.attacks[this.#activePlayerAttackIndex].audioKey);
          });
          this.#attackManager.playAttackAnimation(
            this.#activePlayerIngredient.attacks[this.#activePlayerAttackIndex].animationName,
            ATTACK_TARGET.ENEMY,
            () => {
              this.#activeEnemyIngredient.playTakeDamageAnimation(() => {
                this.#activeEnemyIngredient.takeDamage(this.#activePlayerIngredient.baseAttack, () => {
                  callback();
                });
              });
            }
          );
        });
      }
    );
  }

  /**
   * @param {() => void} callback
   * @returns {void}
   */
  #enemyAttack(callback) {
    if (this.#activeEnemyIngredient.isFainted) {
      callback();
      return;
    }

    this.#battleMenu.updateInfoPaneMessageNoInputRequired(
      `foe ${this.#activeEnemyIngredient.name} used ${
        this.#activeEnemyIngredient.attacks[this.#activeEnemyAttackIndex].name
      }`,
      () => {
        // play attack animation based on the selected attack
        // when attack is finished, play damage animation and then update health bar
        this.time.delayedCall(500, () => {
          this.time.delayedCall(100, () => {
            playSoundFx(this, this.#activeEnemyIngredient.attacks[this.#activeEnemyAttackIndex].audioKey);
          });
          this.#attackManager.playAttackAnimation(
            this.#activeEnemyIngredient.attacks[this.#activeEnemyAttackIndex].animationName,
            ATTACK_TARGET.PLAYER,
            () => {
              this.#activePlayerIngredient.playTakeDamageAnimation(() => {
                this.#activePlayerIngredient.takeDamage(this.#activeEnemyIngredient.baseAttack, () => {
                  callback();
                });
              });
            }
          );
        });
      }
    );
  }

  /**
   * @returns {void}
   */
  #postBattleSequenceCheck() {
    // update Ingredient details in scene data and data manager to align with changes from battle
    this.#sceneData.playerIngredient[this.#activeIngredientIndex].currentHp = this.#activePlayerIngredient.currentHp;
    dataManager.store.set(DATA_MANAGER_STORE_KEYS.INGREDIENTS_IN_BAG, this.#sceneData.playerIngredient);

    if (this.#activeEnemyIngredient.isFainted) {
      // play Ingredient fainted animation and wait for animation to finish
      this.#activeEnemyIngredient.playDeathAnimation(() => {
        this.#battleMenu.updateInfoPaneMessageAndWaitforInput(
          [`Wild ${this.#activeEnemyIngredient.name} fainted.`],
          () => {
            this.#battleStateMachine.setState(BATTLE_STATES.GAIN_EXPERIENCE);
          }
        );
      });
      return;
    }

    if (this.#activePlayerIngredient.isFainted) {
      // play Ingredient fainted animation and wait for animation to finish
      this.#activePlayerIngredient.playDeathAnimation(() => {
        /** @type {Phaser.GameObjects.Image} */
        (this.#availableIngredientsUiContainer.getAt(this.#activeIngredientIndex)).setAlpha(0.4);
        const hasOtherActiveIngredients = this.#sceneData.playerIngredient.some((ingredient) => {
          return (
            ingredient.id !== this.#sceneData.playerIngredient[this.#activeIngredientIndex].id &&
            ingredient.currentHp > 0
          );
        });
        if (!hasOtherActiveIngredients) {
          this.#battleMenu.updateInfoPaneMessageAndWaitforInput(
            [`${this.#activePlayerIngredient.name} fainted.`, 'You have no more Ingredients, escaping to safety...'],
            () => {
              this.#playerKnockedOut = true;
              this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
            }
          );
          return;
        }

        this.#battleMenu.updateInfoPaneMessageAndWaitforInput(
          [`${this.#activePlayerIngredient.name} fainted.`, 'Choose another Ingredient to continue the battle'],
          () => {
            this.#activeIngredientKnockedOut = true;
            this.#battleStateMachine.setState(BATTLE_STATES.SWITCH_INGREDIENT);
          }
        );
      });
      return;
    }

    this.#battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
  }

  /**
   * @returns {void}
   */
  #transitionToNextScene() {
    /** @type {import('./world-scene.js').WorldSceneData} */
    const sceneDataToPass = {
      isPlayerKnockedOut: this.#playerKnockedOut,
    };
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SCENE_KEYS.WORLD_SCENE, sceneDataToPass);
    });
  }

  /**
   * @returns {void}
   */
  #createBattleStateMachine() {
    /**
     * General state flow for battle scene
     *
     * scene transition to the battle menu
     * battle states
     * intro -> setup everything that is needed
     * pre-battle -> animations as characters and stuff appears
     * Ingredient info text renders onto the page & wait for player input
     * any key press, and now menu stuff shows up
     * player_turn -> choose what to do, wait for input from player
     * enemy_turn -> random choice,
     * battle_fight -> enemy and player options evaluated, play each attack animation
     * battle_fight_post_check -> see if one of the characters died, repeat
     */

    this.#battleStateMachine = new StateMachine('battle', this);

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.INTRO,
      onEnter: () => {
        // wait for any scene setup and transitions to complete
        createSceneTransition(this, {
          skipSceneTransition: this.#skipAnimations,
          callback: () => {
            this.#battleStateMachine.setState(BATTLE_STATES.PRE_BATTLE_INFO);
          },
        });
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.PRE_BATTLE_INFO,
      onEnter: () => {
        // wait for enemy Ingredient to appear on the screen and notify player about the wild Ingredient
        this.#activeEnemyIngredient.playIngredientAppearAnimation(() => {
          this.#activeEnemyIngredient.playIngredientHealthAppearAnimation(() => {});
          this._controls.lockInput = false;
          this.#battleMenu.updateInfoPaneMessageAndWaitforInput(
            [`wild ${this.#activeEnemyIngredient.name} appeared!`],
            () => {
              // wait for text animation to complete and move to next state
              this.#battleStateMachine.setState(BATTLE_STATES.BRING_OUT_INGREDIENT);
            }
          );
        });
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.BRING_OUT_INGREDIENT,
      onEnter: () => {
        // wait for player Ingredient to appear on the screen and notify the player about Ingredient
        this.#activePlayerIngredient.playIngredientAppearAnimation(() => {
          this.#activePlayerIngredient.playIngredientHealthAppearAnimation(() => {
            this.#availableIngredientsUiContainer.setAlpha(1);
          });
          this.#battleMenu.updateInfoPaneMessageNoInputRequired(`go ${this.#activePlayerIngredient.name}!`, () => {
            // wait for text animation to complete and move to next state
            this.time.delayedCall(1200, () => {
              if (this.#switchingActiveIngredient && !this.#activeIngredientKnockedOut) {
                this.#battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT);
                return;
              }
              this.#switchingActiveIngredient = false;
              this.#activeIngredientKnockedOut = false;
              this.#battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
            });
          });
        });
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.PLAYER_INPUT,
      onEnter: () => {
        this.#battleMenu.showMainBattleMenu();
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.ENEMY_INPUT,
      onEnter: () => {
        // pick a random move for the enemy Ingredient, and in the future implement some type of AI behavior
        this.#activeEnemyAttackIndex = this.#activeEnemyIngredient.pickRandomMove();
        this.#battleStateMachine.setState(BATTLE_STATES.BATTLE);
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.BATTLE,
      onEnter: () => {
        // general battle flow
        // show attack used, brief pause
        // then play attack animation, brief pause
        // then play damage animation, brief pause
        // then play health bar animation, brief pause
        // then repeat the steps above for the other Ingredient

        // if item was used, only have enemy attack
        if (this.#battleMenu.wasItemUsed) {
          this.#activePlayerIngredient.updateIngredientHealth(
            /** @type {import('../types/typedef.js').Ingredient[]} */ (
              dataManager.store.get(DATA_MANAGER_STORE_KEYS.INGREDIENTS_IN_BAG)
            )[this.#activeIngredientIndex].currentHp
          );
          this.time.delayedCall(500, () => {
            this.#enemyAttack(() => {
              this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
            });
          });
          return;
        }

        // if player failed to flee, only have enemy attack
        if (this.#battleMenu.isAttemptingToFlee) {
          this.time.delayedCall(500, () => {
            this.#enemyAttack(() => {
              this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
            });
          });
          return;
        }

        // if player switched active Ingredient, only have enemy attack
        if (this.#switchingActiveIngredient) {
          this.time.delayedCall(500, () => {
            this.#enemyAttack(() => {
              this.#switchingActiveIngredient = false;
              this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
            });
          });
          return;
        }

        const randomNumber = Phaser.Math.Between(0, 1);
        if (randomNumber === 0) {
          this.#playerAttack(() => {
            this.#enemyAttack(() => {
              this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
            });
          });
          return;
        }

        this.#enemyAttack(() => {
          this.#playerAttack(() => {
            this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
          });
        });
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.POST_ATTACK_CHECK,
      onEnter: () => {
        this.#postBattleSequenceCheck();
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.FINISHED,
      onEnter: () => {
        this.#transitionToNextScene();
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.FLEE_ATTEMPT,
      onEnter: () => {
        const randomNumber = Phaser.Math.Between(1, 10);
        if (randomNumber > 5) {
          // player has run away successfully
          this.#battleMenu.updateInfoPaneMessageAndWaitforInput(['You got away safely!'], () => {
            this.time.delayedCall(200, () => {
              playSoundFx(this, AUDIO_ASSET_KEY.FLEE);
              this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
            });
          });
          return;
        }
        // player failed to run away, allow enemy to take their turn
        this.#battleMenu.updateInfoPaneMessageAndWaitforInput(['You failed to run away...'], () => {
          this.time.delayedCall(200, () => {
            this.#battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT);
          });
        });
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.GAIN_EXPERIENCE,
      onEnter: () => {
        // update exp bar based on experience gained, then transition to finished state
        const gainedExpForActiveIngredient = calculatedRateGained(
          this.#activeEnemyIngredient.baseExpValue,
          this.#activeEnemyIngredient.level,
          true
        );
        const gainedExpForInactiveIngredient = calculatedRateGained(
          this.#activeEnemyIngredient.baseExpValue,
          this.#activeEnemyIngredient.level,
          false
        );

        /** @type {string[]} */
        const messages = [];
        let didActiveIngredientLevelUp = false;
        this.#sceneData.playerIngredient.forEach((ingredient, index) => {
          // ensure only Ingredients that are not knocked out gain exp
          if (this.#sceneData.playerIngredient[index].currentHp <= 0) {
            return;
          }

          /** @type {import('../utils/rate-utils.js').StatChanges} */
          let statChanges;
          /** @type {string[]} */
          const ingredientMessages = [];
          if (index === this.#activeIngredientIndex) {
            statChanges = this.#activePlayerIngredient.updateingredientExp(gainedExpForActiveIngredient);
            ingredientMessages.push(
              `${this.#sceneData.playerIngredient[index].name} gained ${gainedExpForActiveIngredient} exp.`
            );
            if (statChanges.level !== 0) {
              didActiveIngredientLevelUp = true;
            }
          } else {
            statChanges = handleIngredientGainingRate(
              this.#sceneData.playerIngredient[index],
              gainedExpForInactiveIngredient
            );
            ingredientMessages.push(
              `${this.#sceneData.playerIngredient[index].name} gained ${gainedExpForInactiveIngredient} exp.`
            );
          }
          if (statChanges !== undefined && statChanges.level !== 0) {
            ingredientMessages.push(
              `${this.#sceneData.playerIngredient[index].name} level increased to ${
                this.#sceneData.playerIngredient[index].currentLevel
              }!`,
              `${this.#sceneData.playerIngredient[index].name} attack increased by ${
                statChanges.attack
              } and health increased by ${statChanges.health}`
            );
          }

          if (index === this.#activeIngredientIndex) {
            messages.unshift(...ingredientMessages);
          } else {
            messages.push(...ingredientMessages);
          }
        });

        this._controls.lockInput = true;
        this.#activePlayerIngredient.updateIngredientExpBar(didActiveIngredientLevelUp, false, () => {
          this.#battleMenu.updateInfoPaneMessageAndWaitforInput(messages, () => {
            this.time.delayedCall(200, () => {
              // update the data manager with latest ingredient data
              dataManager.store.set(DATA_MANAGER_STORE_KEYS.INGREDIENTS_IN_BAG, this.#sceneData.playerIngredient);
              this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
            });
          });
          this._controls.lockInput = false;
        });
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.SWITCH_INGREDIENT,
      onEnter: () => {
        const hasOtherActiveIngredients = this.#sceneData.playerIngredient.some((ingredient) => {
          return (
            ingredient.id !== this.#sceneData.playerIngredient[this.#activeIngredientIndex].id &&
            ingredient.currentHp > 0
          );
        });
        if (!hasOtherActiveIngredients) {
          this.#battleMenu.updateInfoPaneMessageAndWaitforInput(
            ['You have no other Ingredients in your party...'],
            () => {
              this.#battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
            }
          );
          return;
        }

        /** @type {import('./recipe-book-scene.js').RecipeBookSceneData} */
        const sceneDataToPass = {
          previousSceneName: SCENE_KEYS.BATTLE_SCENE,
          activePlayerIngredientInBagIndex: this.#activeIngredientIndex,
          activeIngredientKnockedOut: this.#activeIngredientKnockedOut,
        };
        this.scene.launch(SCENE_KEYS.RECIPE_BOOK_SCENE, sceneDataToPass);
        this.scene.pause(SCENE_KEYS.BATTLE_SCENE);
      },
    });

    // start state machine
    this.#battleStateMachine.setState(BATTLE_STATES.INTRO);
  }

  /**
   * @param {Phaser.Scenes.Systems} sys
   * @param {BattleSceneWasResumedData | undefined} [data]
   * @returns {void}
   */
  handleSceneResume(sys, data) {
    super.handleSceneResume(sys, data);

    if (!data || !data.wasIngredientSelected || data.selectedIngredientIndex === undefined) {
      this.#battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
      return;
    }

    this._controls.lockInput = true;
    this.#switchingActiveIngredient = true;

    this.#activePlayerIngredient.playDeathAnimation(() => {
      this.#activeIngredientIndex = data.selectedIngredientIndex;
      this.#activePlayerIngredient.switchIngredient(this.#sceneData.playerIngredient[data.selectedIngredientIndex]);
      this.#battleMenu.updateIngredientAttackSubMenu();
      this._controls.lockInput = false;
      this.#battleStateMachine.setState(BATTLE_STATES.BRING_OUT_INGREDIENT);
    });
  }

  #createAvailableIngredientsUi() {
    this.#availableIngredientsUiContainer = this.add.container(this.scale.width - 24, 304, []);
    this.#sceneData.playerIngredient.forEach((ingredient, index) => {
      const alpha = ingredient.currentHp > 0 ? 1 : 0.4;
      const ball = this.add
        .image(30 * -index, 0, BATTLE_ASSET_KEYS.POTION_FULL, 0)
        .setScale(0.8)
        .setAlpha(alpha);
      this.#availableIngredientsUiContainer.add(ball);
    });
    this.#availableIngredientsUiContainer.setAlpha(0);
  }
}
