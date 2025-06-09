/**
 * @typedef StatChanges
 * @type {object}
 * @property {number} level
 * @property {number} health
 * @property {number} attack
 */

export function totalPointsNeededForNewRate(level){
  if(level>100){
    return 100 * 3;
  }
  return level ** 3;
}

export function calculateRateBarValue(currentLevel, currentExp) {
    const expNeededForCurrentLevel = totalPointsNeededForNewRate(currentLevel);
    let currentExpForBar = currentExp -expNeededForCurrentLevel;
    if (currentExpForBar < 0){
      currentExpForBar = 0;
    }
    const expForNextLevel = totalPointsNeededForNewRate(currentLevel +1);
    const maxExpForBar = expForNextLevel - expNeededForCurrentLevel;
    return currentExpForBar/maxExpForBar;
  }
  
  export function calculatedRateGained(baseExp, currentLevel, isActiveIngredient) {
    return Math.round(((baseExp *currentLevel)/ 7)* (1/isActiveIngredient ? 1: 2));
  }
  
  /**
   * Calculates the number of experience points the monster needs to gain to reach the
   * next level. Calculation is based off the monsters current level and current exp points.
   *
   * In the game, we have a max level of 100, so if the provided level is at the current
   * max level, we return 0 exp.
   * @param {number} currentLevel the current level of the monster
   * @param {number} currentExp the current exp of the monster
   * @returns {number} the total experience points needed to reach the next level
   */
  export function expNeededForNextLevel(currentLevel, currentExp) {
    if (currentLevel >= 100) {
      return 0;
    }
    return totalPointsNeededForNewRate(currentLevel + 1) - currentExp;
  }
  
  /**
   * 
   * @param {import("../types/typedef").Ingredient} ingredient 
   * @param {number} gainedExp 
   * @returns {StatChanges}
   */
  export function handleIngredientGainingRate(ingredient, gainedExp) {
    const statChanges = {
      level: 0,
      health: 0,
      attack: 0,
    };

    if(ingredient.currentLevel >= 100){
      return statChanges;
    }
    ingredient.currentExp += gainedExp;
    let gainedLevel = false;
    do{
      gainedLevel = false;
      const expRequiredForNextLevel = totalPointsNeededForNewRate(ingredient.currentLevel + 1);
      if(ingredient.currentExp >= expRequiredForNextLevel){
        ingredient.currentLevel += 1;
        const bonusAttack = Phaser.Math.Between(0, 1);
        const bonusHealth = Phaser.Math.Between(0, 3);
        const hpIncrease = 5 * bonusHealth;
        const atkIncrease = 1 + bonusAttack;
        ingredient.maxHp += hpIncrease;
        ingredient.currentAttack += atkIncrease;
        statChanges.level += 1;
        statChanges.health += hpIncrease;
        statChanges.attack += atkIncrease;
        
        gainedLevel = true;
      }
    } while (gainedLevel);
    return statChanges;
  }
  
