# 哈达铺红军街 3D 互动地图

[在线体验](https://leizhidong-creator.github.io/Red-Army-Street/)

以“哈达铺红军街空间故事线”手绘地图为入口，在线查看红军门、同善社、邮政代办所、关帝庙、张家大院五处革命旧址的实时 3D 模型与历史故事。

## 功能

- 地图地名微光热点与键盘访问
- GLB 模型旋转、缩放、重置视角和全屏查看
- 基于模型包围盒的自动居中、落地与相机构图
- 桌面和移动端自适应详情布局
- GitHub Actions 自动测试、构建和部署 Pages

## 本地运行

```powershell
pnpm install
pnpm dev
```

完整验证：

```powershell
pnpm test --run
pnpm lint
pnpm build
pnpm verify
```

网页运行时只打包地图、长城水彩背景与五个 GLB。原始 DOCX 和建模参考照片不进入公开站点。
