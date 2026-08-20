# TRIPO AI 3D Club · UW–Madison — 招新 H5

面向微信内置浏览器的移动端招新 H5，介绍 UW–Madison TRIPO AI 3D 校园社团。
视觉方向：Titanium Future（黑银钛金属 / 雾面玻璃 / 精密光学）。

- 技术栈：Vite + React + TypeScript，轻量静态站点，全局 CSS。
- 移动优先，适配 320–430px，兼容 iPhone safe-area，支持 prefers-reduced-motion。
- 二维码为原始 `<img>`（未修改，字节一致），支持微信长按识别。
- 完整 Open Graph / Twitter / canonical / favicon metadata，含 1200×630 分享封面。

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
