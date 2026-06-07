---
description: 按命名规范起一个新 JD 的定制 demo 仓库
argument-hint: <公司拼音> <核心技术，如 electron / react / fullstack>
---
为新 JD 起一个定制 demo，参数：**$ARGUMENTS**（公司拼音 + 核心技术）。

遵循命名规范 `<公司拼音>-<核心技术>`（详见用户记忆 jd-demo-naming-convention）：

1. 仓库名 = `<公司>-<技术>`，建在 GitHub 组织 `bosszhipin-hermes` 下（`gh repo create`，公开）。
2. 以本工程为模板：复制结构（或精简新建），把 `package.json` 的 `name`、Electron `appId`、
   窗口 / 界面品牌名、`README` 标题统一改为新名字；`.claude/` 工具链一并带过去。
3. `README` 开头注明「针对『某公司 · 某岗位』定制」。
4. 远程 `origin` 指向新仓库，初始提交并推送。

> 创建仓库与推送是对外动作。先和我确认公司全称、岗位与核心技术栈，再执行。
