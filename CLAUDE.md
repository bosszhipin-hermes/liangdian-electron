# liangdian-electron

针对「两点 · 前端开发工程师(Electron)」岗位定制的 Electron + Vue3 桌面应用演示，
同时作为后续同类 JD demo 的**模板工程**。

## 技术栈
electron-vite · Vue3 + TypeScript · electron-builder · electron-updater

## 进程与目录
- `src/main/` 主进程；各能力域 handler 拆在 `src/main/ipc/<域>.ts`
- `src/preload/` 预加载，经 `contextBridge` 暴露 `window.api`
- `src/renderer/` Vue3 渲染层（`@renderer` 别名）
- `src/shared/ipc.ts` IPC 契约 —— 三端共享的单一事实来源（`@shared` 别名）

## 项目铁律（务必遵守）
@.claude/rules/electron-security.md
@.claude/rules/ipc-contract.md
@.claude/rules/conventions.md

## 常用命令（slash）
- `/add-ipc <能力>` —— 按契约四步新增一个 IPC 能力域
- `/release <版本>` —— 发版并触发 CI 发布到 GitHub Releases
- `/new-jd-demo <公司> <技术>` —— 按命名规范起一个新 JD demo 仓库

## 常用子代理
- `electron-reviewer` —— 审查主进程安全基线 / IPC 类型安全 / 跨平台
- `ipc-contract-guard` —— 校验 IPC 契约在四端是否一致

## 验证
改动后跑 `npm run typecheck` 与 `npm run build`，均需零错误。
