import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const STATION_GAP = 19;
const clamp = THREE.MathUtils.clamp;
const mix = THREE.MathUtils.lerp;
const smooth = t => t * t * (3 - 2 * t);
const palettes = ['#e9e5ef', '#e4e9dc', '#e3dff0', '#dae7e5', '#eee4dc'];
const stationNames = ['THE INTERSECTION', 'FIREFLY / FINTECH', 'ACGNTTS / OPEN SOURCE', 'CONNECTED ECOSYSTEM', 'A PLACE TO GROW'];

export function createJourney({ container, onStation, onStatus, reduced }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch {
    document.body.classList.add('no-webgl');
    onStatus('STATIC / WEBGL UNAVAILABLE');
    return { refresh() {}, setPaused() {}, pulse() {}, rotate() {}, dispose() {} };
  }
  container.appendChild(renderer.domElement);
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.35 : 1.8));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(palettes[0]);
  scene.fog = new THREE.Fog(palettes[0], 13, 27);
  const camera = new THREE.PerspectiveCamera(39, innerWidth / innerHeight, .1, 110);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 1.3;
  room.dispose();
  pmrem.dispose();

  scene.add(new THREE.HemisphereLight(0xffffff, 0x8b7a9f, 2));
  const key = new THREE.DirectionalLight(0xffffff, 3.3);
  key.position.set(-4, 7, 7);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xc0b0ff, 3);
  rim.position.set(6, 2, -2);
  scene.add(rim, key.target, rim.target);

  const metal = new THREE.MeshPhysicalMaterial({
    color: 0xc1b6d8, metalness: .96, roughness: .18, clearcoat: 1,
    clearcoatRoughness: .12, iridescence: .72, iridescenceIOR: 1.42,
    iridescenceThicknessRange: [140, 410], envMapIntensity: 1.8,
  });
  const silver = new THREE.MeshStandardMaterial({ color: 0xe4e1ec, metalness: .88, roughness: .2 });
  const lavender = new THREE.MeshPhysicalMaterial({ color: 0x9683cf, metalness: .25, roughness: .22, clearcoat: 1 });
  const green = new THREE.MeshPhysicalMaterial({ color: 0xd7fb74, roughness: .24, metalness: .15, clearcoat: 1 });
  const charcoal = new THREE.MeshStandardMaterial({ color: 0x38313f, metalness: .45, roughness: .3 });
  const cream = new THREE.MeshStandardMaterial({ color: 0xf4f0e8, roughness: .5 });
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x8c80a5, transparent: true, opacity: .38 });

  const sphereGeometry = new THREE.SphereGeometry(1, 32, 24);
  const boxGeometry = new RoundedBoxGeometry(1, 1, 1, 4, .12);
  const mesh = (geometry, material, parent, position = [0, 0, 0], scale = [1, 1, 1]) => {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(...position); object.scale.set(...scale); parent.add(object);
    return object;
  };
  const box = (parent, material, position, scale) => mesh(boxGeometry, material, parent, position, scale);
  const ball = (parent, material, position, radius) => mesh(sphereGeometry, material, parent, position, [radius, radius, radius]);
  const ring = (parent, radius, tube, material, position = [0, 0, 0]) =>
    mesh(new THREE.TorusGeometry(radius, tube, 16, 110), material, parent, position);
  const labelTexture = (title, subtitle = '', background = '#27232f', foreground = '#e9e5ef') => {
    const c = document.createElement('canvas'); c.width = 768; c.height = 256;
    const x = c.getContext('2d');
    x.fillStyle = background; x.fillRect(0, 0, 768, 256);
    x.fillStyle = foreground; x.font = '500 66px sans-serif'; x.fillText(title, 45, 120);
    x.globalAlpha = .6; x.font = '23px monospace'; x.fillText(subtitle, 48, 182);
    const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };
  const label = (parent, title, subtitle, position, size = [2.2, .73], bg, fg) => {
    const material = new THREE.MeshBasicMaterial({ map: labelTexture(title, subtitle, bg, fg), side: THREE.DoubleSide });
    return mesh(new THREE.PlaneGeometry(...size), material, parent, position);
  };

  // Soft procedural contact shadows stay local to each sculpture.
  const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 128;
  const shadowContext = shadowCanvas.getContext('2d');
  const gradient = shadowContext.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, '#41364a55'); gradient.addColorStop(.4, '#41364a28'); gradient.addColorStop(1, '#41364a00');
  shadowContext.fillStyle = gradient; shadowContext.fillRect(0, 0, 128, 128);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const groups = [];
  const animations = [];
  const pedestals = [];
  for (let i = 0; i < 5; i++) {
    const root = new THREE.Group(); root.position.z = -i * STATION_GAP;
    const sculpture = new THREE.Group(); root.add(sculpture);
    const pedestal = mesh(new THREE.CylinderGeometry(2.35, 2.35, .16, 96),
      new THREE.MeshStandardMaterial({ color: palettes[i], metalness: .12, roughness: .48 }), root, [0, -2.08, 0]);
    const shadow = mesh(new THREE.PlaneGeometry(7, 7),
      new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }), root, [0, -2.18, 0]);
    shadow.rotation.x = -Math.PI / 2;
    const grid = new THREE.GridHelper(14, 28, 0xa69cad, 0xa69cad);
    grid.material.transparent = true; grid.material.opacity = .13; grid.position.y = -2.2; root.add(grid);
    scene.add(root); groups.push({ root, sculpture, grid }); pedestals.push(pedestal);
  }

  // 00 — A polished, interlocked sculpture inside an architectural portal.
  {
    const g = groups[0].sculpture;
    const knot = mesh(new THREE.TorusKnotGeometry(1.18, .39, 220, 32, 2, 3), metal, g, [0, .15, 0]);
    knot.rotation.set(.3, -.35, -.2);
    const arch = mesh(new THREE.TorusGeometry(2.32, .1, 18, 96, Math.PI), lavender, g, [0, -.3, -.6]);
    box(g, lavender, [-2.32, -1.15, -.6], [.2, 1.7, .2]);
    box(g, lavender, [2.32, -1.15, -.6], [.2, 1.7, .2]);
    const orbit = ring(g, 2, .016, silver); orbit.rotation.set(1.18, .35, -.35);
    const satellite = ball(g, green, [1.9, .7, .7], .29);
    const sphere = ball(g, silver, [-1.8, -.8, .8], .22);
    label(g, 'YW / 26', 'FINANCE × TECHNOLOGY', [.4, -1.76, 1.5], [1.3, .43], '#d7fb74', '#27232f').rotation.z = -.1;
    animations.push(t => {
      knot.rotation.y = -.35 + t * .14; knot.rotation.z = -.2 + Math.sin(t * .3) * .12;
      knot.position.y = .15 + Math.sin(t * .8) * .12;
      satellite.position.set(Math.cos(t * .45) * 2.1, Math.sin(t * .6) * .7 + .4, Math.sin(t * .45) * 1.4);
      sphere.position.y = -.8 + Math.sin(t * .7) * .25;
      arch.rotation.y = Math.sin(t * .18) * .12;
    });
  }

  // 01 — A floating financial workstation with a tactile dashboard, bars and coins.
  {
    const g = groups[1].sculpture;
    const rig = new THREE.Group(); rig.rotation.set(-.12, -.35, -.08); g.add(rig);
    const bars = [];
    for (let i = 0; i < 7; i++) {
      const height = [.7, 1.05, .85, 1.65, 1.25, 2.1, 1.85][i];
      const bar = box(rig, i % 3 === 0 ? green : lavender, [-1.7 + i * .53, -1.4 + height / 2, -.85], [.33, height, .4]);
      bars.push({ bar, height });
    }
    const dashboard = new THREE.Group(); dashboard.position.set(0, -.05, .5); dashboard.rotation.x = -.12; rig.add(dashboard);
    box(dashboard, charcoal, [0, 0, 0], [3.5, 2.15, .14]);
    const c = document.createElement('canvas'); c.width = 1200; c.height = 740; const x = c.getContext('2d');
    x.fillStyle = '#f0f2e9'; x.fillRect(0, 0, 1200, 740);
    x.fillStyle = '#272f24'; x.font = '500 42px sans-serif'; x.fillText('✳ FIREFLY', 65, 85);
    x.font = '19px monospace'; x.fillStyle = '#7e8875'; x.fillText('FINANCIAL OVERVIEW', 700, 85);
    x.fillStyle = '#dadfd1'; x.fillRect(65, 122, 1070, 2);
    x.fillStyle = '#7e8875'; x.font = '20px monospace'; x.fillText('INCOME', 65, 195); x.fillText('EXPENSES', 650, 195);
    x.fillStyle = '#273223'; x.font = '58px sans-serif'; x.fillText('12,860.00', 65, 270); x.fillText('4,280.00', 650, 270);
    const heights = [70, 135, 95, 190, 155, 230, 175, 265, 210, 290, 245, 310];
    heights.forEach((v, i) => { x.fillStyle = i % 3 === 0 ? '#a8be7b' : '#c8d6b1'; x.fillRect(70 + i * 89, 640 - v, 48, v); });
    x.fillStyle = '#7e8875'; x.font = '16px monospace'; x.fillText('CONCEPT VISUALIZATION / SAMPLE DATA', 65, 705);
    const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
    mesh(new THREE.PlaneGeometry(3.35, 2.06), new THREE.MeshBasicMaterial({ map: texture }), dashboard, [0, 0, .081]);
    const coins = [];
    for (let i = 0; i < 3; i++) {
      const coin = mesh(new THREE.CylinderGeometry(.48, .48, .13, 64), i === 1 ? metal : green, rig, [2 - i * .25, .2 + i * .45, .3 - i * .55]);
      coin.rotation.set(Math.PI / 2, 0, -.25); coins.push(coin);
    }
    label(rig, 'AI ↗', 'READ / ANALYZE', [-1.5, 1.55, .7], [1.15, .38], '#d7fb74', '#27232f');
    animations.push(t => {
      rig.position.y = Math.sin(t * .7) * .1; rig.rotation.y = -.35 + Math.sin(t * .22) * .15;
      coins.forEach((coin, i) => { coin.rotation.z = t * .3 + i; coin.position.y = .2 + i * .45 + Math.sin(t + i) * .12; });
      bars.forEach(({ bar, height }, i) => { const scale = .88 + Math.sin(t * .8 + i) * .12; bar.scale.y = height * scale; bar.position.y = -1.4 + height * scale / 2; });
    });
  }

  // 02 — Deep concentric acoustic lenses and a real three-dimensional waveform.
  {
    const g = groups[2].sculpture;
    const rig = new THREE.Group(); rig.rotation.set(.12, .34, -.2); g.add(rig);
    const rings = [];
    for (let i = 0; i < 5; i++) {
      const object = ring(rig, 1.38 + i * .19, i === 4 ? .11 : .045, i % 2 ? silver : lavender, [0, 0, -i * .25]);
      rings.push(object);
    }
    const waves = [];
    for (let i = 0; i < 27; i++) {
      const bar = box(rig, i % 4 === 0 ? green : metal, [(i - 13) * .115, 0, .35], [.065, .5, .13]); waves.push(bar);
    }
    label(rig, 'ACGNTTS', 'TEXT → VOICE', [0, -1.66, .6], [1.65, .55], '#28232f', '#e9e5ef');
    const merged = label(rig, '⑂ #200', 'MERGED / 2025.03', [1.7, 1.45, .4], [1.3, .43], '#d7fb74', '#27232f');
    animations.push(t => {
      rig.rotation.y = .34 + Math.sin(t * .25) * .2;
      rings.forEach((r, i) => { r.rotation.x = Math.sin(t * .5 - i * .18) * .15; r.position.z = -i * .25 + Math.sin(t * .6 + i * .3) * .1; });
      waves.forEach((bar, i) => { bar.scale.y = .18 + Math.pow(Math.sin(i * .55 + t * 2), 2) * (1.5 - Math.abs(i - 13) * .06); });
      merged.position.y = 1.45 + Math.sin(t) * .08;
    });
  }

  // 03 — A kinetic network; framework satellites exchange signals with the core.
  {
    const g = groups[3].sculpture;
    const rig = new THREE.Group(); g.add(rig);
    const core = box(rig, metal, [0, 0, 0], [1.22, 1.22, 1.22]); core.rotation.set(.3, .6, .2);
    const positions = [[-1.8, 1.1, .2], [1.9, .65, -.2], [.2, -1.5, 1.05]];
    const names = ['NoneBot2', 'zhenxun_bot', 'Yunzai'];
    const nodes = [], signals = [];
    positions.forEach((p, i) => {
      const node = box(rig, i === 1 ? green : lavender, p, [.7, .7, .7]); node.rotation.set(.2, -.3, -.2); nodes.push(node);
      const points = [new THREE.Vector3(), new THREE.Vector3(...p)];
      rig.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lineMaterial));
      label(rig, names[i], 'CONNECTED', [p[0], p[1] + .57, p[2] + .35], [1.3, .43], '#e1eae5', '#343d36');
      const signal = ball(rig, green, [0, 0, 0], .075); signals.push(signal);
    });
    const orbit = ring(rig, 2.15, .018, silver); orbit.rotation.set(1.1, .1, -.3);
    label(core, 'NapCat', 'PROTOCOL / CORE', [0, 0, .52], [.88, .29]);
    animations.push(t => {
      rig.rotation.y = Math.sin(t * .2) * .3; rig.rotation.z = Math.sin(t * .24) * .07;
      core.rotation.y = .6 + t * .2;
      nodes.forEach((node, i) => { node.rotation.y = t * .2 + i; });
      signals.forEach((signal, i) => { const f = (t * .3 + i * .32) % 1; signal.position.set(...positions[i]).multiplyScalar(f); });
    });
  }

  // 04 — An unfolding editorial object with curved pages, type and orbiting notes.
  {
    const g = groups[4].sculpture;
    const rig = new THREE.Group(); rig.rotation.set(-.15, -.25, -.12); g.add(rig);
    const spine = box(rig, lavender, [0, -.8, -.3], [3.7, .22, 2.4]);
    const pages = [];
    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.PlaneGeometry(3.1, 2.15, 36, 24);
      const attr = geometry.attributes.position;
      for (let j = 0; j < attr.count; j++) {
        const x = attr.getX(j), y = attr.getY(j);
        attr.setZ(j, Math.sin((x + 1.55) * 1.0) * .32 + Math.cos(y * 1.3) * .12);
      }
      geometry.computeVertexNormals();
      const material = new THREE.MeshStandardMaterial({ color: i === 4 ? 0xf7f0e3 : 0xe1d7cd, roughness: .6, side: THREE.DoubleSide });
      const page = mesh(geometry, material, rig, [0, -.5 + i * .15, -.3 + i * .07]);
      page.rotation.x = -1.0 + i * .13; pages.push(page);
    }
    const front = label(rig, 'A place', 'TO GROW / WORDPRESS', [0, .52, .9], [2.8, .93], '#f7f0e3', '#59496a');
    front.rotation.x = -.2;
    const flower = new THREE.Group(); flower.position.set(1.7, 1.2, 0); rig.add(flower);
    for (let i = 0; i < 6; i++) {
      const petal = ball(flower, lavender, [Math.cos(i * Math.PI / 3) * .3, Math.sin(i * Math.PI / 3) * .3, 0], .22);
      petal.scale.z = .45;
    }
    ball(flower, green, [0, 0, .1], .16);
    const note = label(rig, '5k ↗', 'PAGE VIEWS / YEAR', [-1.7, 1.2, .4], [1.2, .4], '#d7fb74', '#27232f');
    animations.push(t => {
      rig.rotation.y = -.25 + Math.sin(t * .25) * .17;
      pages.forEach((p, i) => { p.rotation.x = -1 + i * .13 + Math.sin(t * .7 + i * .4) * .09; });
      flower.rotation.z = t * .15; note.position.y = 1.2 + Math.sin(t * .8) * .12;
      spine.position.y = -.8 + Math.sin(t * .7) * .03;
    });
  }

  // A sparse architectural dust field gives the travelling camera depth cues.
  let randomSeed = 74;
  const random = () => { randomSeed = (randomSeed * 16807) % 2147483647; return (randomSeed - 1) / 2147483646; };
  const dustPositions = new Float32Array(220 * 3);
  for (let i = 0; i < 220; i++) {
    dustPositions[i * 3] = (random() - .5) * 20;
    dustPositions[i * 3 + 1] = (random() - .4) * 11;
    dustPositions[i * 3 + 2] = 5 - random() * 95;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: 0x8c7f9b, size: .028, transparent: true, opacity: .45 }));
  scene.add(dust);

  let sections = [], stops = [], mobile = innerWidth < 681;
  const rotations = Array.from({ length: 5 }, () => new THREE.Vector2());
  let paused = reduced, scroll = scrollY, lastStation = -1, pulseAmount = 0;
  let lastTime = performance.now(), elapsed = 0, running = false;
  const pointer = new THREE.Vector2();
  const pointerSmoothed = new THREE.Vector2();
  const targetColor = new THREE.Color();
  function refresh() {
    lastStation = -1;
    sections = [document.querySelector('#home'), ...document.querySelectorAll('.chapter')];
    stops = sections.map((el, i) => i === 0 ? 0 : el.offsetTop - innerHeight * .08);
    mobile = innerWidth < 681;
    groups.forEach(({ root, grid }, i) => {
      root.position.x = mobile ? (i === 0 ? 1.15 : .8) : (i === 2 || i === 4 ? -2.7 : 2.7);
      root.position.y = mobile ? (i === 0 ? (innerWidth < 361 ? -2.3 : -2.0) : 2.35) : .1;
      root.scale.setScalar(mobile ? (i === 0 ? (innerWidth < 361 ? .5 : .56) : .72) : 1);
      grid.visible = !mobile;
    });
    camera.aspect = innerWidth / innerHeight;
    camera.fov = mobile ? 45 : 39;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.35 : 1.8));
    renderer.setSize(innerWidth, innerHeight);
    if (paused) renderFrame(performance.now(), true);
  }
  function readPosition(y) {
    let index = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      if (y >= stops[i]) index = i;
    }
    if (y >= stops.at(-1)) return { a: 4, b: 4, t: 0 };
    const b = Math.min(index + 1, 4);
    return { a: index, b, t: smooth(clamp((y - stops[index]) / (stops[b] - stops[index]), 0, 1)) };
  }
  function renderFrame(now, immediate = false) {
    const delta = Math.min((now - lastTime) / 1000, .05); lastTime = now;
    if (!paused) elapsed += delta;
    scroll = immediate || paused ? scrollY : mix(scroll, scrollY, 1 - Math.exp(-delta * 8));
    const { a, b, t } = readPosition(scroll);
    const station = a + (b - a) * t;
    const nearest = Math.round(station);
    if (nearest !== lastStation) { lastStation = nearest; onStation(nearest, stationNames[nearest]); }
    pointerSmoothed.lerp(paused ? new THREE.Vector2() : pointer, .04);
    const cameraZ = (mobile ? 11 : 10.6) - station * STATION_GAP;
    camera.position.set(Math.sin(station * Math.PI) * (mobile ? .1 : .65) + pointerSmoothed.x * .23, (mobile ? 1.9 : 1.1) + pointerSmoothed.y * .14, cameraZ);
    camera.lookAt(pointerSmoothed.x * .08, mobile ? .35 : .1, -station * STATION_GAP);
    camera.rotation.z = paused ? 0 : Math.sin(station * Math.PI) * .035;
    targetColor.set(palettes[a]).lerp(new THREE.Color(palettes[b]), t);
    scene.background.copy(targetColor); scene.fog.color.copy(targetColor);
    key.position.z = cameraZ + 3; rim.position.z = cameraZ - 9;
    key.target.position.z = rim.target.position.z = -station * STATION_GAP;
    groups.forEach(({ root, sculpture }, i) => {
      root.visible = Math.abs(i - station) < 1.6;
      sculpture.rotation.y = rotations[i].x;
      sculpture.rotation.x = rotations[i].y + (paused ? 0 : pointerSmoothed.y * .045);
      sculpture.rotation.z = paused ? 0 : pointerSmoothed.x * .055;
    });
    animations.forEach(fn => fn(elapsed));
    pulseAmount *= .92;
    const current = groups[nearest]?.sculpture;
    if (current) current.scale.setScalar(1 + pulseAmount * .035);
    renderer.render(scene, camera);
  }
  function tick(now) {
    renderFrame(now);
    if (!paused && !document.hidden) requestAnimationFrame(tick);
    else running = false;
  }
  function start() {
    if (!running && !paused && !document.hidden) {
      running = true; lastTime = performance.now(); requestAnimationFrame(tick);
    }
  }
  const onScroll = () => { if (paused) renderFrame(performance.now(), true); };
  const onPointer = e => { pointer.set((e.clientX / innerWidth - .5) * 2, (e.clientY / innerHeight - .5) * 2); };
  const onVisibility = () => start();
  const onResize = () => refresh();
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('pointermove', onPointer, { passive: true });
  addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVisibility);
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault(); paused = true; document.body.classList.add('no-webgl'); onStatus('STATIC / CONTEXT LOST');
  });
  refresh();
  renderer.compileAsync(scene, camera).then(() => onStatus(paused ? 'WEBGL / STILL' : 'WEBGL / LIVE')).catch(() => onStatus(paused ? 'WEBGL / STILL' : 'WEBGL / LIVE'));
  renderFrame(performance.now(), true); start();
  return {
    refresh,
    setPaused(value) {
      paused = value; document.body.classList.toggle('motion-paused', paused);
      onStatus(paused ? 'WEBGL / STILL' : 'WEBGL / LIVE');
      if (paused) renderFrame(performance.now(), true); else start();
    },
    pulse() { pulseAmount = 1; },
    rotate(dx, dy) {
      const rotation = rotations[Math.max(0, lastStation)];
      rotation.x += dx; rotation.y = clamp(rotation.y + dy, -.6, .6);
      if (paused) renderFrame(performance.now(), true);
    },
    dispose() {
      paused = true; removeEventListener('scroll', onScroll); removeEventListener('pointermove', onPointer);
      removeEventListener('resize', onResize); document.removeEventListener('visibilitychange', onVisibility);
      scene.traverse(object => {
        object.geometry?.dispose();
        const materials = object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : [];
        materials.forEach(material => { material.map?.dispose(); material.dispose(); });
      });
      environment.dispose(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
