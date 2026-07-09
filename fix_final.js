const fs = require('fs');

// 1. Fix RectAreaLightUniformsLib.init() in main.js
let main = fs.readFileSync('src/main.js', 'utf8');
main = main.replace("import { initLighting, mainLight } from './lighting.js';", "import { initLighting, mainLight } from './lighting.js';\nimport { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';");
main = main.replace("  // 1. Initialize Scene (Renderer, Camera, OrbitControls)\n  initScene();", "  // 1. Initialize Scene (Renderer, Camera, OrbitControls)\n  initScene();\n\n  // Initialize RectAreaLight support right after renderer is created\n  RectAreaLightUniformsLib.init();");
fs.writeFileSync('src/main.js', main);

// Remove the one in lighting.js to avoid double init or init out of order
let lighting = fs.readFileSync('src/lighting.js', 'utf8');
lighting = lighting.replace("  // Required for RectAreaLight to work\n  RectAreaLightUniformsLib.init();\n", "");
lighting = lighting.replace("  mainLight.add(mainLightHelper);", "  // mainLight.add(mainLightHelper);");
lighting = lighting.replace("  subLight.add(subLightHelper);", "  // subLight.add(subLightHelper);");
lighting = lighting.replace("  reflectorLight.add(reflectorLightHelper);", "  // reflectorLight.add(reflectorLightHelper);");
fs.writeFileSync('src/lighting.js', lighting);

// 2. Fix model duplication in model-loader.js
let loader = fs.readFileSync('src/model-loader.js', 'utf8');
loader = loader.replace(
  "  if (currentModel) {\n    scene.remove(currentModel);\n  }",
  "  if (currentModel) {\n    scene.remove(currentModel);\n    currentModel.traverse((child) => {\n      if (child.isMesh) {\n        child.geometry.dispose();\n        if (child.material.isMaterial) {\n          child.material.dispose();\n        } else if (Array.isArray(child.material)) {\n          child.material.forEach(mat => mat.dispose());\n        }\n      }\n    });\n  }"
);
fs.writeFileSync('src/model-loader.js', loader);

// Add PMREMGenerator env map to scene-setup.js to fix pitch black Standard material
let sceneSetup = fs.readFileSync('src/scene-setup.js', 'utf8');
sceneSetup = sceneSetup.replace(
  "  renderer.outputColorSpace = THREE.SRGBColorSpace;\n",
  "  renderer.outputColorSpace = THREE.SRGBColorSpace;\n\n  const pmremGenerator = new THREE.PMREMGenerator(renderer);\n  pmremGenerator.compileEquirectangularShader();\n  scene.environment = pmremGenerator.fromScene(new THREE.Scene()).texture;\n"
);
fs.writeFileSync('src/scene-setup.js', sceneSetup);
