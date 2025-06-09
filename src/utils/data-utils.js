import { DATA_ASSET_KEYS } from "../assets/asset-keys";

export class DataUtils{
    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {number} attackId 
     * @returns {import("../types/typedef").Attack | undefined}
     */
    static getIngredientAttack(scene, attackId){
        /** @type {import("../types/typedef").Attack[]} */
        const data = scene.cache.json.get(DATA_ASSET_KEYS.ATTACKS);
        return data.find((attack) => attack.id === attackId);
    }

    /**
     * Utility function for retrieving the Animation objects from the animantions.json data file
     * @param {Phaser.Scene} scene 
     * @returns {import("../types/typedef").Animation[]}
     */
    static getAnimations(scene){
        const data = scene.cache.json.get(DATA_ASSET_KEYS.ANIMATIONS);
        return data;
    }

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {number} itemId 
     * @returns {import("../types/typedef").Item | undefined}
     */
    static getItem(scene, itemId){
        /** @type {import("../types/typedef").Item[]} */
        const data = scene.cache.json.get(DATA_ASSET_KEYS.ITEMS);
        return data.find((item) => item.id === itemId);
    }
    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {number[]} itemIds
     * @returns {import("../types/typedef").Item[] | undefined}
     */
    static getItems(scene, itemIds){
        /** @type {import("../types/typedef").Item[]} */
        const data = scene.cache.json.get(DATA_ASSET_KEYS.ITEMS);
        return data.filter((item) => {
            return itemIds.some((id)=> id === item.id)
        });
    }

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {number} ingredientId
     * @returns {import("../types/typedef").Ingredient}
     */
    static getIngredientById(scene, ingredientId){
        /** @type {import("../types/typedef").Ingredient[]} */
        const data = scene.cache.json.get(DATA_ASSET_KEYS.INGREDIENTS);
        return data.find((ingredient) => ingredient.id === ingredientId);
    }

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {number} areaId 
     * @returns {number[][]}
     */
    static getEncounterAreaDetails(scene, areaId){
        /** @type {import("../types/typedef").EncounterData} */
        const data = scene.cache.json.get(DATA_ASSET_KEYS.ENCOUNTERS);
        return data[areaId]
    }

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {number} npcId 
     * @returns {import("../types/typedef").NpcDetails}
     */
    static getNpcData(scene, npcId){
        /** @type {import("../types/typedef").NpcDetails} */
        const data = scene.cache.json.get(DATA_ASSET_KEYS.NPCS);
        return data[npcId]
    }
}
