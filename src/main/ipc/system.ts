import { Notification } from 'electron'
import { type, release, hostname, cpus, totalmem, freemem, uptime } from 'node:os'
import { handle } from './index'
import type { OsInfo } from '../../shared/ipc'

/** 系统能力：原生通知 + 操作系统信息 */
export function registerSystemHandlers(): void {
  handle('system:notify', (_event, { title, body }) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show()
    }
  })

  handle('system:getOsInfo', (): OsInfo => {
    const list = cpus()
    return {
      type: type(),
      release: release(),
      arch: process.arch,
      hostname: hostname(),
      cpu: list[0]?.model ?? 'unknown',
      cpuCount: list.length,
      totalMem: totalmem(),
      freeMem: freemem(),
      uptime: uptime()
    }
  })
}
