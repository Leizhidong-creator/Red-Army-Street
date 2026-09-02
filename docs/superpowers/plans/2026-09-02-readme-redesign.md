# README 合作视觉改版实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 README 顶部改造成太原理工大学与西北师范大学联合项目的 GitHub 深色展陈风格，并补充项目核心价值。

**Architecture:** 使用仓库内的 SVG 横幅统一承载背景、合作关系和 Logo，README 通过相对路径引用本地资源；正文沿用苏州园林项目的居中品牌区、图片叙事、流程图、表格和身份信息结构。

**Tech Stack:** GitHub Flavored Markdown、SVG、现有 Vite + React + Three.js 项目资料。

## Global Constraints

- 合作院校固定为太原理工大学与西北师范大学。
- 横幅使用白底彩色校徽，黄色“×”表达合作关系，外层采用 GitHub 风格深色网格。
- 只引用当前仓库真实存在的地图、背景、GLB、Logo、脚本和在线地址。
- 不修改应用代码、构建配置或运行行为。

---

### Task 1: 合作标识资源

**Files:**
- Create: `public/assets/partners/tyut-emblem.svg`
- Create: `public/assets/partners/tyut-logo-color.png`
- Create: `public/assets/partners/nwnu-logo-hq.jpg`
- Create: `public/assets/partners/collaboration-banner.svg`

- [x] 确认两校 Logo 资源可读取且尺寸足够用于 README。
- [x] 生成白底彩色合作横幅，包含两校名称、黄色合作符号和深色网格外框。
- [x] 用本地图片检查横幅引用的资源路径和尺寸。

### Task 2: README 改版

**Files:**
- Modify: `README.md`

- [x] 添加居中品牌区、合作横幅、徽章、在线体验和首屏地图图。
- [x] 添加英文摘要、项目概览、核心体验和五点项目核心价值。
- [x] 添加技术流程、技术栈、验证命令、目录速览、项目身份、素材边界和 License。
- [x] 所有命令与 `package.json` 一致，所有图片使用仓库内相对路径。

### Task 3: 文档验收

- [x] 扫描 README 中的本地图片、链接和命令，确认目标文件存在。
- [x] 运行 `pnpm test --run`、`pnpm lint`、`pnpm build` 和 `pnpm verify`，确认 README 改动未影响工程。
- [x] 提交 README 与合作资源。
