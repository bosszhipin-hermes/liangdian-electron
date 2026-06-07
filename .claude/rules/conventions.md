# 工程约定

## 提交信息
中文，`type: 简述`（feat / fix / refactor / chore / docs），正文可补动机。
结尾固定附：`Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`。
仅在用户要求时提交 / 推送。

## 目录
- 主进程逻辑按域拆到 `src/main/ipc/<域>.ts`，不要全堆在 `main/index.ts`。
- 共享类型放 `src/shared/`，用 `@shared` 别名引用。
- 渲染层组件用 `<script setup lang="ts">`，别名 `@renderer`。

## 代码
- TypeScript 全覆盖；改动后 `npm run typecheck` 必须零错误。
- 不随意加运行时依赖；图标、安装包品牌图等资源用 `scripts/` 下零依赖脚本生成并入库。
- 平台差异显式分支（`process.platform`），新增系统能力同时考虑 Windows 与 macOS。

## 版本化
整个 `admin` 目录即仓库根，远程 `bosszhipin-hermes/liangdian-electron`。
`.claude/`（除 `settings.local.json`）随仓库版本化，clone 即带全套工具链。
