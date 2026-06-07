# Electron 安全基线

改动主进程 / preload / 窗口配置时必须守住：

1. **上下文隔离**：`webPreferences.contextIsolation: true`，禁用 `nodeIntegration`。
2. **不裸暴露能力**：渲染层只能拿到 preload 经 `contextBridge` 暴露的 `window.api`；
   禁止把 `ipcRenderer` 或 Node 模块整体挂到 `window`。
3. **IPC 白名单**：所有通道在 `src/shared/ipc.ts` 契约登记；handler 用
   `BrowserWindow.fromWebContents(event.sender)` 取来源窗口，不盲信渲染层传入的
   路径 / URL 直接做高危操作（fs、shell、子进程）。
4. **外链**：`setWindowOpenHandler` 一律 `deny` 并用 `shell.openExternal` 交给系统浏览器。
5. **CSP**：`src/renderer/index.html` 配 `Content-Security-Policy`，生产不放开 `unsafe-eval`。
6. **导航限制**：必要时拦截 `will-navigate` / `will-redirect` 到非预期源。
7. **sandbox**：当前 `sandbox: false`（preload 需用 CommonJS 依赖）；若要收紧需先评估 preload 改造。
