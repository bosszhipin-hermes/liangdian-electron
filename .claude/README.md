# .claude — 项目级 Claude Code 配置

本项目（liangdian-electron）随仓库纳管的 Claude Code 工程化配置。
除 `settings.local.json`（机器相关，已 gitignore）外，以下目录都入库、随项目共享：

| 目录 | 作用 | 文件约定 |
|---|---|---|
| `commands/` | 自定义 slash 命令 | 每个 `.md` 一个命令，文件名即命令名（`build.md` → `/build`） |
| `agents/`   | 自定义子代理 subagent | 每个 `.md` 一个，frontmatter：`name` / `description` / `tools` |
| `skills/`   | 自定义技能 skill | 每个技能一个子目录，含 `SKILL.md`（frontmatter：`name` / `description`） |
| `rules/`    | 项目开发约定 / 规范 | Markdown 文档，供 CLAUDE.md 或团队引用 |

> 目前为骨架（各目录留 `.gitkeep` 占位），后续按需填充。
