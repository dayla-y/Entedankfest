import { DIRECTION } from '../common/direction.js';
import { TILE_SIZE } from '../config.js';
import { exhaustiveGuard } from './guard.js';

/**
 * @param {import('../types/typedef').Coordinate} currentPosition
 * @param {import('../common/direction').Direction} direction
 * @returns {import('../types/typedef').Coordinate}
 */
export function getTargetPositionFromGameObjectPositionAndDirection(currentPosition, direction, stepDistance) {
  /** @type {import('../types/typedef').Coordinate} */
  const targetPosition = { ...currentPosition };
  switch (direction) {
    case DIRECTION.DOWN:
      targetPosition.y += TILE_SIZE;
      break;
    case DIRECTION.UP:
      targetPosition.y -= TILE_SIZE;
      break;
    case DIRECTION.LEFT:
      targetPosition.x -= TILE_SIZE;
      break;
    case DIRECTION.RIGHT:
      targetPosition.x += TILE_SIZE;
      break;
    case DIRECTION.NONE:
      break;
    default:
      // We should never reach this default case
      exhaustiveGuard(direction);
  }
  return targetPosition;
}

/**
 * Movimiento controlado por tecla.
 * @param {import('../types/typedef').Coordinate} currentPosition
 * @param {import('../types/typedef').Coordinate} targetPosition
 * @param {boolean} isMoving
 * @param {number} deltaTime
 * @param {function} onMoveEnd Callback cuando el movimiento termina
 * @returns {import('../types/typedef').Coordinate}
 */
export function updatePlayerPosition(currentPosition, targetPosition, isMoving, deltaTime, onMoveEnd) {
  // Solo mueve si está en movimiento
  if (isMoving) {
    const dx = targetPosition.x - currentPosition.x;
    const dy = targetPosition.y - currentPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > TILE_SIZE) {
      // Normalizamos el movimiento para que sea en función de la velocidad y el tiempo
      const moveSpeed = 200; // Puedes ajustar la velocidad de movimiento
      const moveDistance = moveSpeed * deltaTime;
      const moveX = (dx / distance) * moveDistance;
      const moveY = (dy / distance) * moveDistance;

      return {
        x: currentPosition.x + moveX,
        y: currentPosition.y + moveY,
      };
    } else {
      // Cuando el jugador alcanza el targetPosition, se detiene
      onMoveEnd();
      return targetPosition; // El jugador se detiene en la nueva posición
    }
  }
  return currentPosition; // Si no está en movimiento, la posición no cambia
}
