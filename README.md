# TRIPO AI 3D Club · UW–Madison — 招新 H5

面向微信内置浏览器的移动端招新 H5，介绍 UW–Madison TRIPO AI 3D 校园社团。
视觉方向：Titanium Future（黑银钛金属 / 雾面玻璃 / 精密光学）。

- 技术栈：Vite + React + TypeScript + Three.js / React-Three-Fiber，轻量静态站点。
- 移动优先，适配 320–430px，兼容 iPhone safe-area，支持 prefers-reduced-motion。
- 二维码为原始 `<img>`（未修改，字节一致），支持微信长按识别。
- 完整 Open Graph / Twitter / canonical / favicon metadata，含 1200×630 分享封面。

## 沉浸式 3D 体验（Guided Cinematic 3D Journey）

打开链接进入一个固定的 WebGL 三维世界：向上滑动镜头沿预设 Catmull-Rom 轨道向前推进，依次穿过
7 个空间节点（PORTAL → GENERATION CORE → PIPELINE → PROJECT LAB → SEMESTER JOURNEY →
OPPORTUNITY DECK → JOIN）。文案、按钮、免责声明和二维码始终是语义化 HTML 叠层，**从不画进
Canvas**。轻触拖动可微调视角但不偏离主线；只滑动、不点击也能看完全部内容。

- **镜头**：文档原生滚动 → `railU()` 重参数化（每节点有停留 plateau）→ 采样 `pathCurve` /
  `lookCurve` 阻尼跟随（`src/immersive/rail.ts`、`Rig.tsx`）。
- **3D 世界**：单个常驻 `<Canvas frameloop="demand">`；点云 → 线框 → 钛金属 PBR 的"生成"英雄模型
  （`src/immersive/hero/`），粒子场、体积光锥、空间网格、全息面板（`fx/`、`zones/`）。
- **性能（微信友好）**：`dpr` 上限 1.5、`antialias:false`、按需渲染 + 滑动后 ~2.2s 心跳、
  `AdaptiveDpr` + `PerformanceMonitor`、隐藏页面暂停、无实时阴影、无后期 Bloom（改用 CSS 扫描线/
  暗角）、无自动播放音频。three 引擎独立异步分包（~226KB gzip），首屏 loader 先绘制（`index.html`
  内联 boot + `src/overlay/Loader.tsx`）。
- **降级模式（Cinematic Lite）**：`src/lib/detectLite.ts` 挂载前检测（WebGL 探针 / 低内存 / 低核数 /
  reduce-motion / saveData / `?lite=1`），运行时另有 3.5s 首帧看门狗 + `contextlost` + `ErrorBoundary`。
  任一触发即回退到黑银 HTML 页（`src/lite/LiteApp.tsx`，即上一版全部文案 / CTA / 二维码 / 免责声明），
  **绝不白屏、不卡死、不阻断报名**。

### 3D 内容来源与真实性

场景中的三维内容全部为**本项目在代码中程序化生成的原创风格化渲染**（位移 icosphere + 生成的钛金属
matcap 贴图 + 点云/线框/PBR 过渡，见 `src/immersive/hero/heroAssets.ts`），**不下载任何外部模型、不用
图库或伪造的社团照片**，因此始终可离线打包、可在微信加载。按规范标注：程序化视觉标 `CONCEPT
VISUAL`，管线示例标 `WORKFLOW EXAMPLE`。若日后拿到 TRIPO 官方 GLB，放入 `public/models/hero.glb`
（Draco/Meshopt），`useHeroModel` 已预留替换位并会改标 `TRIPO OFFICIAL SHOWCASE`（保持相同 API）。

> 上一版黑银静态页（含 5 张 WebP 视觉）完整保留为 Lite 模式（`src/lite/`），下方图片素材说明仍适用于
> Lite。`?lite=1` 可强制进入 Lite；`?lite=0` 强制尝试 3D。安全分支：`immersive-v3`；回退标签：`v4-titanium`。

## 本地开发

    npm install
    npm run dev
    npm run build
    npm run preview

## 部署

默认 base 为 `/tripo-uwmadison-club-h5/`（GitHub Pages 项目站点）。
生产地址：https://weiweiuuuliiii.github.io/tripo-uwmadison-club-h5/

## 字体（自托管，随项目部署，无外部字体链接）

`src/assets/fonts/` 内自托管，`src/styles/fonts.css` 声明：

- **Noto Sans SC**（400 / 700）—— 中文正文/标题。**仅本页所用汉字的子集**（各 ~60KB）。
  来源：Google Fonts（Noto Sans SC，SIL Open Font License 1.1），用 `?text=` 子集接口生成。
- **Space Grotesk**（400 / 500 / 700）—— 英文/数字/编号。来源：`@fontsource/space-grotesk`（OFL 1.1）。
- **IBM Plex Mono**（400 / 500）—— 技术标签/数据。来源：`@fontsource/ibm-plex-mono`（OFL 1.1）。

## 图片素材（`public/img/*.webp`）

全页仅 5 组核心视觉。这些**不是**图库照片，也**不是** TRIPO 官方截图，而是**本项目原创制作的
风格化 3D 技术渲染 / 产品 UI Mockup**（用 SVG/Canvas 绘制后由 Chrome 渲染、`sharp` 转 WebP），
统一为黑银钛金属、低饱和、少量冰蓝高光。源文件见 `scripts/assets/*.html`，可用
`node scripts/gen-assets.mjs` 重新生成。均为下方尺寸 + `<img width height>`（无 CLS），首屏以外全部
`loading="lazy"`。

| 文件 | 用途 | 尺寸 | 大小 |
|---|---|---|---|
| `gallery.webp` | 公司介绍 · 3D 资产样本墙（角色/机械/建筑/生物 + Text·Image→3D） | 760×760 | ~17 KB |
| `workflow.webp` | Experience · 真实工作流（INPUT→GENERATE→REFINE→BUILD） | 640×939 | ~13 KB |
| `roadmap.webp` | 学期路线 · 项目演进档案（v0.1→v1.0） | 620×813 | ~15 KB |
| `career.webp` | 实习机会 · 作品集输出（LIVE DEMO / GITHUB / DECK / CASE STUDY） | 720×648 | ~8 KB |
| `demo.webp` | Demo · 概念化 Demo Day 舞台（大屏 + 模型/代码/交互面板） | 900×506 | ~8 KB |

首屏 3D 视觉为轻量 Canvas 点云球体 + 内部线框网格核心（`src/components/HeroVisual.tsx`），
`prefers-reduced-motion` 时为静态帧，离屏/隐藏时暂停。

> 若日后拿到 TRIPO 官方产品截图 / 官方 3D 生成案例，可直接替换 `public/img/` 中对应文件
> （保持相同尺寸即可），并在此表记录官方来源链接。分享封面见 `scripts/share-cover.html`。
