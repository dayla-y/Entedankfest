import { animateText, CANNOT_READ_SIGN_TEXT } from "../utils/text-utils.js";
import { KENNEYS_FONT } from '../assets/font-keys.js';
import { UI_ASSET_KEYS } from "../assets/asset-keys.js";
import { dataManager } from "../utils/data-manager.js";

/** @type {Phaser.Types.GameObjects.Text.TextStyle} */
const UI_TEXT_STYLE = Object.freeze({
    fontFamily: KENNEYS_FONT,
    color: '0x2a2527',
    fontSize: '20px',
    wordWrap: { width: 0 },
});

export class DialogUi {
    /** @type {Phaser.Scene} */
    #scene;
    /** @type {number} */
    #padding;
    /** @type {number} */
    #width;
    /** @type {number} */
    #height;
    /** @type {Phaser.GameObjects.Container} */
    #container;
    /** @type {boolean} */
    #isVisible;
    /** @type {Phaser.GameObjects.Image} */
    #userInputCursor;
    /** @type {Phaser.Tweens.Tween} */
    #userInputCursorTween;
    /** @type {Phaser.GameObjects.Text} */
    #uiText;
    /** @type {boolean} */
    #textAnimationPlaying;
    /** @type {string[]} */
    #messagesToShow;

    constructor(scene, width) {
        this.#scene = scene;
        this.#padding = 10;
        this.#width = width - this.#padding * 20.35;
        this.#height = 124;
        this.#textAnimationPlaying = false;
        this.#messagesToShow = [];
    
        // Crear el fondo del cuadro de diálogo usando una imagen
        const dialogBg = this.#scene.add.image(0, 0, UI_ASSET_KEYS.DIALOG)
            .setOrigin(0, .1)
            .setScale(.75, .6); 
    
        const dialogBgWidth = dialogBg.width * dialogBg.scaleX; // Calcula el ancho ajustado
    
        // Crear el texto para el cuadro de diálogo
        this.#uiText = this.#scene.add.text(
            dialogBg.displayWidth / 2, // Centro horizontal del fondo
            50, // Ajusta según la altura
            CANNOT_READ_SIGN_TEXT, 
            {
                ...UI_TEXT_STYLE,
                ...{ wordWrap: { width: dialogBg.displayWidth - 50 }, align: 'center' },
            }
        ).setOrigin(0.5); // Centrar el texto completamente
    
        // Añadir fondo y texto al contenedor
        this.#container = this.#scene.add.container(0, 0, [dialogBg, this.#uiText]);
    
        this.#createPlayerInputCursor();
        this.hideDialogModal();
    }
    

    /** @type {boolean} */
    get isVisible() {
        return this.#isVisible;
    }
    /** @type {boolean} */
    get isAnimationPlaying() {
        return this.#textAnimationPlaying;
    }

    /** @type {boolean} */
    get moreMessagesToShow() {
        return this.#messagesToShow.length > 0;
    }

    /**
     * @param {string[]} messages
     * @returns {void}
     */
    showDialogModal(messages) {
        this.#container.setDepth(10000);
        this.#messagesToShow = [...messages];

        const { x, bottom } = this.#scene.cameras.main.worldView;
        const startX = x + this.#padding;
        const startY = bottom - this.#height - this.#padding / 4;

        this.#container.setPosition(startX, startY);
        this.#userInputCursorTween.restart();
        this.#container.setAlpha(1);
        this.#isVisible = true;

        this.showNextMessage();
    }

    /**
     * @returns {void}
     */
    showNextMessage() {
        if (this.#messagesToShow.length === 0) {
        return;
        }

        this.#uiText.setText('').setAlpha(1);
        animateText(this.#scene, this.#uiText, this.#messagesToShow.shift(), {
        delay: dataManager.getAnimatedTextSpeed(),
        callback: () => {
            this.#textAnimationPlaying = false;
        },
        });
        this.#textAnimationPlaying = true;
    }
    /**
     * @returns {void}
     */

    hideDialogModal() {
        this.#container.setAlpha(0);
        this.#isVisible = false;
    }

    /**
     * @returns {void}
     */
    #createPlayerInputCursor() {
        const y = this.#height - 90;
        this.#userInputCursor = this.#scene.add.image(this.#width - 45, y, UI_ASSET_KEYS.CURSOR_DOWN);
        this.#userInputCursor.setScale(2, 2);

        this.#userInputCursorTween = this.#scene.add.tween({
            delay: 0,
            duration: 500,
            repeat: -1,
            y: {
                from: y,
                start: y,
                to: y + 6,
            },
            targets: this.#userInputCursor,
        });
        this.#userInputCursorTween.pause();
        this.#container.add(this.#userInputCursor);
    }
}
