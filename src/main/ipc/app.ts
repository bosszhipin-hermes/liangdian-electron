import { app } from 'electron'
import { handle } from './index'
import type { AppInfo } from '../../shared/ipc'

/** 应用 / 运行时信息、开机自启相关 handler */
export function registerAppHandlers(): void {
  handle('app:getInfo', (): AppInfo => {
    return {
      name: app.getName(),
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      versions: {
        electron: process.versions.electron,
        chrome: process.versions.chrome,
        node: process.versions.node,
        v8: process.versions.v8
      }
    }
  })

  // 开机自启：跨平台读写登录项（Windows 注册表 / macOS 登录项）
  handle('app:getAutoLaunch', () => app.getLoginItemSettings().openAtLogin)

  handle('app:setAutoLaunch', (_event, enabled) => {
    app.setLoginItemSettings({ openAtLogin: enabled })
    return app.getLoginItemSettings().openAtLogin
  })
}
