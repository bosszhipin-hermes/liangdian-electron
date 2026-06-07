import { nativeTheme, BrowserWindow } from 'electron'
import { handle, sendToWindow } from './index'
import type { ThemeState } from '../../shared/ipc'

function currentTheme(): ThemeState {
  return {
    source: nativeTheme.themeSource,
    shouldUseDarkColors: nativeTheme.shouldUseDarkColors
  }
}

/** 系统主题：读取 / 设置 + 系统主题变化广播给所有窗口 */
export function registerThemeHandlers(): void {
  handle('theme:get', (): ThemeState => currentTheme())

  handle('theme:set', (_event, source): ThemeState => {
    nativeTheme.themeSource = source
    return currentTheme()
  })

  // 系统明暗变化（如跟随系统时用户切换了系统主题）→ 推送给所有窗口
  nativeTheme.on('updated', () => {
    const state = currentTheme()
    for (const win of BrowserWindow.getAllWindows()) {
      sendToWindow(win, 'theme:changed', state)
    }
  })
}
