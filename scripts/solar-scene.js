import * as THREE from '/three.module.js';

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(1800, 1200);
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
document.body.appendChild(renderer.domElement);

const palette = {
  plaster: 0xf4f3ed, concrete: 0xbecac5, dark: 0x233a35,
  green: 0x47715c, leaf: 0x688b53, orange: 0xd88449,
  glass: 0x496d76, steel: 0xa3adb0, roof: 0xc9d2cd
};

function material(color, options = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.72, ...options });
}

function box(parent, dimensions, position, color, options = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...dimensions), material(color, options));
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function cylinder(parent, radius, height, position, color, topRadius = radius) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(topRadius, radius, height, 40), material(color));
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function panelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 1000;
  const context = canvas.getContext('2d');
  context.fillStyle = '#182c3c';
  context.fillRect(0, 0, 600, 1000);
  for (let column = 0; column < 6; column++) {
    for (let row = 0; row < 10; row++) {
      const left = column * 100 + 4;
      const top = row * 100 + 4;
      context.fillStyle = ['#214456', '#244958', '#284e60', '#23485a'][(column + row * 3) % 4];
      context.beginPath();
      context.moveTo(left + 8, top);
      context.lineTo(left + 84, top);
      context.lineTo(left + 92, top + 8);
      context.lineTo(left + 92, top + 84);
      context.lineTo(left + 84, top + 92);
      context.lineTo(left + 8, top + 92);
      context.lineTo(left, top + 84);
      context.lineTo(left, top + 8);
      context.closePath();
      context.fill();
      context.strokeStyle = '#8ba4af';
      context.lineWidth = 0.6;
      for (let track = 1; track < 18; track++) {
        context.beginPath();
        context.moveTo(left + 4, top + track * 5);
        context.lineTo(left + 88, top + track * 5);
        context.stroke();
      }
      context.strokeStyle = '#a3b6bb';
      for (const bus of [22, 46, 70]) {
        context.beginPath();
        context.moveTo(left + bus, top + 2);
        context.lineTo(left + bus, top + 90);
        context.stroke();
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

const cells = panelTexture();

function panel(parent, position, scale = 1) {
  const mount = new THREE.Group();
  mount.position.set(...position);
  mount.scale.setScalar(scale);
  parent.add(mount);
  for (const side of [-0.58, 0.58]) {
    box(mount, [0.06, 0.32, 0.06], [side, 0.16, 0.7], palette.steel, { metalness: 0.8 });
    box(mount, [0.06, 0.78, 0.06], [side, 0.39, -0.7], palette.steel, { metalness: 0.8 });
    box(mount, [0.12, 0.05, 1.9], [side, 0.04, 0], palette.steel);
  }
  const module = new THREE.Group();
  module.position.y = 0.56;
  module.rotation.x = 0.29;
  mount.add(module);
  box(module, [1.4, 0.07, 2.12], [0, 0, 0], palette.steel, { metalness: 0.8, roughness: 0.3 });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.34, 2.06), material(0xffffff, {
    map: cells, roughness: 0.32, metalness: 0.35
  }));
  glass.rotation.x = -Math.PI / 2;
  glass.position.y = 0.039;
  glass.receiveShadow = true;
  module.add(glass);
  for (const corner of [-0.65, 0.65]) {
    for (const end of [-0.99, 0.99]) {
      cylinder(module, 0.016, 0.01, [corner, 0.044, end], palette.dark);
    }
  }
}

function plant(parent, position, scale = 1) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.scale.setScalar(scale);
  parent.add(group);
  cylinder(group, 0.3, 0.55, [0, 0.275, 0], palette.plaster, 0.38);
  cylinder(group, 0.33, 0.035, [0, 0.56, 0], 0x5a5141);
  for (let branch = 0; branch < 7; branch++) {
    const angle = branch * 2.4;
    const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 1), material(branch % 2 ? palette.leaf : palette.green));
    leaf.scale.set(0.7, 1.8, 0.7);
    leaf.position.set(Math.sin(angle) * 0.24, 0.9 + (branch % 3) * 0.1, Math.cos(angle) * 0.24);
    leaf.rotation.z = Math.sin(angle) * 0.45;
    leaf.castShadow = true;
    group.add(leaf);
  }
}

function windowPane(parent, position, width, height) {
  box(parent, [width + 0.16, height + 0.16, 0.14], position, palette.dark);
  box(parent, [width, height, 0.045], [position[0], position[1], position[2] + 0.09], palette.glass, { metalness: 0.45, roughness: 0.2 });
  box(parent, [0.055, height, 0.08], [position[0], position[1], position[2] + 0.14], palette.steel);
}

function home(scene) {
  box(scene, [11, 0.08, 8.5], [0, 0.04, 0.7], 0xdce3db);
  box(scene, [7.5, 0.25, 5.7], [0, 0.16, 0], palette.concrete);
  box(scene, [7, 3.3, 5.2], [0, 1.93, 0], palette.plaster);
  box(scene, [7.35, 0.18, 5.55], [0, 3.67, 0], palette.roof);
  for (const side of [-3.56, 3.56]) box(scene, [0.16, 0.4, 5.6], [side, 3.93, 0], palette.plaster);
  for (const end of [-2.72, 2.72]) box(scene, [7.2, 0.4, 0.16], [0, 3.93, end], palette.plaster);
  for (const column of [-2.25, -0.7, 0.85]) {
    for (const row of [-1.25, 1.12]) panel(scene, [column, 3.78, row]);
  }
  box(scene, [1.15, 2.4, 0.14], [2.25, 1.48, 2.67], palette.orange);
  box(scene, [0.04, 0.38, 0.08], [2.63, 1.48, 2.77], palette.steel);
  windowPane(scene, [-1.55, 1.9, 2.65], 2.7, 1.45);
  box(scene, [3.05, 0.12, 0.9], [-1.55, 2.87, 2.95], palette.green);
  for (let slat = 0; slat < 9; slat++) box(scene, [0.075, 2.8, 0.14], [-3.19 + slat * 0.16, 1.95, 2.73], 0x99aaa0);
  box(scene, [2.1, 0.13, 1.3], [2.25, 0.2, 3.15], palette.concrete);
  box(scene, [1.8, 0.07, 0.65], [2.25, 0.08, 4.0], palette.concrete);
  plant(scene, [0.65, 0.08, 3.55], 0.9);
  plant(scene, [3.5, 0.08, 3.55], 1.15);
  plant(scene, [2.8, 3.78, -1.9], 0.7);
  for (let tile = 0; tile < 6; tile++) box(scene, [1.2, 0.035, 0.7], [-2.5 + tile * 1.4, 0.1, 4.5], palette.plaster);
}

function commercial(scene) {
  box(scene, [14, 0.08, 10], [0, 0.04, 0], 0xd7dfd9);
  box(scene, [10, 3, 6.7], [0, 1.6, 0], 0xe5eae4);
  box(scene, [10.4, 0.22, 7], [0, 3.2, 0], palette.green);
  for (const column of [-3.9, -2.35, -0.8, 0.75, 2.3, 3.85]) {
    for (const row of [-2.3, 0, 2.3]) panel(scene, [column, 3.35, row], 0.93);
  }
  for (const door of [-3, 0, 3]) {
    box(scene, [2.3, 2.35, 0.12], [door, 1.3, 3.4], 0x9caeaa);
    for (let seam = 0; seam < 12; seam++) box(scene, [2.3, 0.02, 0.025], [door, 0.2 + seam * 0.19, 3.48], 0x6e8781);
    for (const side of [-1.4, 1.4]) cylinder(scene, 0.055, 0.8, [door + side, 0.4, 3.9], palette.orange);
  }
  for (let stripe = 0; stripe < 5; stripe++) box(scene, [0.5, 0.015, 1.8], [-5.9, 0.09, -3 + stripe * 1.65], palette.plaster);
  plant(scene, [5.6, 0.08, 3.4], 1.4);
}

function farm(scene) {
  box(scene, [15, 0.12, 11], [0, 0.06, 0], 0xabbf83);
  box(scene, [6.7, 0.13, 5.3], [-2.4, 0.17, -1.0], 0xcbd1b9);
  for (const column of [-4.6, -3.05, -1.5, 0.05]) {
    for (const row of [-2.2, 0.2]) panel(scene, [column, 0.27, row]);
  }
  cylinder(scene, 1, 2.1, [3.1, 1.13, -1.8], palette.plaster);
  cylinder(scene, 1.025, 0.08, [3.1, 2.22, -1.8], palette.green);
  for (const height of [0.45, 0.8, 1.15, 1.5, 1.85]) cylinder(scene, 1.02, 0.055, [3.1, height, -1.8], 0xd7dfd5);
  box(scene, [1.6, 0.16, 1.2], [2.4, 0.16, 0.5], palette.concrete);
  const pump = cylinder(scene, 0.25, 0.9, [2.4, 0.54, 0.5], palette.green);
  pump.rotation.z = Math.PI / 2;
  box(scene, [0.65, 0.5, 0.55], [3.05, 0.47, 0.5], palette.dark);
  const pipe = cylinder(scene, 0.09, 3.5, [3.1, 0.24, 2.3], 0x5a8676);
  pipe.rotation.x = Math.PI / 2;
  const riser = cylinder(scene, 0.09, 1.6, [3.1, 0.8, -0.75], 0x5a8676);
  for (let row = 0; row < 5; row++) {
    box(scene, [8.4, 0.07, 0.52], [-1.8, 0.15, 2.0 + row * 0.67], 0x819960);
    for (let crop = 0; crop < 17; crop++) {
      const stalk = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.44, 5), material(crop % 2 ? 0x628452 : 0x77954b));
      stalk.position.set(-5.7 + crop * 0.48, 0.4, 2.0 + row * 0.67);
      stalk.castShadow = true;
      scene.add(stalk);
    }
  }
  return riser;
}

function detail(scene) {
  box(scene, [14, 0.1, 10], [0, 0, 0], 0xdbe4dd);
  for (const column of [-2.25, 0, 2.25]) {
    for (const row of [-1.7, 1.7]) panel(scene, [column, 0.06, row], 1.42);
  }
}

window.renderSolarScene = (kind) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe8eee8);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), material(0xe8eee8));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.03;
  ground.receiveShadow = true;
  scene.add(ground);
  scene.add(new THREE.HemisphereLight(0xd8efff, 0xa4b498, 2.4));
  const sun = new THREE.DirectionalLight(0xfff5df, 4.5);
  sun.position.set(-7, 16, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 0.1, far: 70 });
  sun.shadow.normalBias = 0.03;
  sun.shadow.bias = -0.0001;
  sun.shadow.radius = 4;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xd2e8ff, 1.3);
  fill.position.set(8, 6, -10);
  scene.add(fill);
  const configurations = {
    home: { build: home, span: 10, position: [11, 11, 15], target: [0, 1.5, 0.5] },
    commercial: { build: commercial, span: 12, position: [13, 13, 17], target: [0, 1.3, 0] },
    farm: { build: farm, span: 12, position: [13, 15, 18], target: [0, 0.7, 0] },
    detail: { build: detail, span: 8.4, position: [7, 10, 9], target: [0, 0.4, 0] }
  };
  const config = configurations[kind];
  config.build(scene);
  const camera = new THREE.OrthographicCamera(-config.span * 0.75, config.span * 0.75, config.span / 2, -config.span / 2, 0.1, 100);
  camera.position.set(...config.position);
  camera.lookAt(...config.target);
  renderer.render(scene, camera);
  window.sceneReady = kind;
};