import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';

export let mainLight, subLight, reflectorLight;
export let mainLightHelper, subLightHelper, reflectorLightHelper;

// Base values for inverse square law calculation
// e.g., if distance is 100cm, intensity is BASE_INTENSITY.
const BASE_DISTANCE = 1.0; // meters (100cm)
const BASE_INTENSITY = 5.0;

export function initLighting(scene) {
  RectAreaLightUniformsLib.init();


  // Add ambient light to prevent pitch black shadows
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(ambientLight);

  // 1. Main Light
  // Default: width 60cm, height 60cm, color white
  mainLight = new THREE.RectAreaLight(0xffffff, BASE_INTENSITY, 0.6, 0.6);
  mainLight.position.set(0, 0, 0); // Will be updated via updateMainLight
  scene.add(mainLight);

  mainLightHelper = new RectAreaLightHelper(mainLight);
  // mainLight.add(mainLightHelper);

  // 2. Sub Light (2nd light)
  subLight = new THREE.RectAreaLight(0xffffff, BASE_INTENSITY * 0.5, 0.4, 0.4);
  subLight.visible = false;
  scene.add(subLight);

  subLightHelper = new RectAreaLightHelper(subLight);
  // subLight.add(subLightHelper);

  // 3. Reflector (simulated as a weak RectAreaLight)
  reflectorLight = new THREE.RectAreaLight(0xffffff, BASE_INTENSITY * 0.3, 0.8, 0.8);
  reflectorLight.visible = false;
  scene.add(reflectorLight);

  reflectorLightHelper = new RectAreaLightHelper(reflectorLight);
  // reflectorLight.add(reflectorLightHelper);

  // Initialize positions based on defaults
  updateMainLight(6, 45, 100, 60, 60); // 6 o'clock, 45 deg up, 100cm dist, 60x60 size
  updateSubLightMode('rim', 11, 20, 150); // Default sub light params
  updateReflector('white', 50, 30);
}

/**
 * Update Main Light position, size, and intensity
 * @param {number} angleClock - 0 to 12. 6 is front, 12 is back.
 * @param {number} heightAngle - 0 to 90 degrees.
 * @param {number} distanceCm - distance in cm.
 * @param {number} widthCm - width of softbox.
 * @param {number} heightCm - height of softbox.
 */
export function updateMainLight(angleClock, heightAngle, distanceCm, widthCm, heightCm) {
  if (!mainLight) return;

  const distanceM = distanceCm / 100;

  // Inverse square law: Intensity = BASE_INTENSITY * (BASE_DISTANCE / distance)^2
  const calculatedIntensity = BASE_INTENSITY * Math.pow(BASE_DISTANCE / distanceM, 2);
  mainLight.intensity = calculatedIntensity;

  mainLight.width = widthCm / 100;
  mainLight.height = heightCm / 100;

  // Convert clock angle to radians.
  // 12 o'clock = 0 rad (behind subject, -z). 6 o'clock = PI rad (front of subject, +z).
  // Clockwise: 3 o'clock = +x, 9 o'clock = -x.
  const angleRad = (angleClock / 12) * Math.PI * 2;

  // Height angle: 0 = horizontal (xz plane), 90 = vertical (+y).
  const heightRad = (heightAngle / 180) * Math.PI;

  // Calculate position using spherical coordinates
  // y = r * sin(elevation)
  // x = r * cos(elevation) * sin(azimuth)
  // z = r * cos(elevation) * cos(azimuth) -- inverted to match clock mapping
  const y = distanceM * Math.sin(heightRad);
  const x = distanceM * Math.cos(heightRad) * Math.sin(angleRad);
  const z = -(distanceM * Math.cos(heightRad) * Math.cos(angleRad)); // negative because 12 is -z

  mainLight.position.set(x, y, z);
  mainLight.lookAt(0, 0, 0);
}

/**
 * Update Sub Light parameters
 */
export function updateSubLight(isVisible, angleClock, heightAngle, distanceCm) {
  if (!subLight) return;

  subLight.visible = isVisible;

  if (isVisible) {
    const distanceM = distanceCm / 100;
    // slightly weaker base intensity for sublight
    const calculatedIntensity = (BASE_INTENSITY * 0.5) * Math.pow(BASE_DISTANCE / distanceM, 2);
    subLight.intensity = calculatedIntensity;

    const angleRad = (angleClock / 12) * Math.PI * 2;
    const heightRad = (heightAngle / 180) * Math.PI;

    const y = distanceM * Math.sin(heightRad);
    const x = distanceM * Math.cos(heightRad) * Math.sin(angleRad);
    const z = -(distanceM * Math.cos(heightRad) * Math.cos(angleRad));

    subLight.position.set(x, y, z);
    subLight.lookAt(0, 0, 0);
  }
}

/**
 * Apply Sub Light Mode presets
 */
export function updateSubLightMode(mode, currentAngle, currentHeight, currentDist) {
  if (!subLight) return;

  let angle = currentAngle;
  let height = currentHeight;
  let dist = currentDist;

  if (mode === 'rim') {
    // Rim light: back (11 o'clock), low height (20 deg), far (150cm)
    angle = 11;
    height = 20;
    dist = 150;
    subLight.width = 0.3;
    subLight.height = 0.3;
  } else if (mode === 'soft') {
    // Soft fill: side (3 o'clock), medium height (45 deg), medium dist (100cm)
    angle = 3;
    height = 45;
    dist = 100;
    subLight.width = 1.0;
    subLight.height = 1.0;
  }

  return { angle, height, dist };
}

/**
 * Update Reflector
 */
export function updateReflector(isVisible, colorType, intensityPercent, distanceCm) {
  if (!reflectorLight) return;

  reflectorLight.visible = isVisible;

  if (isVisible) {
    const distanceM = distanceCm / 100;

    // Base intensity for reflector is much lower. Max is ~20% of main light.
    let reflectorBase = BASE_INTENSITY * 0.2;

    // Silver reflects more than white
    if (colorType === 'silver') {
      reflectorBase *= 1.5;
      reflectorLight.color.setHex(0xe0e0e0); // slightly cooler/brighter
    } else {
      reflectorLight.color.setHex(0xffffff);
    }

    // Apply intensity slider (0-100) and inverse square law
    const calcInt = reflectorBase * (intensityPercent / 100) * Math.pow(BASE_DISTANCE / distanceM, 2);
    reflectorLight.intensity = calcInt;

    // Reflector is usually placed opposite to the main light (approx 6 o'clock if main is 12)
    // For simplicity, we just put it fixed at the front-left (around 7-8 o'clock) on floor level
    // Wait, requirement: "スライダーで調整可能な疑似光源". Let's put it at 7:30 (approx 225 deg).
    const angleRad = (7.5 / 12) * Math.PI * 2;
    const heightRad = (10 / 180) * Math.PI; // low angle

    const y = distanceM * Math.sin(heightRad);
    const x = distanceM * Math.cos(heightRad) * Math.sin(angleRad);
    const z = -(distanceM * Math.cos(heightRad) * Math.cos(angleRad));

    reflectorLight.position.set(x, y, z);
    reflectorLight.lookAt(0, 0, 0);
  }
}
