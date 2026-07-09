import * as THREE from 'three';
import { initScene, scene, camera, renderer, controls } from './scene-setup.js';
import { loadModel } from './model-loader.js';
import { initLighting, mainLight } from './lighting.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { initZebraOverlay, renderWithComposer } from './zebra-overlay.js';
import { initDragControls, onLightDragged, attachToLight } from './drag-controls.js';
import { initUIControls, syncUIFromDrag } from './ui-controls.js';
import { initPresets } from './presets.js';

// Timer for animations/updates if needed
const timer = new THREE.Clock(); // Using Clock for r0.185.0 compat or general usage

function init() {
  // 1. Initialize Scene (Renderer, Camera, OrbitControls)
  initScene();

  // Initialize RectAreaLight support right after renderer is created
  RectAreaLightUniformsLib.init();

  // 2. Load Model (USDZ -> GLTF fallback)
  loadModel(scene);

  // 3. Setup Lighting (RectAreaLights for main, sub, reflector)
  initLighting(scene);

  // 4. Setup Post-Processing (Zebra Overlay)
  initZebraOverlay(renderer, scene, camera);

  // 5. Setup Drag Controls (TransformControls)
  initDragControls(camera, renderer.domElement, scene, controls);

  // Initially attach to main light
  attachToLight(mainLight);

  // When a light is dragged in 3D, sync the UI sliders
  onLightDragged(syncUIFromDrag);

  // 6. Setup UI (sliders, toggles, strobecalc)
  initUIControls();

  // 7. Setup Presets
  initPresets(renderer);

  // Start animation loop
  renderer.setAnimationLoop(animate);
}

function animate() {
  const delta = timer.getDelta();

  // Update orbit controls
  controls.update();

  // Render scene. Use composer if zebra enabled, else normal render.
  // Note: zebra-overlay manages the state. To keep it simple, we just always use composer
  // or check if it's enabled. If disabled, composer just does the RenderPass which is fine.
  // But doing normal render is slightly faster when disabled.
  // We'll rely on renderWithComposer which internally calls composer.render().
  renderWithComposer();
}

// Bootstrap
init();
