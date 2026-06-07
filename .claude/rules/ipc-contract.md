# IPC 契约与命名规范

## 单一事实来源
所有跨进程通道在 `src/shared/ipc.ts` 登记，main / preload / renderer 共享同一份类型。
**严禁**在任何一端硬编码裸字符串通道名。

## 命名
`域:动作`，小写，冒号分隔：`window:minimize`、`system:notify`、`update:check`。
主→渲染的事件同样登记在 `IpcEventMap`，如 `theme:changed`、`update:status`。

## 两种模式
- **请求/响应**：`IpcInvokeMap` + `ipcMain.handle` / `ipcRenderer.invoke`，经泛型 `handle()` 封装。
- **事件推送**：`IpcEventMap` + `sendToWindow()` / `window.api.on()`，订阅返回取消函数。

## 新增能力的「加法公式」（四步，缺一不可）
1. `src/shared/ipc.ts`：在 `IpcInvokeMap` / `IpcEventMap` 登记通道与类型；要暴露给渲染层则补到 `ExposedApi`。
2. `src/main/ipc/<域>.ts`：用 `handle('域:动作', …)` 实现，导出 `register<域>Handlers()` 并在 `ipc/index.ts` 注册。
3. `src/preload/index.ts`：在 `api.<域>` 下加方法，走 `ipcRenderer.invoke`。
4. 渲染层：`window.api.<域>.<动作>()` 调用，全程类型安全。

> 写错通道名 / 参数 / 返回值 = 编译期报错。这是本项目的核心卖点，任何改动都不得破坏它。
