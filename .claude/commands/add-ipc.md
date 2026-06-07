---
description: 按 IPC 契约四步新增一个能力域（自动守类型安全）
argument-hint: <能力描述，如「读取系统电量」或「最小化到托盘」>
---
请为本项目新增 IPC 能力：**$ARGUMENTS**

严格遵循 `.claude/rules/ipc-contract.md` 的「加法公式」，按顺序完成：

1. `src/shared/ipc.ts`：
   - 设计通道名（`域:动作`）与参数 / 返回类型，登记到 `IpcInvokeMap`；如需主动推送则加到 `IpcEventMap`。
   - 若要暴露给渲染层，在 `ExposedApi` 对应命名空间补方法签名。
2. `src/main/ipc/<域>.ts`（无则新建）：
   - 用泛型 `handle('域:动作', …)` 实现；导出 `register<域>Handlers()` 并在 `src/main/ipc/index.ts` 的 `registerIpcHandlers()` 里注册。
3. `src/preload/index.ts`：在 `api.<域>` 下加方法，走 `ipcRenderer.invoke`。
4. 渲染层：按需接入 `window.api.<域>.<动作>()`。

完成后跑 `npm run typecheck` 与 `npm run build` 确认零错误。
涉及系统 API 时同时考虑 Windows 与 macOS 兼容，遵守 `.claude/rules/electron-security.md`。
