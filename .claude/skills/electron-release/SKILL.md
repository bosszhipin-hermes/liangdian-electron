---
name: electron-release
description: electron-builder 打包/签名/公证与 electron-updater 全量/增量更新的知识与排错。当需要打包、出安装包(dmg/nsis)、代码签名、公证、配置或调试自动更新时使用。
---
# Electron 打包与更新

本项目用 electron-builder 打包、electron-updater 自动更新。配置在 `electron-builder.yml`，更新逻辑在 `src/main/ipc/update.ts`。

## 打包
- 命令：`npm run build:mac` / `build:win` / `build:linux`；`build:unpack`（仅 `--dir`，快验证不出安装包）。
- 目标：mac = dmg + zip，win = nsis，linux = AppImage。
- 图标只需 `build/icon.png`（1024²），builder 自动转 icns / ico；由 `scripts/generate-icon.mjs` 生成。
- **`files` 必须用「排除」写法**：electron-vite 的 `externalizeDepsPlugin` 把依赖保持外部，
  漏掉 `node_modules` 生产依赖会让打出来的包跑不起来。
- Windows NSIS 包需在 Windows 或装 wine 才能打；mac 上用 CI（`.github/workflows/build.yml`）产出。

## 自定义安装界面（NSIS）
- `build/installer.nsh`：钩子宏 `customHeader`（向导文案）/ `customInstall` / `customUnInstall`。
- 品牌图：`installerSidebar.bmp`(164×314) + `installerHeader.bmp`(150×57)，24bpp，由 `scripts/generate-installer-assets.mjs` 生成。
- 选项：`license`、多语言 `installerLanguages`、`allowToChangeInstallationDirectory`、`runAfterFinish` 等。

## 代码签名 / 公证
- mac：需 Apple "Developer ID Application" 证书；CI 用 `CSC_LINK` + `CSC_KEY_PASSWORD`，
  公证用 `notarize` + `APPLE_ID` / `APPLE_APP_SPECIFIC_PASSWORD` / `APPLE_TEAM_ID`。
  当前 `notarize: false`，本地无证书会跳过签名（属正常）。
- win：用 `CSC_LINK` 配 `.pfx`；未签名会触发 SmartScreen 警告。

## 全量 vs 增量更新
- 打包生成 `latest.yml` / `latest-mac.yml` + `.blockmap`。
- **全量**：首装或无 blockmap 时下载完整包。
- **增量**：electron-updater 比对旧版本 `.blockmap`，只下载变化块（自动，无需额外代码）。
- 渠道：`publish: github`（owner=bosszhipin-hermes, repo=liangdian-electron）；CI 用
  `--publish onTagOrDraft` 在打 tag 时发到 Releases。
- 状态机：`update:check` → `update-available` → `update:download`（进度事件）→ `update-downloaded` → `update:install`(`quitAndInstall`)。

## 常见问题
- 开发环境报 "dev update config"：`autoUpdater.forceDevUpdateConfig = true` + `dev-app-update.yml`（已配）。
- 更新查不到：确认 GitHub 有对应 tag 的 Release 且含 `latest*.yml`。
- mac 增量失败：确认 zip target 在、blockmap 存在；签名不一致会导致更新被拒。
