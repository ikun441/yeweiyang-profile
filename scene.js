import * as THREE from 'three';
import { frameworkLogos } from './brands.js';
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

  // 03 — An open protocol diagram: three framework medallions above one hub.
  {
    const g = groups[3].sculpture;
    const rig = new THREE.Group(); g.add(rig);
    const textureLoader = new THREE.TextureLoader();
    const corePosition = new THREE.Vector3(0, -.72, .15);
    const positions = [
      new THREE.Vector3(-1.65, .92, 0),
      new THREE.Vector3(0, 1.36, -.12),
      new THREE.Vector3(1.65, .92, 0),
    ];
    const names = ['nonebot2', 'zhenxun', 'yunzai'];
    const textMark = (parent, name, role, y, width) => {
      const c = document.createElement('canvas'); c.width = 768; c.height = 220;
      const x = c.getContext('2d'); x.textAlign = 'center';
      x.fillStyle = '#34303e'; x.font = '500 57px sans-serif'; x.fillText(name, 384, 80);
      x.fillStyle = '#81748e'; x.font = '23px monospace'; x.fillText(role, 384, 143);
      const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
      return mesh(new THREE.PlaneGeometry(width, width * 220 / 768),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }),
        parent, [0, y, .08]);
    };
    const medallion = (id, position, radius, role) => {
      const brand = frameworkLogos.find(item => item.id === id);
      const node = new THREE.Group(); node.position.copy(position); rig.add(node);
      mesh(new THREE.CircleGeometry(radius, 80),
        new THREE.MeshBasicMaterial({ color: 0xf4eff8, toneMapped: false }), node);
      ring(node, radius, .012, lavender, [0, 0, .01]);
      // The image is contained, not stretched, and never mounted on a cube.
      const material = new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false });
      const icon = mesh(new THREE.PlaneGeometry(1, 1), material, node, [0, 0, .025]);
      textureLoader.load(brand.image, texture => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
        const aspect = texture.image.width / texture.image.height;
        const fit = radius * (id === 'zhenxun' ? 1.32 : 1.62);
        icon.scale.set(fit * Math.min(aspect, 1), fit * Math.min(1 / aspect, 1), 1);
        material.map = texture; material.needsUpdate = true;
        if (paused) renderFrame(performance.now(), true);
      });
      textMark(node, brand.name, role, -radius - .24, id === 'napcat' ? 1.2 : 1.25);
      return node;
    };
    medallion('napcat', corePosition, .72, 'ONEBOT / PROTOCOL');
    positions.forEach((position, i) => medallion(names[i], position, .49, 'APPLICATION'));
    const signals = positions.map((position, i) => {
      const start = new THREE.Vector3(0, corePosition.y + .74, -.16);
      const end = new THREE.Vector3(position.x, position.y - .51, -.16);
      const curve = new THREE.CubicBezierCurve3(start,
        new THREE.Vector3(position.x * .25, .3, -.4),
        new THREE.Vector3(position.x, end.y - .35, -.3), end);
      rig.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(64)),
        new THREE.LineBasicMaterial({ color: 0x9c8bb4, transparent: true, opacity: .6 })));
      return { curve, dot: ball(rig, green, [0, 0, 0], .045), offset: i * .29 };
    });
    animations.push(t => {
      rig.rotation.y = Math.sin(t * .18) * .07;
      rig.position.y = Math.sin(t * .5) * .035;
      signals.forEach(({ curve, dot, offset }) => dot.position.copy(curve.getPoint((t * .22 + offset) % 1)));
    });
  }

  // 04 — Coloured paper turns across a central spine, rather than gently rocking.
  {
    const g = groups[4].sculpture;
    const rig = new THREE.Group(); rig.rotation.set(-.15, -.22, -.1); rig.position.y = -.15; g.add(rig);
    const coverMaterial = new THREE.MeshStandardMaterial({ color: 0x614c79, roughness: .82, metalness: .05 });
    box(rig, coverMaterial, [-.89, 0, -.2], [1.8, 2.4, .13]);
    box(rig, coverMaterial, [.89, 0, -.2], [1.8, 2.4, .13]);
    const spine = mesh(new THREE.CylinderGeometry(.075, .075, 2.43, 24), lavender, rig, [0, 0, -.1]);
    const colours = ['#84658f', '#a17891', '#8d7ca4', '#a689a5'];
    const pageTexture = (index, back = false) => {
      const c = document.createElement('canvas'); c.width = 512; c.height = 704;
      const x = c.getContext('2d');
      x.fillStyle = colours[index % colours.length]; x.fillRect(0, 0, c.width, c.height);
      x.fillStyle = '#efe3f0'; x.globalAlpha = .8;
      x.font = '16px monospace'; x.fillText('FIELD NOTES / 0' + (index + 1), 42, 57);
      x.font = 'italic 42px Georgia'; x.fillText(back ? 'Stay curious.' : 'Small stories,', 42, 131);
      x.fillText(back ? 'Keep growing.' : 'real growth.', 42, 184);
      x.globalAlpha = .3;
      for (let j = 0; j < 13; j++) x.fillRect(42, 252 + j * 23, 270 + (j % 3) * 49, 3);
      x.globalAlpha = .7; x.font = '15px monospace'; x.fillText('YEWEIYANG / JOURNAL', 42, 655);
      x.globalAlpha = .15; x.fillRect(18, 20, 2, 662);
      const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
      if (back) { texture.wrapS = THREE.RepeatWrapping; texture.repeat.x = -1; texture.offset.x = 1; }
      return texture;
    };
    const pages = [];
    const makePage = (index, turning) => {
      const hinge = new THREE.Group(); rig.add(hinge);
      const geometry = new THREE.PlaneGeometry(1.67, 2.18, 28, 16);
      geometry.translate(.835, 0, 0);
      const material = new THREE.MeshStandardMaterial({ map: pageTexture(index), color: 0x785387, roughness: .93, metalness: 0, side: THREE.FrontSide, envMapIntensity: .15 });
      const front = mesh(geometry, material, hinge);
      const back = mesh(geometry, new THREE.MeshStandardMaterial({ map: pageTexture(index, true), color: 0x785387, roughness: .93, side: THREE.BackSide, envMapIntensity: .15 }), hinge);
      const base = Float32Array.from(geometry.attributes.position.array);
      hinge.position.z = turning ? .03 : -.1 + index * .008;
      if (turning) {
        pages.push({ hinge, geometry, base, front, back });
      }
      return hinge;
    };
    // Stable left/right page stacks keep the book full throughout the repeat.
    for (let i = 0; i < 3; i++) {
      makePage(i, false).rotation.y = -.04;
      makePage(i + 1, false).rotation.y = -Math.PI + .04;
    }
    for (let i = 0; i < 4; i++) makePage(i, true);
    label(rig, 'A place to grow.', 'NOTES / WORDPRESS', [0, 1.66, .05], [2.8, .68], '#715a83', '#f0e2ee');
    const flower = new THREE.Group(); flower.position.set(1.78, 1.35, .1); rig.add(flower);
    for (let i = 0; i < 6; i++) {
      const petal = ball(flower, lavender, [Math.cos(i * Math.PI / 3) * .25, Math.sin(i * Math.PI / 3) * .25, 0], .18); petal.scale.z = .45;
    }
    ball(flower, green, [0, 0, .1], .14);
    const note = label(rig, '5k ↗', 'PAGE VIEWS / YEAR', [-1.75, 1.65, .4], [1.05, .35], '#d7fb74', '#27232f');
    animations.push(t => {
      rig.rotation.y = -.22 + Math.sin(t * .22) * .1;
      const halfCycle = 12.8, cycle = halfCycle * 2, interval = halfCycle / pages.length;
      const phase = t % cycle;
      const turnTime = phase <= halfCycle ? phase : cycle - phase;
      pages.forEach(({ hinge, geometry, base }, i) => {
        const local = turnTime - i * interval;
        const progress = clamp(local / 2.65, 0, 1);
        const turn = smooth(progress);
        hinge.rotation.y = -.04 - turn * (Math.PI - .08);
        // Reverse the sequence on the return half; no visible reset or teleport.
        hinge.position.z = .025 + ((pages.length - i) * (1 - progress) + (i + 1) * progress) * .014 + Math.sin(progress * Math.PI) * .05;
        const position = geometry.attributes.position;
        const curl = Math.sin(progress * Math.PI);
        for (let j = 0; j < position.count; j++) {
          const x = base[j * 3], y = base[j * 3 + 1];
          position.setXYZ(j, x, y + Math.sin(x * 1.9) * curl * .035,
            Math.sin(x / 1.67 * Math.PI) * curl * .3 + Math.pow(x / 1.67, 2) * curl * .13);
        }
        position.needsUpdate = true;
        geometry.computeVertexNormals();
      });
      flower.rotation.z = t * .15; note.position.y = 1.65 + Math.sin(t * .8) * .07;
      spine.position.y = Math.sin(t * .7) * .015;
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
      root.position.x = mobile ? (i === 0 ? 1.15 : i === 3 ? 0 : .8) : (i === 2 || i === 4 ? -2.7 : 2.7);
      root.position.y = mobile ? (i === 0 ? (innerWidth < 361 ? -2.3 : -2.0) : i === 3 ? 2.7 : 2.35) : .1;
      root.scale.setScalar(mobile ? (i === 0 ? (innerWidth < 361 ? .5 : .56) : i === 3 ? .56 : .72) : 1);
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
    if (paused || document.hidden) { running = false; return; }
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
