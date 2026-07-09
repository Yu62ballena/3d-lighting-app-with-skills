import * as THREE from 'three';
import { USDZLoader } from 'three/addons/loaders/USDZLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export let currentModel = null;

export function loadModel(scene) {
  const gltfPath = 'assets/models/apple-placeholder.glb';

  const showError = (msg) => {
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.remove('hidden');
    }
    // Fallback simple cylinder to prevent total visual failure
    createFallbackCylinder(scene);
  };

  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    gltfPath,
    (gltf) => {
      onModelLoaded(gltf.scene, scene);
    },
    undefined,
    (gltfErr) => {
      console.error(`GLTF load failed: ${gltfErr}`);
      showError('モデルの読み込みに失敗しました。');
    }
  );
}

function onModelLoaded(modelGroup, scene) {
  // Clear error if any
  const errorEl = document.getElementById('error-message');
  if (errorEl) errorEl.classList.add('hidden');

  // Normalize scale and position
  modelGroup.scale.setScalar(1); // Adjust as needed based on actual model size
  modelGroup.position.set(0, 0, 0);

  // Configure materials for realistic rendering
  modelGroup.traverse((child) => {
    if (child.isMesh) {
      // Ensure material takes light properly
      if (child.material) {
        child.material.roughness = Math.max(0.2, child.material.roughness); // Prevent totally shiny look
      }
    }
  });

  if (currentModel) {
    scene.remove(currentModel);
  }

  currentModel = modelGroup;
  scene.add(currentModel);
}

function createFallbackCylinder(scene) {
  if (currentModel) scene.remove(currentModel);

  const geometry = new THREE.CylinderGeometry(0.5, 0.4, 1, 32);
  const material = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.6,
    metalness: 0.1
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 0.5;

  currentModel = mesh;
  scene.add(currentModel);
}
