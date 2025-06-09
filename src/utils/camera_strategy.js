export class PlayerCameraStrategy {
    constructor(target, scene) {
      this.target = target; // El jugador al que sigue la cámara
      this.scene = scene;
      
      // Inicializamos las variables
      this.pinnedX = target.x;
      this.pinnedY = target.y;
      
      this.leftLimit = 0;
      this.rightLimit = 9999;
      this.topLimit = 0;
      this.bottomLimit = 9999;
    }
    
    // Método para ajustar la posición Y de la cámara con el mapa (similar a compensateForMapHeight en Excalibur)
    compensateForMapHeight(n) {
      return n + 7.5 * 64; // SCALED_CELL es equivalente a 64 en este caso
    }
  
    // Cuando cambiamos la posición Y fijada
    onPinChange(newY) {
      this.pinnedY = this.compensateForMapHeight(newY);
    }
    
    // Establecemos los límites de la habitación o mapa
    setRoomLimits(incomingLimits) {
      this.leftLimit = incomingLimits[0];
      this.rightLimit = incomingLimits[1];
      this.topLimit = incomingLimits[2];
      this.bottomLimit = incomingLimits[3];
    }
    
    // Acción de la cámara que actualiza su posición
    action() {
      // Lerp para suavizar la transición de la cámara
      this.pinnedX = lerp(this.pinnedX, this.target.x, 0.05);
      this.pinnedY = lerp(this.pinnedY, this.target.y, 0.05);
  
      // Limitar el movimiento de la cámara dentro de los límites
      let cameraX = this.pinnedX;
      let cameraY = this.pinnedY;
  
      if (cameraX < this.leftLimit) {
        cameraX = this.leftLimit;
      }
      if (cameraX > this.rightLimit) {
        cameraX = this.rightLimit;
      }
      if (cameraY < this.topLimit) {
        cameraY = this.topLimit;
      }
      if (cameraY > this.bottomLimit) {
        cameraY = this.bottomLimit;
      }
  
      // Establecer la posición de la cámara
      this.scene.cameras.main.setScroll(cameraX - this.scene.cameras.main.width / 2, cameraY - this.scene.cameras.main.height / 2);
      this.scene.cameras.main.setZoom(1.2);
    }
  }
  
  // Función Lerp para interpolación
  function lerp(currentValue, destinationValue, time) {
    return currentValue * (1 - time) + destinationValue * time;
  }