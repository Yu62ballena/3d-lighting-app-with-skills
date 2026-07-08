import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

export let composer;
export let zebraPass;
let isZebraEnabled = false;

const ZebraShader = {
  uniforms: {
    tDiffuse: { value: null },
    threshold: { value: 0.95 },
    patternSize: { value: 20.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float threshold;
    uniform float patternSize;
    varying vec2 vUv;

    void main() {
      vec4 texColor = texture2D(tDiffuse, vUv);

      // Calculate luminance (standard relative luminance formula)
      float luminance = dot(texColor.rgb, vec3(0.2126, 0.7152, 0.0722));

      if (luminance > threshold) {
        // Draw diagonal stripes
        // Use gl_FragCoord to keep stripes screen-space and consistent size
        float stripe = mod(gl_FragCoord.x + gl_FragCoord.y, patternSize);
        if (stripe < patternSize / 2.0) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black stripe
        } else {
          gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // White stripe
        }
      } else {
        gl_FragColor = texColor;
      }
    }
  `
};

export function initZebraOverlay(renderer, scene, camera) {
  composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  zebraPass = new ShaderPass(ZebraShader);
  zebraPass.enabled = false;
  composer.addPass(zebraPass);
}

export function setZebraEnabled(enabled) {
  isZebraEnabled = enabled;
  if (zebraPass) {
    zebraPass.enabled = enabled;
  }
}

export function setZebraThreshold(val) {
  if (zebraPass) {
    zebraPass.uniforms.threshold.value = val;
  }
}

export function renderWithComposer() {
  if (composer) {
    composer.render();
  }
}
