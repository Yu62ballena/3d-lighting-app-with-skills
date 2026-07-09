const fs = require('fs');

// The issue states: "RectAreaLightUniformsLib.init() が一度も呼び出されていません。 initLighting(scene) 関数の先頭、ライトを生成するより前に、以下の1行を追加してください："
// It seems the user specifically wants it inside `initLighting(scene)` in `src/lighting.js`, not just in `src/main.js`.
// Let's remove it from main.js and put it back into lighting.js at the very top of initLighting.

let main = fs.readFileSync('src/main.js', 'utf8');
main = main.replace("import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';\n", "");
main = main.replace("  // Initialize RectAreaLight support right after renderer is created\n  RectAreaLightUniformsLib.init();\n", "");
fs.writeFileSync('src/main.js', main);


let lighting = fs.readFileSync('src/lighting.js', 'utf8');
lighting = lighting.replace("export function initLighting(scene) {", "export function initLighting(scene) {\n  RectAreaLightUniformsLib.init();\n");
fs.writeFileSync('src/lighting.js', lighting);
