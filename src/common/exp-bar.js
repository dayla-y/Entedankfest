import Phaser from "phaser";
import { EXP_BAR_ASSET_KEYS, HEALTH_BAR_ASSET_KEYS } from "../assets/asset-keys.js";
import { AnimatedBar } from "./animated-bar.js";

export class ExpBar extends AnimatedBar{
    /**
   * @param {Phaser.Scene} scene the Phaser 3 Scene the exp bar will be added to
   * @param {number} x the x position to place the exp bar container
   * @param {number} y the y position to place the exp bar container
   * @param {number} [width = 360]
   * @param {number} [scaleY = .7]
   */
  constructor(scene, x, y, width = 300, scaleY = .9) {
    super({
        scene,
        x,
        y,
        width,
        scaleY,
        leftCapAssetKey: EXP_BAR_ASSET_KEYS.EXP_LEFT_CAP,
        leftCapShadowAssetKey: HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW,
        middleCapAssetKey: EXP_BAR_ASSET_KEYS.EXP_MIDDLE,
        middleCapShadowAssetKey: HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW,
        rightCapAssetKey: EXP_BAR_ASSET_KEYS.EXP_RIGHT_CAP,
        rightShadowAssetKey: HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW,
  });
}
}