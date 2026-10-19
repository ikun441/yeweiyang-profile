# yeweiyang — 不止于一个维度 / Beyond one dimension

[中文](#中文说明) · [English](#english)

云服务器部署：<http://47.117.149.126:5173/> · [部署与更新说明 / Deployment guide](deploy/README.md)

## 中文说明

一个以项目经历为核心的中英双语个人简历与作品集，使用 **Three.js + GSAP + Vite** 构建。滚动页面时，相机会穿行于五个真实 WebGL 场景，并同步切换配色、排版与项目故事。

### 本地运行

需要 Node.js 20.19+，或 22.12+ 的版本。

```sh
npm ci
npm run dev
npm run check
npm run build
npm run preview
```

开发地址：<http://127.0.0.1:5173/>。构建产物在 `dist/`，使用相对资源路径，兼容 GitHub Pages 子目录及常见静态托管平台。

### 页面与交互

- **首屏**：虹彩金属雕塑、建筑拱门与环绕轨道。
- **流萤**：悬浮财务工作台、数据柱与金币，介绍金融科技毕业作品。
- **语音接入**：纵深声波环与动态波形，展示已合并的 ACGNTTS 开源贡献。
- **机器人生态**：NapCat、NoneBot2、真寻、Yunzai 独立圆形悬浮标识、分层连线和信号传递网络（无正方体底座）；同时提供可访问的 Logo 链接。
- **个人博客**：灰紫 / 豆沙色纸张、印刷纹理和绕书脊依次翻转的自动翻页；翻页会自然反向循环。
- 支持鼠标拖动、方向键旋转、场景导航、中英切换、项目详情、打印简历。
- 可暂停动画，并遵循系统“减少动态效果”偏好。暂停时自动翻页也会停止。
- 提供像素比限制、后台暂停、雾化和场景裁剪；WebGL 不可用时显示静态降级画面。

### 文件维护

| 文件 | 用途 |
| --- | --- |
| `content.js` | 双语简历资料与项目案例 |
| `app.js` | 页面结构、语言切换与交互 |
| `scene.js` | 三维模型、材质、相机及动画 |
| `brands.js` | 四个机器人项目的本地 Logo 与来源链接 |
| `assets/logos/` | 本地标识及双语来源说明 |
| `style.css` | 视觉、响应式和打印样式 |

修改后执行 `npm run check`、`npm run build`，再提交并推送到 `origin/main`。凭据不得写入文件、Git 远程地址或提交。

### 资料与素材来源

- [流萤 Firefly](https://github.com/ikun441/firefly_bot)：根据公开 README 展示功能，未宣称商业上线。
- [ACGNTTS PR #200](https://github.com/xinnan-tech/xiaozhi-esp32-server/pull/200) 和[配置 PR #201](https://github.com/xinnan-tech/xiaozhi-esp32-server/pull/201)：均于 2025-03-07 合并。
- 教育、获奖、实习、机器人功能数量及博客指标由本人提供。
- 三维场景为概念可视化，财务金额为示例数据，不是产品截图。
- 四个项目的标识来源见 [素材说明](assets/logos/README.md)。Yunzai 使用云崽社区文档 GitHub 仓库的标识。
- 几何模型、书页纹理与环境光照在本地生成；Google Fonts 不可用时使用系统字体。

### 验证

已在独立 Edge / Playwright 浏览器中检查 WebGL 场景、项目详情、语言切换、键盘操作、移动端排版和打印样式。浏览器尺寸覆盖 1440×1000、390×844、320×740；模拟尺寸不等于实体设备性能测试。检查截图保存在忽略的 `output/playwright/` 目录。

### 技术参考

- [Fireship 滚动示例](https://github.com/fireship-io/threejs-scroll-animation-demo)：滚动位置驱动相机。
- [CodeItAlone 空间作品集](https://github.com/CodeItAlone/3D-portfolio)：DOM 与 WebGL 分层及空间章节。
- [Three.js RoomEnvironment](https://threejs.org/docs/pages/RoomEnvironment.html) 与 [MeshPhysicalMaterial](https://threejs.org/docs/pages/MeshPhysicalMaterial.html)：环境光照与物理材质。

---

## English

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

- Five real-time 3D installations: iridescent chrome knot and architectural portal; floating financial dashboard, bars and coins; concentric acoustic lenses and animated waveform; connected bot framework network with independent circular project medallions, a protocol-to-framework hierarchy, and moving signals, without cubes; mauve printed book pages that turn sequentially around the spine and reverse smoothly.
- Continuous scroll-driven camera travel through depth, interpolated palettes and cinematic camera banking.
- Drag / arrow-key sculpture rotation, pointer parallax, scene navigation, animated typography and project dialog transitions.
- Chinese / English content, keyboard-operable native dialogs and navigation, motion pause, OS reduced-motion support, print résumé.
- Capped device pixel ratio, visibility-based animation pause, fog and station culling, static fallback if WebGL cannot initialize or loses its context.
- No external 3D models. Geometry, page textures and studio environment are generated locally; project marks are bundled locally with source credits. Google Fonts are optional, with system fallbacks.

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
