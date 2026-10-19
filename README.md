# yeweiyang — Beyond one dimension

Immersive bilingual résumé / portfolio. Three.js WebGL + GSAP + Vite.

## Run

Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
npm run check
npm run build
npm run preview
```

Development: http://127.0.0.1:5173 . Production output: dist/ . Vite uses relative base paths for GitHub Pages subdirectories.

## Experience

- Five real-time 3D installations: iridescent chrome knot and architectural portal; floating financial dashboard, bars and coins; concentric acoustic lenses and animated waveform; connected bot framework network with moving signals; curved, unfolding blog pages.
- Continuous scroll-driven camera travel through depth, interpolated palettes and cinematic camera banking.
- Drag / arrow-key sculpture rotation, pointer parallax, scene navigation, animated typography and project dialog transitions.
- Chinese / English content, keyboard-operable native dialogs and navigation, motion pause, OS reduced-motion support, print résumé.
- Capped device pixel ratio, visibility-based animation pause, fog and station culling, static fallback if WebGL cannot initialize or loses its context.
- No external 3D models or image downloads. Geometry, textures and studio environment are generated locally. Google Fonts are optional, with system fallbacks.

## Maintain

- content.js: evidence-grounded bilingual résumé and project stories.
- app.js: page layout, language switching, navigation, GSAP interactions.
- scene.js: scene geometry, materials, environment, camera path and animation lifecycle.
- style.css: visual system, responsive layout and print styles.

Run checks and build, then commit and push every completed update to origin/main, as requested by the owner. Never save credentials in files, remotes or commits.

## Content sources

Reviewed 2026-10-19:
- [Firefly](https://github.com/ikun441/firefly_bot): capabilities described from the public README; no production usage claimed.
- [ACGNTTS PR #200](https://github.com/xinnan-tech/xiaozhi-esp32-server/pull/200) and [configuration PR #201](https://github.com/xinnan-tech/xiaozhi-esp32-server/pull/201): merged 2025-03-07.
- Education, awards, internship, bot feature counts and blog metrics were supplied by the owner.
- Project scenes are original conceptual illustrations, not actual product screenshots. Dashboard amounts are sample data.
- School name, email, phone and blog URL were not provided and are not invented.

## Technical references

The implementation was written for this portfolio. These projects informed the scroll/camera architecture, rather than being copied:
- [Fireship scroll animation demo](https://github.com/fireship-io/threejs-scroll-animation-demo): scroll position driving a Three.js camera.
- [CodeItAlone 3D portfolio](https://github.com/CodeItAlone/3D-portfolio): layered DOM / WebGL and spatial sections.
- [Three.js RoomEnvironment](https://threejs.org/docs/pages/RoomEnvironment.html): generated image-based lighting.
- [Three.js MeshPhysicalMaterial](https://threejs.org/docs/pages/MeshPhysicalMaterial.html): reflective, clear-coated and iridescent materials.


## Verification

Validated in an isolated Edge/Playwright session at 1440×1000, 390×844, and 320×740:
- All four project scenes render in WebGL.
- Project details, next-project navigation, Escape dismissal and mobile dialogs work.
- English/Chinese switching preserves project content.
- Drag and arrow-key sculpture rotation work.
- Reduced-motion mode pauses autonomous animation and can be resumed.
- No horizontal overflow at 320px; print mode removes the 3D canvas and retains résumé content.
- No browser runtime errors or warnings during the tested flows.

Screenshots are saved locally in ignored output/playwright/. Browser emulation is not a physical-device performance test.
