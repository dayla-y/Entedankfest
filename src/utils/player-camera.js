export class PlayerCamera {
    constructor(scene, target) {
        this.scene = scene; // Escena de Phaser
        this.target = target; // El jugador u objeto que la cámara debe seguir
        this.camera = scene.cameras.main;

        // Posiciones actuales de la cámara
        this.currentX = this.target.x;
        this.currentY = this.target.y;

        // Límite de la cámara
        this.leftLimit = 0;
        this.rightLimit = 9999;
        this.topLimit = 0;
        this.bottomLimit = 9999;

        // Factor de interpolación (ajustar para controlar la suavidad)
        this.lerpFactor = 0.05;
    }

    setRoomLimits(limits) {
        this.leftLimit = limits[0];
        this.rightLimit = limits[1];
        this.topLimit = limits[2];
        this.bottomLimit = limits[3];
    }

    update() {
        // Interpolación de la posición de la cámara hacia el jugador
        this.currentX = lerp(this.currentX, this.target.x, this.lerpFactor);
        this.currentY = lerp(this.currentY, this.target.y, this.lerpFactor);

        // Asegúrate de que la cámara se quede dentro de los límites definidos
        this.currentX = Phaser.Math.Clamp(this.currentX, this.leftLimit, this.rightLimit);
        this.currentY = Phaser.Math.Clamp(this.currentY, this.topLimit, this.bottomLimit);

        // Actualiza la posición de la cámara
        this.camera.setScroll(this.currentX - this.camera.width / 2, this.currentY - this.camera.height / 2);
    }
}

// Función de interpolación lineal (lerp)
function lerp(start, end, factor) {
    return start + (end - start) * factor;
}
