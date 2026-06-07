import { BrowserWindow } from 'electron'
import { handle } from './index'

/** 窗口控制相关 handler（供自绘标题栏调用） */
export function registerWindowHandlers(): void {
  handle('window:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  handle('window:toggleMaximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return false
    if (win.isMaximized()) {
      win.unmaximize()
      return false
    }
    win.maximize()
    return true
  })

  handle('window:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })
}
