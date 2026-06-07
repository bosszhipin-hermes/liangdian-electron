# liangdian-electron

针对 **「两点 · 前端开发工程师（Electron）」** 岗位定制的能力演示项目。

Electron + Vue3 + TypeScript 跨平台桌面应用工程。

## 技术栈

- **Electron** — 桌面应用运行时（Windows / macOS）
- **Vue 3 + Vite** — 渲染层（基于 electron-vite）
- **TypeScript** — 全链路类型
- **electron-builder** — 打包 / 自定义安装界面（NSIS）
- **electron-updater** — 全量更新 + 差分增量更新

## 目录结构

```
liangdian-electron/
├── src/
│   ├── main/        # 主进程
│   ├── preload/     # 预加载脚本（contextBridge 安全桥接）
│   └── renderer/    # Vue3 渲染层
├── electron.vite.config.ts
├── package.json
└── tsconfig*.json
```

## 常用命令

```bash
npm install        # 安装依赖
npm run dev        # 开发模式
npm run build      # 构建
npm run build:win  # 打包 Windows
npm run build:mac  # 打包 macOS
```

## 路线图

- [x] 第一步：工程骨架（electron-vite + Vue3 + TS）
- [x] 第二步：类型安全 IPC 通信架构（契约 + 泛型封装 + 自绘标题栏）
- [x] 第三步：系统能力封装（通知/对话框/剪贴板/自启/主题/Shell）
- [x] 第四步：electron-builder 打包配置（Win/Mac，图标自动生成，mac 已本地验证）
- [x] 第五步：自定义安装界面（NSIS：许可页/品牌图/多语言/安装钩子，CI 构建 .exe）
- [ ] 第六步：全量 + 增量更新系统（electron-updater）
