import Phaser from "phaser";
import { HEALTH_BAR_ASSET_KEYS } from "../assets/asset-keys.js";
import { AnimatedBar } from "./animated-bar.js";

export class HealthBar extends AnimatedBar{
    /**
   * @param {Phaser.Scene} scene the Phaser 3 Scene the health bar will be added to
   * @param {number} x the x position to place the health bar container
   * @param {number} y the y position to place the health bar container
   */
  constructor(scene, x, y, width = 360) {
    super({
        scene,
        x,
        y,
        width,
        scaleY: 1.3,
        leftCapAssetKey: HEALTH_BAR_ASSET_KEYS.LEFT_CAP,
        leftCapShadowAssetKey: HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW,
        middleCapAssetKey: HEALTH_BAR_ASSET_KEYS.MIDDLE,
        middleCapShadowAssetKey: HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW,
        rightCapAssetKey: HEALTH_BAR_ASSET_KEYS.RIGHT_CAP,
        rightShadowAssetKey: HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW,
  });
}
}