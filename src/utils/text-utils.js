import Phaser from "phaser";

/**
 * @typedef AnimateTextConfig
 * @type {object}
 * @property {() => void} [callback]
 * @property {number} [delay=25]
 */

/**
 * 
 * @param {Phaser.Scene} scene The Phaser 3 Scene the time event will be added to
 * @param {Phaser.GameObjects.Text} target The Phaser 3 Game Object tah will be animated 
 * @param {string} text The text to display on the target game object 
 * @param {AnimateTextConfig} config [config]
 * @returns {void}
 */
export function animateText(scene, target, text, config){
    const length = text.length;
    let i = 0;

    scene.time.addEvent({
        callback:() =>{
            target.text += text[i];
            ++i;
            if(i== length -1 && config?.callback){
                config.callback();
            }
        },
        repeat: length - 1,
        delay: config?.delay || 25,
    });
}

export const CANNOT_READ_SIGN_TEXT = 'You cannot read from here.';
export const SAMPLE_TEXT = 'You should hurry up.';