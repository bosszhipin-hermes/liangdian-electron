import { app } from 'electron'
import { handle } from './index'
import type { AppInfo } from '../../shared/ipc'

/** 应用 / 运行时信息相关 handler */
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
}
