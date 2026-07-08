import { updateMainLight, updateSubLight, updateSubLightMode, updateReflector, mainLight, subLight, reflectorLight } from './lighting.js';
import { setZebraEnabled, setZebraThreshold } from './zebra-overlay.js';
import { calculateStrobeOutput } from './strobe-calc.js';
import { attachToLight, positionToParams } from './drag-controls.js';
import { STROBE_PROFILES } from './strobe-profiles.js';

let activeLight = 'main'; // 'main', 'sub', 'reflector'

export function initUIControls() {
  populateStrobeProfiles();

  // --- Main Light Controls ---
  const mainAngle = document.getElementById('main-angle-dial');
  const mainHeight = document.getElementById('main-height');
  const mainDist = document.getElementById('main-distance');
  const mainW = document.getElementById('main-width');
  const mainH = document.getElementById('main-height-size');

  const onMainChange = () => {
    updateMainLight(
      parseFloat(mainAngle.value),
      parseFloat(mainHeight.value),
      parseFloat(mainDist.value),
      parseFloat(mainW.value),
      parseFloat(mainH.value)
    );
    updateLabels();
    updateStrobeCalc();
    if (activeLight !== 'main') {
      activeLight = 'main';
      attachToLight(mainLight);
    }
  };

  [mainAngle, mainHeight, mainDist, mainW, mainH].forEach(el => {
    el.addEventListener('input', onMainChange);
  });

  // Highlight active light on click
  document.getElementById('main-light-card').addEventListener('click', () => {
    activeLight = 'main';
    attachToLight(mainLight);
  });

  // --- Sub Light Controls ---
  const subToggle = document.getElementById('sub-light-toggle');
  const subMode = document.getElementById('sub-light-mode');
  const subAngle = document.getElementById('sub-angle');
  const subHeight = document.getElementById('sub-height');
  const subDist = document.getElementById('sub-distance');

  const onSubChange = () => {
    updateSubLight(
      subToggle.checked,
      parseFloat(subAngle.value),
      parseFloat(subHeight.value),
      parseFloat(subDist.value)
    );
    updateLabels();
    if (subToggle.checked && activeLight !== 'sub') {
      activeLight = 'sub';
      attachToLight(subLight);
    } else if (!subToggle.checked && activeLight === 'sub') {
      attachToLight(null);
    }
  };

  subToggle.addEventListener('change', onSubChange);
  [subAngle, subHeight, subDist].forEach(el => el.addEventListener('input', onSubChange));

  subMode.addEventListener('change', () => {
    const params = updateSubLightMode(
      subMode.value,
      parseFloat(subAngle.value),
      parseFloat(subHeight.value),
      parseFloat(subDist.value)
    );
    if (params) {
      subAngle.value = params.angle;
      subHeight.value = params.height;
      subDist.value = params.dist;
      onSubChange();
    }
  });

  document.getElementById('sub-light-card').addEventListener('click', (e) => {
    if (subToggle.checked) {
      activeLight = 'sub';
      attachToLight(subLight);
    }
  });

  // --- Reflector Controls ---
  const refToggle = document.getElementById('reflector-toggle');
  const refColor = document.getElementById('reflector-color');
  const refInt = document.getElementById('reflector-intensity');
  const refDist = document.getElementById('reflector-distance');

  const onRefChange = () => {
    updateReflector(
      refToggle.checked,
      refColor.value,
      parseFloat(refInt.value),
      parseFloat(refDist.value)
    );
    updateLabels();
    // Assuming reflector isn't dragged, or if it is, handle it here.
    // The issue says "疑似光源として実装" but doesn't explicitly require dragging for reflector.
    // Let's allow it just in case.
    if (refToggle.checked && activeLight !== 'reflector') {
      activeLight = 'reflector';
      attachToLight(reflectorLight);
    } else if (!refToggle.checked && activeLight === 'reflector') {
      attachToLight(null);
    }
  };

  refToggle.addEventListener('change', onRefChange);
  refColor.addEventListener('change', onRefChange);
  [refInt, refDist].forEach(el => el.addEventListener('input', onRefChange));

  document.getElementById('reflector-card').addEventListener('click', () => {
    if (refToggle.checked) {
      activeLight = 'reflector';
      attachToLight(reflectorLight);
    }
  });

  // --- Zebra Overlay ---
  const zebraToggle = document.getElementById('zebra-toggle');
  const zebraThreshold = document.getElementById('zebra-threshold');

  zebraToggle.addEventListener('change', () => {
    setZebraEnabled(zebraToggle.checked);
  });
  zebraThreshold.addEventListener('input', () => {
    setZebraThreshold(parseFloat(zebraThreshold.value));
    updateLabels();
  });

  // --- Strobe Calc ---
  const strobeProfile = document.getElementById('strobe-profile');
  const strobeIso = document.getElementById('strobe-iso');
  const strobeF = document.getElementById('strobe-f');

  const onStrobeChange = () => {
    updateStrobeCalc();
  };

  [strobeProfile, strobeIso, strobeF].forEach(el => {
    el.addEventListener('input', onStrobeChange);
  });

  // Initial update
  updateLabels();
  updateStrobeCalc();
}

function populateStrobeProfiles() {
  const select = document.getElementById('strobe-profile');
  select.innerHTML = '';
  for (const [id, profile] of Object.entries(STROBE_PROFILES)) {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = profile.name;
    select.appendChild(opt);
  }
}

function updateLabels() {
  const setVal = (id, val, suffix='') => {
    const el = document.getElementById(id);
    if (el) el.textContent = val + suffix;
  };

  setVal('main-angle-val', document.getElementById('main-angle-dial').value, '時');
  setVal('main-height-val', document.getElementById('main-height').value, '°');
  setVal('main-distance-val', document.getElementById('main-distance').value, 'cm');
  setVal('main-width-val', document.getElementById('main-width').value, 'cm');
  setVal('main-height-size-val', document.getElementById('main-height-size').value, 'cm');

  setVal('sub-angle-val', document.getElementById('sub-angle').value, '時');
  setVal('sub-height-val', document.getElementById('sub-height').value, '°');
  setVal('sub-distance-val', document.getElementById('sub-distance').value, 'cm');

  setVal('reflector-intensity-val', document.getElementById('reflector-intensity').value, '%');
  setVal('reflector-distance-val', document.getElementById('reflector-distance').value, 'cm');

  setVal('zebra-threshold-val', document.getElementById('zebra-threshold').value);
}

function updateStrobeCalc() {
  const profile = document.getElementById('strobe-profile').value;
  const iso = parseFloat(document.getElementById('strobe-iso').value);
  const fValue = parseFloat(document.getElementById('strobe-f').value);
  const distance = parseFloat(document.getElementById('main-distance').value); // Use main light distance

  const result = calculateStrobeOutput(profile, iso, fValue, distance);
  document.getElementById('strobe-result').textContent = result;
}

// Called from drag-controls when a light is moved in 3D
export function syncUIFromDrag(lightObj) {
  const params = positionToParams(lightObj.position);

  if (lightObj === mainLight) {
    document.getElementById('main-angle-dial').value = params.angleClock;
    document.getElementById('main-height').value = params.heightAngle;
    document.getElementById('main-distance').value = params.distanceCm;
    updateMainLight(
      params.angleClock, params.heightAngle, params.distanceCm,
      parseFloat(document.getElementById('main-width').value),
      parseFloat(document.getElementById('main-height-size').value)
    );
  } else if (lightObj === subLight) {
    document.getElementById('sub-angle').value = params.angleClock;
    document.getElementById('sub-height').value = params.heightAngle;
    document.getElementById('sub-distance').value = params.distanceCm;
    updateSubLight(
      true, params.angleClock, params.heightAngle, params.distanceCm
    );
  } else if (lightObj === reflectorLight) {
    document.getElementById('reflector-distance').value = params.distanceCm;
    updateReflector(
      true,
      document.getElementById('reflector-color').value,
      parseFloat(document.getElementById('reflector-intensity').value),
      params.distanceCm
    );
  }

  updateLabels();
  updateStrobeCalc();
}

/**
 * Returns current state for presets
 */
export function getCurrentState() {
  return {
    main: {
      angle: document.getElementById('main-angle-dial').value,
      height: document.getElementById('main-height').value,
      distance: document.getElementById('main-distance').value,
      width: document.getElementById('main-width').value,
      heightSize: document.getElementById('main-height-size').value
    },
    sub: {
      enabled: document.getElementById('sub-light-toggle').checked,
      mode: document.getElementById('sub-light-mode').value,
      angle: document.getElementById('sub-angle').value,
      height: document.getElementById('sub-height').value,
      distance: document.getElementById('sub-distance').value
    },
    reflector: {
      enabled: document.getElementById('reflector-toggle').checked,
      color: document.getElementById('reflector-color').value,
      intensity: document.getElementById('reflector-intensity').value,
      distance: document.getElementById('reflector-distance').value
    },
    strobe: {
      profile: document.getElementById('strobe-profile').value,
      iso: document.getElementById('strobe-iso').value,
      f: document.getElementById('strobe-f').value
    }
  };
}

/**
 * Applies state from preset
 */
export function applyState(state) {
  if (!state) return;

  if (state.main) {
    document.getElementById('main-angle-dial').value = state.main.angle;
    document.getElementById('main-height').value = state.main.height;
    document.getElementById('main-distance').value = state.main.distance;
    document.getElementById('main-width').value = state.main.width;
    document.getElementById('main-height-size').value = state.main.heightSize;
    updateMainLight(
      parseFloat(state.main.angle), parseFloat(state.main.height), parseFloat(state.main.distance),
      parseFloat(state.main.width), parseFloat(state.main.heightSize)
    );
  }

  if (state.sub) {
    document.getElementById('sub-light-toggle').checked = state.sub.enabled;
    document.getElementById('sub-light-mode').value = state.sub.mode;
    document.getElementById('sub-angle').value = state.sub.angle;
    document.getElementById('sub-height').value = state.sub.height;
    document.getElementById('sub-distance').value = state.sub.distance;
    updateSubLight(
      state.sub.enabled, parseFloat(state.sub.angle), parseFloat(state.sub.height), parseFloat(state.sub.distance)
    );
  }

  if (state.reflector) {
    document.getElementById('reflector-toggle').checked = state.reflector.enabled;
    document.getElementById('reflector-color').value = state.reflector.color;
    document.getElementById('reflector-intensity').value = state.reflector.intensity;
    document.getElementById('reflector-distance').value = state.reflector.distance;
    updateReflector(
      state.reflector.enabled, state.reflector.color, parseFloat(state.reflector.intensity), parseFloat(state.reflector.distance)
    );
  }

  if (state.strobe) {
    document.getElementById('strobe-profile').value = state.strobe.profile;
    document.getElementById('strobe-iso').value = state.strobe.iso;
    document.getElementById('strobe-f').value = state.strobe.f;
  }

  updateLabels();
  updateStrobeCalc();
}
