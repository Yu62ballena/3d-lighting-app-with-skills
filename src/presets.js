import { getCurrentState, applyState } from './ui-controls.js';

let presets = [];

export function initPresets(renderer) {
  loadPresetsFromStorage();
  renderPresetList();

  const saveBtn = document.getElementById('preset-save-btn');
  const nameInput = document.getElementById('preset-name');

  saveBtn.addEventListener('click', () => {
    const name = nameInput.value.trim() || `Preset ${presets.length + 1}`;

    // Take a screenshot
    // render has preserveDrawingBuffer: true, so toDataURL should work.
    const thumbnail = renderer.domElement.toDataURL('image/jpeg', 0.5);

    const state = getCurrentState();

    const newPreset = {
      id: Date.now().toString(),
      name,
      thumbnail,
      state
    };

    presets.push(newPreset);
    savePresetsToStorage();
    renderPresetList();
    nameInput.value = '';
  });
}

function loadPresetsFromStorage() {
  try {
    const saved = localStorage.getItem('lightingPresets');
    if (saved) {
      presets = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load presets', e);
  }
}

function savePresetsToStorage() {
  try {
    localStorage.setItem('lightingPresets', JSON.stringify(presets));
  } catch (e) {
    console.error('Failed to save presets (possibly quota exceeded due to base64 images)', e);
  }
}

function renderPresetList() {
  const container = document.getElementById('preset-list');
  container.innerHTML = '';

  presets.forEach((preset, index) => {
    const item = document.createElement('div');
    item.className = 'preset-item';

    const img = document.createElement('img');
    img.className = 'preset-thumbnail';
    img.src = preset.thumbnail;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'preset-name';
    nameSpan.textContent = preset.name;

    const delBtn = document.createElement('button');
    delBtn.className = 'preset-delete';
    delBtn.innerHTML = '&times;';
    delBtn.onclick = (e) => {
      e.stopPropagation();
      presets.splice(index, 1);
      savePresetsToStorage();
      renderPresetList();
    };

    item.appendChild(img);
    item.appendChild(nameSpan);
    item.appendChild(delBtn);

    item.addEventListener('click', () => {
      applyState(preset.state);
    });

    container.appendChild(item);
  });
}
