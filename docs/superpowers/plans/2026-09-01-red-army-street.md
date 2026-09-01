# 哈达铺红军街 3D 互动地图实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建并上线一个以手绘地图为入口、五处旧址可打开实时 3D 模型与历史文案的 GitHub Pages 单页应用。

**Architecture:** 使用 Vite React 构建静态站点，`landmarks.js` 作为地图、内容与模型路径的唯一数据源；地图、详情层和模型查看器按职责拆分。模型查看器从每个 GLB 的包围盒推导展示偏移与相机距离，GitHub Actions 构建并部署 `dist`。

**Tech Stack:** React 19、Vite 7、Three.js、React Three Fiber、Drei、Lucide React、Vitest、Testing Library、ESLint、GitHub Actions Pages。

## Global Constraints

- 只开放红军门、邮政代办所、同善社、关帝庙、张家大院五个热点。
- 建模参考照片不进入网页构建产物。
- 地图和长城水彩背景使用用户提供的原始图片。
- 公开路径必须兼容 `/Red-Army-Street/` 子目录。
- 默认模型视图必须显示完整轮廓并保持落地，用户可旋转、缩放、重置和全屏查看。
- 桌面 1366×768、1440×900 与移动端 390×844 均不得出现遮挡或溢出。

---

### Task 1: 项目基础与数据契约

**Files:**
- Create: `package.json`, `vite.config.js`, `eslint.config.js`, `index.html`, `.gitignore`
- Create: `src/data/landmarks.js`
- Test: `src/data/landmarks.test.js`
- Copy: `public/assets/map.jpg`, `public/assets/modal-bg.png`, `public/assets/models/*.glb`

**Interfaces:**
- Produces: `landmarks: Landmark[]` and `assetUrl(relativePath: string): string`。

- [ ] 创建 Vite/Vitest 配置和依赖清单。
- [ ] 先编写数据测试，断言五个唯一地标、坐标范围、GLB 扩展名和必需文案字段。
- [ ] 运行 `pnpm test --run src/data/landmarks.test.js`，确认因模块不存在而失败。
- [ ] 实现 `landmarks.js` 与资源路径解析，再运行同一测试确认通过。
- [ ] 将地图、背景和五个 GLB 复制为 ASCII 文件名；确认没有复制参考照片。

### Task 2: 稳定的模型测量与相机构图

**Files:**
- Create: `src/three/modelFit.js`
- Test: `src/three/modelFit.test.js`
- Create: `src/components/ModelViewer.jsx`

**Interfaces:**
- Produces: `computePresentation(bounds, camera): { offset, target, distance, minDistance, maxDistance }`。
- Consumes: `assetUrl` and landmark model paths。

- [ ] 先编写包围盒居中、落地、有限距离和横竖屏适配的失败测试。
- [ ] 运行 `pnpm test --run src/three/modelFit.test.js` 并确认预期失败。
- [ ] 实现纯函数相机构图，运行测试至通过。
- [ ] 实现 GLB 加载、克隆测量、轨道控制、自动巡展、接触阴影、重置和全屏按钮。
- [ ] 为加载过程、加载失败和 WebGL 画布设置稳定尺寸与可访问文本。

### Task 3: 地图与详情交互

**Files:**
- Create: `src/components/MapStage.jsx`
- Create: `src/components/LandmarkModal.jsx`
- Create: `src/App.jsx`
- Test: `src/App.test.jsx`

**Interfaces:**
- Consumes: `landmarks`, `assetUrl`, `ModelViewer`。
- Produces: 五个热点的键盘/鼠标入口，以及可关闭的详情层。

- [ ] 先编写打开正确标题、关闭详情、五个按钮完整呈现的失败测试。
- [ ] 运行 `pnpm test --run src/App.test.jsx` 并确认预期失败。
- [ ] 实现地图热点、焦点恢复、遮罩/关闭按钮/`Escape` 退出与背景滚动锁定。
- [ ] 实现桌面左右分栏和移动端上下分栏的语义结构。
- [ ] 运行交互测试并确认通过。

### Task 4: 视觉系统与动效

**Files:**
- Create: `src/styles.css`
- Create: `src/main.jsx`

**Interfaces:**
- Consumes: Task 3 的语义 class names 和 `data-landmark-id`。

- [ ] 实现全视口地图构图、红金微光、热点呼吸与悬停反馈。
- [ ] 实现长城背景详情层、透明材质、金线边框、排版和自定义滚动条。
- [ ] 为 `prefers-reduced-motion` 关闭非必要动画。
- [ ] 实现 1366×768、1440×900 与 390×844 的稳定响应式尺寸。

### Task 5: 部署、自动化与验收

**Files:**
- Create: `.github/workflows/deploy-pages.yml`
- Modify: `README.md`
- Create: `scripts/verify-assets.mjs`

**Interfaces:**
- Produces: `pnpm verify`, GitHub Pages workflow and public URL。

- [ ] 编写资源验证脚本，检查地图、背景、五个 GLB 和 `dist` 中的相对路径。
- [ ] 运行 `pnpm test --run`、`pnpm lint`、`pnpm build`、`pnpm verify`。
- [ ] 启动本地预览，在 1366×768、1440×900、390×844 检查地图、五个弹窗和控制台。
- [ ] 对模型画布执行非空像素检查，并抽查旋转、缩放、重置、全屏和 `Escape`。
- [ ] 提交并推送 `main`，等待 GitHub Actions Pages 完成。
- [ ] 从公开 URL 复验首页、地图、背景、五个 GLB 请求和至少一个完整模型交互。

## Self-Review

- 设计说明中的五个热点、照片排除、相机构图、响应式和部署要求均映射到具体任务。
- 无 `TBD`、`TODO` 或未定义接口。
- 数据源、相机构图函数、组件边界和验证命令命名一致。
