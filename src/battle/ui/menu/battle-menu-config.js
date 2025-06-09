import Phaser from 'phaser';
import { CUTIVE_REGULAR, KENNEYS_FONT } from '../../../assets/font-keys';

/** @type {Phaser.Types.GameObjects.Text.TextStyle} */
export const BATTLE_UI_TEXT_STYLE = Object.freeze({
    fontFamily: KENNEYS_FONT,
    color: 'black',
    fontSize: '30px',
});