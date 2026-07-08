import { TransformControls } from 'three/addons/controls/TransformControls.js';

export let transformControl;
let syncCallback = null; // Callback to sync UI when dragged

export function initDragControls(camera, domElement, scene, orbitControls) {
  transformControl = new TransformControls(camera, domElement);

  // Only allow translation (moving)
  transformControl.setMode('translate');

  // Disable OrbitControls when dragging a light
  transformControl.addEventListener('dragging-changed', (event) => {
    orbitControls.enabled = !event.value;
  });

  // When dragged, notify to update UI (convert position back to angle/height/distance)
  transformControl.addEventListener('change', () => {
    if (syncCallback && transformControl.object) {
      syncCallback(transformControl.object);
    }
    // ensure light still points at center (0,0,0)
    if (transformControl.object) {
      transformControl.object.lookAt(0,0,0);
    }
  });

  scene.add(transformControl);
}

export function attachToLight(light) {
  if (transformControl) {
    if (light) {
      transformControl.attach(light);
    } else {
      transformControl.detach();
    }
  }
}

export function onLightDragged(callback) {
  syncCallback = callback;
}

/**
 * Converts a Vector3 position to (angleClock, heightAngle, distanceCm)
 * so the UI can be updated when dragged.
 */
export function positionToParams(position) {
  // distance
  const distanceM = position.length();
  const distanceCm = distanceM * 100;

  // height angle
  // y = distanceM * sin(heightRad)
  // heightRad = asin(y / distanceM)
  let heightRad = Math.asin(position.y / distanceM);
  let heightAngle = (heightRad * 180) / Math.PI;
  heightAngle = Math.max(0, Math.min(90, heightAngle)); // Clamp 0-90

  // clock angle
  // x = r_xz * sin(azimuth)
  // z = -r_xz * cos(azimuth)
  // atan2(x, -z) = azimuth in radians
  const r_xz = Math.sqrt(position.x * position.x + position.z * position.z);
  let azimuthRad = 0;
  if (r_xz > 0.001) {
    azimuthRad = Math.atan2(position.x, -position.z);
  }

  if (azimuthRad < 0) azimuthRad += Math.PI * 2;

  let angleClock = (azimuthRad / (Math.PI * 2)) * 12;
  // Snap to 0.5 steps for cleaner UI
  angleClock = Math.round(angleClock * 2) / 2;
  if (angleClock === 12) angleClock = 0; // or 12, depending on preference

  return {
    angleClock,
    heightAngle: Math.round(heightAngle),
    distanceCm: Math.round(distanceCm)
  };
}
