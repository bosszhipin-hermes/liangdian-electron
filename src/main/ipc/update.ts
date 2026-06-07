import { app, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import { handle, sendToWindow } from './index'
import type { UpdateStatus } from '../../shared/ipc'

/** 把更新状态广播给所有窗口（复用类型安全事件推送） */
function broadcast(status: UpdateStatus): void {
  for (const win of BrowserWindow.getAllWindows()) {
    sendToWindow(win, 'update:status', status)
  }
}

let wired = false
function wireAutoUpdater(): void {
  if (wired) return
  wired = true

  autoUpdater.autoDownload = false // 发现新版本后由用户在 UI 触发下载
  autoUpdater.autoInstallOnAppQuit = true // 退出时自动安装已下好的更新
  // 开发环境强制读取 dev-app-update.yml，方便本地联调整个更新流程
  if (!app.isPackaged) autoUpdater.forceDevUpdateConfig = true

  autoUpdater.on('checking-for-update', () => broadcast({ state: 'checking' }))
  autoUpdater.on('update-available', (info) =>
    broadcast({
      state: 'available',
      version: info.version,
      releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : undefined
    })
  )
  autoUpdater.on('update-not-available', (info) =>
    broadcast({ state: 'not-available', version: info.version })
  )
  // download-progress：差分增量下载时同样会逐块上报进度
  autoUpdater.on('download-progress', (p) =>
    broadcast({
      state: 'downloading',
      percent: p.percent,
      transferred: p.transferred,
      total: p.total,
      bytesPerSecond: p.bytesPerSecond
    })
  )
  autoUpdater.on('update-downloaded', (info) =>
    broadcast({ state: 'downloaded', version: info.version })
  )
  autoUpdater.on('error', (err) =>
    broadcast({ state: 'error', message: err instanceof Error ? err.message : String(err) })
  )
}

/**
 * 应用更新 handler。
 * - 全量更新：首次或无 blockmap 时下载完整安装包
 * - 增量更新：electron-updater 依据旧版本的 .blockmap 仅下载变化块（自动）
 */
export function registerUpdateHandlers(): void {
  wireAutoUpdater()

  handle('update:check', async () => {
    try {
      await autoUpdater.checkForUpdates()
    } catch (e) {
      broadcast({ state: 'error', message: e instanceof Error ? e.message : String(e) })
    }
  })

  handle('update:download', async () => {
    try {
      await autoUpdater.downloadUpdate()
    } catch (e) {
      broadcast({ state: 'error', message: e instanceof Error ? e.message : String(e) })
    }
  })

  handle('update:install', () => {
    // 立即退出并安装（全量或已合并的增量包）
    autoUpdater.quitAndInstall()
  })
}
