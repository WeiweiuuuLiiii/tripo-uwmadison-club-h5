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

### 3D 资产清单、来源与许可（`public/models/*.glb`, `public/env/*.hdr`）

场景使用**真实、完整、带 PBR 贴图与法线的 `.glb` 模型**（非球体/方块/线稿占位）。全部为公开、明确许可
的资产，本地打包（不 hotlink）。用 `@gltf-transform/cli optimize`（meshopt 几何 + WebP 贴图，1024/2048）
压缩到移动端预算；缩略图 / Lite 图片由 `scripts/glb-render.mjs` 从这些模型实拍渲染。

| 模型 | 3D 世界中的用途 | 来源 | 许可证 | 优化后 |
|---|---|---|---|---|
| `DamagedHelmet.glb` | **主角**：Zone02 点云→线框→贴图生成；`gallery.webp` | Khronos glTF-Sample-Models（theblueturtle_ / ctxwing） | **CC BY 4.0** | 1.4 MB |
| `RobotExpressive.glb` | **动画角色**：Zone03/04/06/07（Idle/Wave/Dance）；`workflow.webp` | three.js examples（Tomás Laulhé · Quaternius） | **CC0** | 180 KB |
| `LittlestTokyo.glb` | **完整环境场景**：Zone05/07 数字世界；`demo.webp` | three.js examples（Glen Fox） | **CC BY 4.0** | 2.6 MB |
| `ferrari.glb` | 载具：Zone03/05；`roadmap.webp` | three.js examples | three.js examples（MIT 项目内示例资产） | 2.0 MB |
| `ToyCar.glb` | 载具/产品：Zone03/04；`career.webp` | Khronos glTF-Sample-Models | **CC0** | 840 KB |
| `Fox.glb` | 动画角色：Zone03/04（Survey/Walk） | Khronos / three examples（PixelMannen · @tomkranis） | **CC0** | 72 KB |
| `Lantern.glb` | 带底座的道具场景：Zone04 | Khronos glTF-Sample-Models（Microsoft · Frank Galligan） | **CC BY 4.0** | 274 KB |
| `env/studio_1k.hdr` | 全局 IBL 光照 / 金属反射 | Poly Haven | **CC0** | 1.5 MB |

**修改方式**：替换 `public/models/*.glb` 同名文件即可（`Model` / `GenHero` 自动归一化居中）。重新压缩：
`npx gltf-transform optimize in.glb out.glb --compress meshopt --texture-compress webp --texture-size 1024`。
按规范标注：Zone02 主角标 `CONCEPT VISUAL`（示意 AI 生成的完整 3D 资产），管线标 `WORKFLOW EXAMPLE`；
拿到 TRIPO 官方 GLB 后放入 `public/models/` 并把对应标签改为 `TRIPO OFFICIAL SHOWCASE`。

> 模式：默认 `mode-3d`（只要 WebGL 可用）。`?lite=0` 强制 3D，`?lite=1` 强制简洁；页面右上角有可见切换。
> reduce-motion 只降低镜头/粒子运动，不关闭 3D。运行失败临时降级并显示「重试 / 简洁」，**无永久锁定**。
> 安全分支：`immersive-v3`；回退标签：`v4-titanium`。

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

## 图片素材（`public/img/*.webp`）— Lite 模式使用

Lite 模式（简洁页）中的 5 张图**全部由上面的真实 GLB 模型经 `scripts/glb-render.mjs` 实拍渲染**
（三点布光 + HDRI 环境反射，Chrome + `sharp` → WebP），原始宽度 ≥1600px，主体占画面 ≥70%，均带
`<img width height>`（无 CLS）、首屏以外 `loading="lazy"`。**不再包含任何鸡蛋脸 / 方块 / 假窗口 /
线稿占位图**。

| 文件 | 渲染自 | 尺寸 | 大小 |
|---|---|---|---|
| `gallery.webp` | DamagedHelmet（科幻头盔，完整 PBR） | 1600×1600 | ~222 KB |
| `workflow.webp` | RobotExpressive（可动画角色） | 1600×1600 | ~77 KB |
| `roadmap.webp` | ferrari（反光车漆载具） | 1600×1200 | ~76 KB |
| `career.webp` | ToyCar（clearcoat 产品级模型） | 1600×1200 | ~87 KB |
| `demo.webp` | LittlestTokyo（完整城市场景） | 1600×1000 | ~129 KB |

沉浸式 3D 模式直接展示这些模型本身（见上一节资产清单），不使用这些静态图。
重新渲染：`node scripts/glb-render.mjs`（需先 `npm run preview`）。分享封面见 `scripts/share-cover.html`。
