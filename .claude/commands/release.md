---
description: 发版：更新版本号、打 tag、推送触发 CI 发布到 GitHub Releases
argument-hint: <版本号，如 1.1.0>
---
为本项目发布版本 **$ARGUMENTS**：

1. 确认工作区干净，`npm run typecheck` 通过。
2. 把 `package.json` 的 `version` 改为 `$ARGUMENTS`。
3. 提交：`chore: release v$ARGUMENTS`（附 Co-Authored-By）。
4. 打标签：`git tag v$ARGUMENTS`。
5. 推送：`git push origin main --tags`。

推送 tag 会触发 `.github/workflows/build.yml`，在 Windows / macOS runner 上打包，并以
`--publish onTagOrDraft` 发布到 GitHub Releases（含 `latest*.yml` 与 `.blockmap`，供
electron-updater 做全量 / 增量更新）。

> 推 tag 会触发对外发布。先和我确认版本号无误，再执行第 4、5 步。
